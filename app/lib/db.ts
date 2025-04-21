// import { PrismaClient } from '@prisma/client/edge'
// import { withAccelerate } from '@prisma/extension-accelerate'
// import * as bcrypt from 'bcryptjs';
// import { ExtractedMetadata, CreateCommentInput } from '@/app/lib/types';


// const prisma = new PrismaClient().$extends(withAccelerate())

// export async function createDocument(data: {
//   title: string;
//   courseId: string;
//   docType: 'EXAM' | 'NOTES' | 'ASSIGNMENT' | 'OTHER_RESOURCES';
//   fileName: string;
//   fileUrl: string;
//   fileType: string;
//   tags: string[];
//   authorId: string;
//   metadata?: ExtractedMetadata;
// }) {
//   return prisma.document.create({
//     data: {
//       title: data.title,
//       courseId: parseInt(data.courseId),
//       docType: data.docType,
//       fileUrl: data.fileUrl,
//       originalFileName: data.fileName,
//       fileType: data.fileType,
//       tags: data.tags,
//       authorId: data.authorId,
//       metadata: data.metadata,
//     },
//   });
// }

// export async function findExistingDocument(fileName: string, authorId: string, courseId: string) {
//   return prisma.document.findFirst({
//     where: {
//       originalFileName: fileName,
//       authorId,
//       courseId: parseInt(courseId),
//     },
//   });
// }

// export async function getAllCourses() {
//   return prisma.course.findMany({
//     select: { id: true, name: true },
//     orderBy: { name: 'asc' },
//   });
// }

// export async function createUser(data: {
//   firstName: string;
//   lastName: string;
//   email: string;
//   password: string;
// }) {
//   const hashedPassword = await bcrypt.hash(data.password, 10); // Hash the password with a salt round of 10
//   return prisma.user.create({
//     data: {
//       email: data.email,
//       password: hashedPassword,
//       name: `${data.firstName} ${data.lastName}`,
//       role: 'STUDENT',
//       joinedDate: new Date(),
//     },
//   });
// }

// //delete comment
// export async function deleteComment(commentId: string, userId: string){
//   console.log('[DB] Deleting comment:', { commentId, userId });

//   const comment = await prisma.comment.findUnique({
//     where: { id: commentId },
//     select: { userId: true },
//   });

//   if (!comment){
//     console.error('[DB] Comment not found:', commentId);
//     throw new Error('Comment not found');
//   }

//   if (comment.userId !== userId){
//     console.error('[DB] Unauthorized: User', userId, 'cannot delete comment', commentId);
//     throw new Error('Unauthorized');
//   }

//   try{
//     const deletedComment = await prisma.comment.delete({
//       where: { id: commentId },
//     });
//     console.log('[DB] Comment deleted:', deletedComment.id);
//     return deletedComment;
//   } catch (error) {
//     console.error('[DB] Error deleting comment:', error);
//     throw error instanceof Error ? error : new Error('Failed to delete comment');
//   }
// }

// export async function findUserByEmail(email: string) {
//   return prisma.user.findUnique({
//     where: { email },
//   });
// }

// export async function createOAuthUser(email: string, name: string, provider: string, providerId: string) {
//   return await prisma.user.create({
//     data: {
//       email,
//       name: name || "Unknown",
//       oauthProvider: provider,
//       oauthId: providerId,
//       role: "STUDENT",
//     },
//   });
// }

// export async function updateUserWithOAuth(email: string, provider: string, providerId: string) {
//   return await prisma.user.update({
//     where: { email },
//     data: {
//       oauthProvider: provider,
//       oauthId: providerId,
//     },
//   });
// }

// // Cleanup Prisma connection (optional, if needed elsewhere)
// export async function disconnect() {
//   await prisma.$disconnect();
// }



// // New functions added for view screen
// export async function getDocumentById(documentId: string) {
//   return prisma.document.findUnique({
//     where: { id: documentId },
//     include: {
//       author: { select: { name: true, email: true } }, // Fetch author details
//       course: { select: { name: true } }, // Fetch course name
//       comments: {
//         include: {
//           user: { select: { name: true, profilePicture: false } }, // Fetch commenter details
//         },
//         orderBy: { createdAt: 'desc' },
//       },
//       ratings: true, // Fetch ratings to calculate average
//     },
//   });
// }

// export async function incrementViewCount(documentId: string) {
//   try {
//     const updatedDocument = await prisma.document.update({
//       where: { id: documentId },
//       data: { viewCount: { increment: 1 } },
//     });
//     console.log(`View count incremented for document ${documentId}: ${updatedDocument.viewCount}`);
//     return updatedDocument;
//   } catch (error) {
//     console.error(`Failed to increment view count for document ${documentId}:`, error);
//     throw error;
//   }
// }

// export async function incrementDownloadCount(documentId: string) {
//   try {
//     const updatedDocument = await prisma.document.update({
//       where: { id: documentId },
//       data: { downloadCount: { increment: 1 } },
//     });
//     console.log(`Download count incremented for document ${documentId}: ${updatedDocument.downloadCount}`);
//     return updatedDocument;
//   } catch (error) {
//     console.error(`Failed to increment download count for document ${documentId}:`, error);
//     throw error;
//   }
// }

