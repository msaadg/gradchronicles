// api/documents/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchDocuments, findUserByEmail } from '@/app/lib/db';
import { getServerSession } from 'next-auth/next';
import { NEXT_AUTH } from '@/app/lib/auth';

export async function GET(req: NextRequest) {

	// Authenticate the user using next-auth.  
	const session = await getServerSession(NEXT_AUTH);

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userEmail = session.user.email;
  const user = await findUserByEmail(userEmail);
  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);

  const query = searchParams.get('query') || '';
  const courseId = searchParams.get('courseId') || undefined;
  const docType = searchParams.get('docType') as 'EXAM' | 'NOTES' | 'ASSIGNMENT' | 'OTHER_RESOURCES' | undefined;
  const minRating = searchParams.get('minRating') ? parseInt(searchParams.get('minRating')!) : undefined;
  const sortBy = searchParams.get('sortBy') as 'newest' | 'oldest' | 'downloads' | 'views' | 'rating' | undefined;
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
  const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : 9;

  try {
    const searchResults = await searchDocuments({
      query,
      courseId,
      docType,
      minRating,
      sortBy: sortBy || 'newest',
      page,
      pageSize,
    });

    return NextResponse.json({
      results: searchResults.results,
      total: searchResults.total,
      page: searchResults.page,
      pageSize: searchResults.pageSize,
      totalPages: searchResults.totalPages,
      message: 'Search completed successfully',
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ message: 'Failed to perform search' }, { status: 500 });
  }
}