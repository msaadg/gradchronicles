import { PrismaClient, Prisma } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

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

// Cleanup Prisma connection (optional, if needed elsewhere)
export async function disconnect() {
  await prisma.$disconnect();
}