import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import * as bcrypt from 'bcryptjs';
import { ExtractedMetadata } from '@/app/lib/types';

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
  thumbnailUrl?: string;
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
      thumbnailUrl: data.thumbnailUrl,
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

export async function getRecentlyViewedDocuments(userId: string, limit: number = 3) {
  return prisma.documentView.findMany({
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
          thumbnailUrl: true,
        },
      },
    },
  }).then(views =>
    views.map(view => {
      const ratings = view.document.ratings;
      const avgRating = ratings.length
        ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
        : 0;
      return {
        id: view.document.id,
        title: view.document.title,
        course: view.document.course.name,
        rating: parseFloat(avgRating.toFixed(1)),
        totalRating: ratings.length || 5, // Use count of ratings or default to 5
        imageUrl: view.document.thumbnailUrl || '/default-thumbnail.png', // Fallback image
      };
    })
  );
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
  const courseMap = new Map<number, any>();
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

// Cleanup Prisma connection (optional, if needed elsewhere)
export async function disconnect() {
  await prisma.$disconnect();
}