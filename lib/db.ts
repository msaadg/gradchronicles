import { PrismaClient, Prisma } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import * as bcrypt from 'bcryptjs';

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
  metadata?: Record<string, any>;
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