// lib/db.ts
import { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import * as bcrypt from 'bcryptjs';
import { CourseRecommendation, ExtractedMetadata, CreateCommentInput } from '@/app/lib/types';

const prisma = new PrismaClient().$extends(withAccelerate());

// Existing functions (unchanged, included for context)
export async function createDocument(data: {
  title: string;
  courseId: string;
  docType: 'EXAM' | 'NOTES' | 'ASSIGNMENT' | 'OTHER_RESOURCES';
  fileName: string;
  fileUrl: string;
  fileType: string;
  tags: string[];
  authorId: string;
  metadata?: ExtractedMetadata;
  thumbnailBase64?: string | null;
}) {
  return prisma.document.create({
    data: {
      title: data.title,
      courseId: parseInt(data.courseId),
      docType: data.docType,
      fileUrl: data.fileUrl,
      originalFileName: data.fileName,
      fileType: data.fileType,
      tags: data.tags,
      authorId: data.authorId,
      metadata: data.metadata,
      thumbnailBase64: data.thumbnailBase64 ?? null,
    },
  });
}

export async function findExistingDocument(fileName: string, authorId: string, courseId: string) {
  return prisma.document.findFirst({
    where: {
      originalFileName: fileName,
      authorId,
      courseId: parseInt(courseId),
    },
  });
}

export async function getAllCourses() {
  return prisma.course.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
}

export async function createUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: `${data.firstName} ${data.lastName}`,
      role: 'STUDENT',
      joinedDate: new Date(),
    },
  });
}

export async function deleteComment(commentId: string, userId: string) {
  console.log('[DB] Deleting comment:', { commentId, userId });
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  });

  if (!comment) {
    console.error('[DB] Comment not found:', commentId);
    throw new Error('Comment not found');
  }

  if (comment.userId !== userId) {
    console.error('[DB] Unauthorized: User', userId, 'cannot delete comment', commentId);
    throw new Error('Unauthorized');
  }

  try {
    const deletedComment = await prisma.comment.delete({
      where: { id: commentId },
    });
    console.log('[DB] Comment deleted:', deletedComment.id);
    return deletedComment;
  } catch (error) {
    console.error('[DB] Error deleting comment:', error);
    throw error instanceof Error ? error : new Error('Failed to delete comment');
  }
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function createOAuthUser(email: string, name: string, provider: string, providerId: string) {
  return await prisma.user.create({
    data: {
      email,
      name: name || 'Unknown',
      oauthProvider: provider,
      oauthId: providerId,
      role: 'STUDENT',
    },
  });
}

export async function updateUserWithOAuth(email: string, provider: string, providerId: string) {
  return await prisma.user.update({
    where: { email },
    data: {
      oauthProvider: provider,
      oauthId: providerId,
    },
  });
}

export async function getRecentlyViewedDocuments(userId: string, limit: number = 3) {
  const views = await prisma.documentView.findMany({
    where: { userId },
    orderBy: { viewedAt: 'desc' },
    take: limit,
    select: {
      document: {
        select: {
          id: true,
          title: true,
          course: { select: { name: true } },
          ratings: { select: { value: true } },
          thumbnailBase64: true,
        },
      },
    },
  });

  const documents = views.map((view) => {
    const ratings = view.document.ratings;
    const avgRating = ratings.length
      ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
      : 0;

    return {
      id: view.document.id,
      title: view.document.title,
      course: view.document.course.name,
      rating: parseFloat(avgRating.toFixed(1)),
      totalRating: ratings.length || 0,
      imageBase64: view.document.thumbnailBase64,
    };
  });

  return documents;
}

export async function recordDocumentView(userId: string, documentId: string) {
  return prisma.documentView.create({
    data: {
      userId,
      documentId,
      viewedAt: new Date(),
    },
  });
}

