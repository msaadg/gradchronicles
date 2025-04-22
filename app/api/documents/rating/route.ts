// app/api/documents/ratng/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { NEXT_AUTH } from '@/app/lib/auth';
import { findUserByEmail, getDocumentById, saveRating, getRatingsForDocument } from '@/app/lib/db';

export async function POST(req: NextRequest) {
    // Parse request body
    const { id, rating } = await req.json();
  
    // Validate inputs
    if (!id || !rating) {
      return new NextResponse('Invalid request', { status: 400 });
    }
  
    // Fetch user session
    const session = await getServerSession(NEXT_AUTH);
    if (!session || !session.user || !session.user.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  
    // Get user ID based on email
    const userEmail = session.user.email;
    const user = await findUserByEmail(userEmail);
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }
  
    // Check if the document exists
    const document = await getDocumentById(id);
    if (!document) {
      return new NextResponse('Document not found', { status: 404 });
    }
  
    // Save rating using saveRating function
    await saveRating({
      documentId: id,
      userId: user.id,
      rating: rating,
    });
  
    // Get ratings for the document and calculate average rating
    const ratings = await getRatingsForDocument(id);
    const averageRating = ratings.length
      ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
      : 0;
  
    // Return response with the average rating
    return NextResponse.json({ averageRating }, { status: 200 });
  }
  