// api/documents/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'; 
import { getServerSession } from 'next-auth/next'; 
import { NEXT_AUTH } from '@/app/lib/auth'; 
import { getDocumentById, incrementViewCount, incrementDownloadCount, getRelatedDocuments,calculateAverageRating,findUserByEmail, createComment, deleteComment, recordDocumentView} from '@/app/lib/db';


interface ExtractedMetadata {
  fileSize?: number;
  pageCount?: number;
  summary?: string;
  [key: string]: string | number | boolean | null | undefined; // Ensure lowercase 'undefined'
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

//original GET API 
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Extract documentId from URL params (matches [id] folder)
  const { id: documentId } = await params;

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
  // const userId = user.id;

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
      totalRating: doc.ratings.length,
      thumbnailBase64: doc.thumbnailBase64 || null,
    }));

    // Format comments to match frontend expectations
    const formattedComments: CommentResponse[] = document.comments.map((comment) => ({
      id: comment.id,
      author: comment.user.name || 'Anonymous',
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
    // Increment view count
    await incrementViewCount(documentId);
    await recordDocumentView(user.id, documentId);
    // Return successful response
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    // Log and return error for debugging
    console.error('Error fetching document:', error);
    return NextResponse.json({ message: 'Failed to fetch document' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: documentId } = await params;
  const session = await getServerSession(NEXT_AUTH);
  
  if (!session?.user?.email){
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const user = await findUserByEmail(session.user.email);
  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  try{
    const { content } = await req.json();
    
    if (!content) {
      return NextResponse.json({ message: 'Comment content is required' }, { status: 400 });
    }

    const newComment = await createComment({
      documentId,
      userId: user.id,
      content
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ message: 'Failed to create comment' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: documentId } = await params;

  const session = await getServerSession(NEXT_AUTH);
  if (!session?.user?.email){
    console.error('[DELETE] Unauthorized: No session or email');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  console.log('[DELETE] Session user email:', session.user.email);

  const user=await findUserByEmail(session.user.email);
  if (!user){
    console.error('[DELETE] User not found for email:', session.user.email);
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }
  console.log('[DELETE] Found user:', user.id);

  try{
    const { commentId } = await req.json();
    if (!commentId) {
      console.error('[DELETE] Missing commentId in request body');
      return NextResponse.json({ message: 'Comment ID is required' }, { status: 400 });
    }
    console.log('[DELETE] CommentId from body:', commentId);

    //validate documentId exists
    const document = await getDocumentById(documentId);
    if (!document) {
      console.error('[DELETE] Document not found:', documentId);
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    console.log('[DELETE] Deleting comment:', commentId, 'by user:', user.id);
    await deleteComment(commentId, user.id);
    console.log('[DELETE] Comment deleted successfully');
    return NextResponse.json({ message: 'Comment deleted' }, { status: 200 });
  } catch (error) {
    console.error('[DELETE] Error deleting comment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: 'Failed to delete comment', error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: documentId } = await params;

  // Check authentication
  const session = await getServerSession(NEXT_AUTH);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify document exists
    const document = await getDocumentById(documentId);
    if (!document) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    // Increment download count
    await incrementDownloadCount(documentId);

    return NextResponse.json({ message: 'Download count incremented' }, { status: 200 });
  } catch (error: any) {
    console.error('Error incrementing download count:', error.message);
    return NextResponse.json({ message: 'Failed to increment download count', error: error.message }, { status: 500 });
  }
}
