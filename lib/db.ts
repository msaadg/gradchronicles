import { PrismaClient, Prisma } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient().$extends(withAccelerate())

export async function createDocument(data: {
  title: string;
  course: string;
  fileUrl: string;
  fileType: string;
  tags: string[];
  authorId: string;
  metadata?: Record<string, any>;
}) {
  return prisma.document.create({ data });
}

export async function findDocumentByTitleAndAuthor(title: string, authorId: string, course: string) {
  return prisma.document.findFirst({
    where: { title, authorId, course },
  });
}

// Cleanup Prisma connection (optional, if needed elsewhere)
export async function disconnect() {
  await prisma.$disconnect();
}