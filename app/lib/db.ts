import { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import * as bcrypt from 'bcryptjs';
import { ExtractedMetadata, Document, Rating, SearchResultType } from '@/app/lib/types';

const prisma = new PrismaClient().$extends(withAccelerate())

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
  const hashedPassword = await bcrypt.hash(data.password, 10); // Hash the password with a salt round of 10
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

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function createOAuthUser(email: string, name: string, provider: string, providerId: string) {
  return await prisma.user.create({
    data: {
      email,
      name: name || "Unknown",
      oauthProvider: provider,
      oauthId: providerId,
      role: "STUDENT",
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

// Ibad + Maarij functions for Search Functionality

// export async function searchDocument(title:string) 
// {
//   return prisma.document.findMany(
//     {
//       where:{
//         title:{contains:title,mode:"insensitive"}
//       }
//     }
//   )
// }

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
    let results = documents.map((doc: Document) => {
      const totalRatings = doc.ratings.length;
      const averageRating =
        totalRatings > 0
          ? doc.ratings.reduce((sum: number, r: Rating) => sum + r.value, 0) / totalRatings
          : 0;

      return {
        id: doc.id,
        title: doc.title,
        course: doc.course.name,
        rating: averageRating,
        totalRatings,
        downloads: doc.downloadCount,
        uploadDate: doc.uploadDate.toISOString().split('T')[0],
        imageUrl: doc.fileUrl, // Placeholder; adjust if thumbnails are available
      };
    }
  );

  // Sort by average rating if sortBy is 'rating'
  if (sortBy === 'rating') {
    results = results.sort((a: SearchResultType, b: SearchResultType) => b.rating - a.rating); // Descending order
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

// Cleanup Prisma connection (optional, if needed elsewhere)
export async function disconnect() {
  await prisma.$disconnect();
}