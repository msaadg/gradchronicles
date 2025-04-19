// api/documents/recently-viewed/route.ts
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { NEXT_AUTH } from '@/app/lib/auth';
import { findUserByEmail, getRecentlyViewedDocuments } from '@/app/lib/db';

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '3', 10);

  try {
    const documents = await getRecentlyViewedDocuments(userId, limit);
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching recently viewed documents:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}