// export async function getRelatedDocuments(courseId: number, documentId: string) {
//   return prisma.document.findMany({
//     where: {
//       courseId: courseId,
//       id: { not: documentId }, // Exclude the current document
//     },
//     include: {
//       ratings: true, // Include ratings to calculate average
//       course: { select: { name: true } }, // Include course name
//     },
//     take: 3, // Limit to 3 related documents
//     orderBy: { uploadDate: 'desc' },
//   });
// }

// // Depends on the logic we are implementing for ratings
// export function calculateAverageRating(ratings: { value: number }[]) {
//   if (!ratings || ratings.length === 0) return 0;
//   const total = ratings.reduce((sum, rating) => sum + rating.value, 0);
//   return total / ratings.length;
// }


// // Create a comment
// export async function createComment({ documentId, userId, content }: CreateCommentInput) {
//   try {
//     console.log('[DB] Creating comment:', { documentId, userId, content });

//     //verify document exists
//     const document = await prisma.document.findUnique({
//       where: { id: documentId },
//     });
//     if (!document) {
//       console.error('[DB] Document not found:', documentId);
//       throw new Error('Document not found');
//     }

//     //verify user exists
//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//     });
//     if (!user) {
//       console.error('[DB] User not found:', userId);
//       throw new Error('User not found');
//     }

//     const comment = await prisma.comment.create({
//       data: {
//         content,
//         documentId,
//         userId,
//       },
//       include: {
//         user: { select: { name: true } },
//       },
//     });
//     console.log('[DB] Comment created:', comment);
//     return comment;
//   } catch (error) {
//     console.error('[DB] Error creating comment:', error);
//     throw error instanceof Error ? error : new Error('Failed to create comment');
//   }
// }

// // Get comments for a document
// export async function getCommentsByDocumentId(documentId: string) {
//   return prisma.comment.findMany({
//     where: { documentId },
//     include: {
//       user: { select: { name: true, id: true } },
//     },
//     orderBy: { createdAt: 'desc' },
//   });
// }

// //TO DO
// // Report a comment
// // export async function reportComment({ commentId, userId, reason }: ReportCommentInput) {
// //   return prisma.log.create({
// //     data: {
// //       action: 'REPORT',
// //       userId,
// //       commentId,
// //       details: { reason },
// //       timestamp: new Date(),
// //     },
// //   });
// // }

// export async function saveRating(data: { documentId: string; userId: string; rating: number }) {
//   console.log('[saveRating] Input:', { userId: data.userId, documentId: data.documentId, rating: data.rating });
//   try {
//     // Verify user and document exist
//     const user = await prisma.user.findUnique({ where: { id: data.userId } });
//     if (!user) {
//       console.error('[saveRating] User not found:', data.userId);
//       throw new Error('User not found');
//     }
//     const document = await prisma.document.findUnique({ where: { id: data.documentId } });
//     if (!document) {
//       console.error('[saveRating] Document not found:', data.documentId);
//       throw new Error('Document not found');
//     }

//     const existingRating = await prisma.rating.findFirst({
//       where: {
//         userId: data.userId,
//         documentId: data.documentId,
//       },
//     });
//     console.log('[saveRating] Existing rating:', existingRating);

//     if (existingRating) {
//       console.log('[saveRating] Updating rating:', existingRating.id);
//       await prisma.rating.update({
//         where: { id: existingRating.id },
//         data: {
//           value: data.rating,
//           createdAt: new Date(),
//         },
//       });
//     } else {
//       console.log('[saveRating] Creating new rating');
//       await prisma.rating.create({
//         data: {
//           id: crypto.randomUUID(),
//           userId: data.userId,
//           documentId: data.documentId,
//           value: data.rating,
//           createdAt: new Date(),
//         },
//       });
//     }
//     console.log('[saveRating] Rating saved successfully');
//   } catch (error) {
//     console.error('[saveRating] Error:', {
//       message: error instanceof Error ? error.message : 'Unknown error',
//       stack: error instanceof Error ? error.stack : undefined,
//     });
//     throw error;
//   }
// }

// export async function getRatingsForDocument(documentId: string) {
//   console.log('[getRatingsForDocument] Fetching ratings for document:', documentId);
//   try {
//     const ratings = await prisma.rating.findMany({
//       where: { documentId },
//       select: { value: true },
//     });
//     console.log('[getRatingsForDocument] Found ratings:', ratings.length);
//     return ratings;
//   } catch (error) {
//     console.error('[getRatingsForDocument] Error:', {
//       message: error instanceof Error ? error.message : 'Unknown error',
//       stack: error instanceof Error ? error.stack : undefined,
//     });
//     throw error;
//   }
// }

// app/lib/db.ts
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import * as bcrypt from 'bcryptjs';
import { ExtractedMetadata, CreateCommentInput } from '@/app/lib/types';

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