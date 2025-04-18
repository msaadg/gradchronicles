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

// Cleanup Prisma connection (optional, if needed elsewhere)
export async function disconnect() {
  await prisma.$disconnect();
}
// New functions added for view screen
export async function getDocumentById(documentId: string) {
  return prisma.document.findUnique({
    where: { id: documentId },
    include: {
      author: { select: { name: true, email: true } }, // Fetch author details
      course: { select: { name: true } }, // Fetch course name
      comments: {
        include: {
          user: { select: { name: true, profilePicture: true } }, // Fetch commenter details
        },
        orderBy: { createdAt: 'desc' },
      },
      ratings: true, // Fetch ratings to calculate average
    },
  });
}

export async function incrementViewCount(documentId: string) {
  return prisma.document.update({
    where: { id: documentId },
    data: { viewCount: { increment: 1 } },
  });
}

export async function getRelatedDocuments(courseId: number, documentId: string) {
  return prisma.document.findMany({
    where: {
      courseId: courseId,
      id: { not: documentId }, // Exclude the current document
    },
    include: {
      ratings: true, // Include ratings to calculate average
      course: { select: { name: true } }, // Include course name
    },
    take: 2, // Limit to 2 related documents
    orderBy: { uploadDate: 'desc' },
  });
}

// Depends on the logic we are implementing for ratings
export function calculateAverageRating(ratings: { value: number }[]) {
  if (!ratings || ratings.length === 0) return 0;
  const total = ratings.reduce((sum, rating) => sum + rating.value, 0);
  return total / ratings.length;
}