// api/documents/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'; 
import { getServerSession } from 'next-auth/next'; 
import { NEXT_AUTH } from '@/app/lib/auth'; 
import { getDocumentById,incrementViewCount, incrementDownloadCount, getRelatedDocuments,calculateAverageRating,findUserByEmail} from '@/app/lib/db';

// Interface for metadata to type the Json field
interface ExtractedMetadata {
  fileSize?: number;
  pageCount?: number;
  summary?: string;
  [key: string]: any; // Allow other dynamic properties in metadata
}

// Response interfaces for type safety
interface DocumentResponse {
  id: string;
  title: string;
  author: string | null; // Allow null to match Prisma's nullable User.name
  course: string;
  uploadDate: string;
  tags: string[];
  fileUrl: string;
  fileType: string;
  originalFileName: string; 
  fileSize: number;
  averageRating: number;
}

interface CommentResponse {
  id: string;
  author: string;
  time: string;
  content: string;
  canDelete: boolean;
  // avatar: string;
}

interface RelatedDocResponse {
  id: string;
  title: string;
  course: string; // Use course name, not ID
  rating: number;
  totalRating: number;
}

interface ViewDocumentResponse {
  document: DocumentResponse;
  comments: CommentResponse[];
  relatedDocuments: RelatedDocResponse[];
}

/**
 * GET /api/documents/[id]
 * Fetches document details, comments, and related documents by document ID.
 * Increments view count and requires user authentication.
 * @param req - Next.js request object
 * @param params - Dynamic route params containing the document ID
 * @returns JSON response with document details, comments, and related documents
 */

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  // Extract documentId from URL params (matches [id] folder)
  const { id: documentId } = params;

  // Check for user session to ensure only authenticated users can view documents
  const session = await getServerSession(NEXT_AUTH);
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userEmail = session.user.email;
  const user = await findUserByEmail(userEmail);
  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }
  const userId = user.id;

  try {
    
    // Fetch document details, including author, course, comments, and ratings
    const document = await getDocumentById(documentId);
    if (!document) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    // Calculate average rating for the document
    const averageRating = calculateAverageRating(document.ratings); // Synchronous, no await needed

    // Fetch related documents from the same course (excluding current document)
    const relatedDocuments = await getRelatedDocuments(document.courseId, documentId);
    const relatedDocsWithRatings: RelatedDocResponse[] = relatedDocuments.map((doc) => ({
      id: doc.id,
      title: doc.title,
      course: doc.course.name, // Use course name from Course model
      rating: calculateAverageRating(doc.ratings),
      totalRating: 5, // Max rating is 5 stars
    }));

    // Format comments to match frontend expectations
    const formattedComments: CommentResponse[] = document.comments.map((comment) => ({
      id: comment.id,
      author: `${comment.user.name || 'Anonymous'}, ${document.course.name} Student`,
      time: comment.createdAt.toISOString(), // TODO: Consider date-fns for "X hours ago" format
      content: comment.content,
      canDelete: comment.userId === user.id, // Compare with user.id from database
      // avatar: comment.user.profilePicture || '/default-avatar.png', // Default avatar fallback
    }));

    // Prepare the response object
    const response: ViewDocumentResponse = {
      document: {
        id: document.id,
        title: document.title,
        author: document.author.name, // Nullable per User.name in schema
        course: document.course.name,
        uploadDate: document.uploadDate.toISOString(),
        tags: document.tags,
        fileUrl: document.fileUrl,
        fileType: document.fileType,
        fileSize: (document.metadata as ExtractedMetadata | null)?.fileSize || 0, // Type metadata with fallback
        averageRating: averageRating || 0,
        originalFileName: document.originalFileName || document.title, // Fallback to title if original name is not available
      },
      comments: formattedComments,
      relatedDocuments: relatedDocsWithRatings,
    };

    // Increment the document's view count
    console.log(`Incrementing view count for document ${documentId}`);
    await incrementViewCount(documentId);

    console.log(`Incrementing download count for document ${documentId}`);
    await incrementDownloadCount(documentId);

    // Return successful response
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    // Log and return error for debugging
    console.error('Error fetching document:', error);
    return NextResponse.json({ message: 'Failed to fetch document' }, { status: 500 });
  }
}