export async function getRecommendedCourses(userId: string, limit: number = 3) {
  const viewedCourses = await prisma.documentView.findMany({
    where: { userId },
    orderBy: { viewedAt: 'desc' },
    take: 10, // Consider more views for broader recommendations
    select: {
      document: {
        select: {
          course: {
            select: {
              id: true,
              name: true,
              documents: {
                select: {
                  docType: true,
                  ratings: { select: { value: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  // Extract unique courses and compute metrics
  const courseMap = new Map<number, CourseRecommendation>();
  viewedCourses.forEach(view => {
    const course = view.document.course;
    if (!courseMap.has(course.id)) {
      const documents = course.documents;
      const notesCount = documents.filter(d => d.docType === 'NOTES').length;
      const examsCount = documents.filter(d => d.docType === 'EXAM').length;
      const assignmentsCount = documents.filter(d => d.docType === 'ASSIGNMENT').length;
      const otherCount = documents.filter(d => d.docType === 'OTHER_RESOURCES').length;
      const ratings = documents.flatMap(d => d.ratings);
      const avgRating = ratings.length
        ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
        : 0;

      courseMap.set(course.id, {
        id: course.id,
        title: course.name,
        course: `${notesCount} Notes, ${examsCount} Exams, ${assignmentsCount} Assignments, ${otherCount} Other`,
        rating: parseFloat(avgRating.toFixed(1)),
        totalRating: ratings.length || 5, // Use count of ratings or default to 5
      });
    }
  });

  // Return up to `limit` courses
  return Array.from(courseMap.values()).slice(0, limit);
}

// New search function
export async function searchDocuments({
  query = '',
  courseId,
  docType,
  minRating,
  sortBy = 'newest',
  page = 1,
  pageSize = 9,
}: {
  query?: string;
  courseId?: string;
  docType?: 'EXAM' | 'NOTES' | 'ASSIGNMENT' | 'OTHER_RESOURCES';
  minRating?: number;
  sortBy?:  'newest' | 'oldest' | 'downloads' | 'views' | 'rating';
  page?: number;
  pageSize?: number;
}) {
  // const where: any = {};
  const where: Prisma.DocumentWhereInput = {};

  // Search by title, course name, or tags
  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { course: { name: { contains: query, mode: 'insensitive' } } },
      { tags: { hasSome: [query] } },
    ];
  }

  // Filter by courseId
  if (courseId) {
    where.courseId = parseInt(courseId);
  }

  // Filter by document type
  if (docType) {
    where.docType = docType;
  }

  // Filter by minimum rating
  if (minRating) {
    where.ratings = {
      some: {
        value: { gte: minRating },
      },
    };
  }

  // Sorting logic
  // const orderBy: any = {};
  const orderBy: Prisma.DocumentOrderByWithRelationInput = {};
  switch (sortBy) {
    case 'newest':
      orderBy.uploadDate = 'desc';
      break;
    case 'oldest':
      orderBy.uploadDate = 'asc';
      break;
    case 'downloads':
      orderBy.downloadCount = 'desc';
      break;
    case 'views':
      orderBy.viewCount = 'desc';
      break;
    case 'rating':
      // Temporarily fallback to uploadDate; we'll sort by average rating later
      orderBy.uploadDate = 'desc';
      break;
    default:
      orderBy.uploadDate = 'desc';
      break;
  }

  // Pagination
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  // Fetch documents
  const documents = await prisma.document.findMany({
    where,
    orderBy,
    skip,
    take,
    include: {
      course: { select: { name: true } },
      ratings: true,
      author: { select: { name: true } },
    },
  });

  // Calculate average rating and prepare results
    let results = documents.map((doc) => {
      const totalRatings = doc.ratings.length;
      const averageRating =
        totalRatings > 0
          ? doc.ratings.reduce((sum, r) => sum + r.value, 0) / totalRatings
          : 0;

      return {
        id: doc.id,
        title: doc.title,
        course: doc.course,
        rating: averageRating,
        totalRatings,
        downloads: doc.downloadCount,
        uploadDate: doc.uploadDate.toISOString().split('T')[0],
        thumbnailBase64: doc.thumbnailBase64 || null,
      };
    }
  );

  // Sort by average rating if sortBy is 'rating'
  if (sortBy === 'rating') {
    results = results.sort((a, b) => b.rating - a.rating); // Descending order
  }

  // Get total count for pagination
  const total = await prisma.document.count({ where });

  return {
    results,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getDocumentById(documentId: string) {
  return prisma.document.findUnique({
    where: { id: documentId },
    include: {
      author: { select: { name: true, email: true } },
      course: { select: { name: true } },
      comments: {
        include: {
          user: { select: { name: true, profilePicture: false } },
        },
        orderBy: { createdAt: 'desc' },
      },
      ratings: true,
    },
  });
}

export async function incrementViewCount(documentId: string) {
  try {
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: { viewCount: { increment: 1 } },
    });
    console.log(`View count incremented for document ${documentId}: ${updatedDocument.viewCount}`);
    return updatedDocument;
  } catch (error) {
    console.error(`Failed to increment view count for document ${documentId}:`, error);
    throw error;
  }
}

export async function incrementDownloadCount(documentId: string) {
  try {
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: { downloadCount: { increment: 1 } },
    });
    console.log(`Download count incremented for document ${documentId}: ${updatedDocument.downloadCount}`);
    return updatedDocument;
  } catch (error) {
    console.error(`Failed to increment download count for document ${documentId}:`, error);
    throw error;
  }
}

export async function getRelatedDocuments(courseId: number, documentId: string) {
  return prisma.document.findMany({
    where: {
      courseId: courseId,
      id: { not: documentId },
    },
    include: {
      ratings: true,
      course: { select: { name: true } },
    },
    take: 3,
    orderBy: { uploadDate: 'desc' },
  });
}

export function calculateAverageRating(ratings: { value: number }[]) {
  if (!ratings || ratings.length === 0) return 0;
  const total = ratings.reduce((sum, rating) => sum + rating.value, 0);
  const average = total / ratings.length;
  return Number(average.toFixed(1));
}

export async function createComment({ documentId, userId, content }: CreateCommentInput) {
  try {
    console.log('[DB] Creating comment:', { documentId, userId, content });
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!document) {
      console.error('[DB] Document not found:', documentId);
      throw new Error('Document not found');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      console.error('[DB] User not found:', userId);
      throw new Error('User not found');
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        documentId,
        userId,
      },
      include: {
        user: { select: { name: true } },
      },
    });
    console.log('[DB] Comment created:', comment);
    return comment;
  } catch (error) {
    console.error('[DB] Error creating comment:', error);
    throw error instanceof Error ? error : new Error('Failed to create comment');
  }
}

export async function getCommentsByDocumentId(documentId: string) {
  return prisma.comment.findMany({
    where: { documentId },
    include: {
      user: { select: { name: true, id: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function saveRating(data: { documentId: string; userId: string; rating: number }) {
  console.log('[saveRating] Input:', { userId: data.userId, documentId: data.documentId, rating: data.rating });
  try {
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      console.error('[saveRating] User not found:', data.userId);
      throw new Error('User not found');
    }
    const document = await prisma.document.findUnique({ where: { id: data.documentId } });
    if (!document) {
      console.error('[saveRating] Document not found:', data.documentId);
      throw new Error('Document not found');
    }

    const existingRating = await prisma.rating.findFirst({
      where: {
        userId: data.userId,
        documentId: data.documentId,
      },
    });
    console.log('[saveRating] Existing rating:', existingRating);

    if (existingRating) {
      console.log('[saveRating] Updating rating:', existingRating.id);
      await prisma.rating.update({
        where: { id: existingRating.id },
        data: {
          value: data.rating,
          createdAt: new Date(),
        },
      });
    } else {
      console.log('[saveRating] Creating new rating');
      await prisma.rating.create({
        data: {
          id: crypto.randomUUID(),
          userId: data.userId,
          documentId: data.documentId,
          value: data.rating,
          createdAt: new Date(),
        },
      });
    }
    console.log('[saveRating] Rating saved successfully');
  } catch (error) {
    console.error('[saveRating] Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

export async function getRatingsForDocument(documentId: string) {
  console.log('[getRatingsForDocument] Fetching ratings for document:', documentId);
  try {
    const ratings = await prisma.rating.findMany({
      where: { documentId },
      select: { value: true },
    });
    console.log('[getRatingsForDocument] Found ratings:', ratings.length);
    return ratings;
  } catch (error) {
    console.error('[getRatingsForDocument] Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

// New function for document preview
export async function getDocumentForPreview(documentId: string) {
  try {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        title: true,
        fileUrl: true,
        fileType: true,
        originalFileName: true,
        authorId: true,
      },
    });
    if (!document) {
      console.error('[DB] Document not found:', documentId);
      throw new Error('Document not found');
    }
    console.log('[DB] Fetched document for preview:', document.id);
    return document;
  } catch (error) {
    console.error('[DB] Error fetching document for preview:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch document');
  }
}

export async function disconnect() {
  await prisma.$disconnect();
}