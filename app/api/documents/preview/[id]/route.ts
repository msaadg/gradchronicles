// app/api/documents/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { File } from 'megajs';
import { getDocumentForPreview } from '@/app/lib/db';
import { getServerSession } from 'next-auth'; // Adjust based on your auth setup

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(); // Adjust based on your NextAuth setup
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    // Fetch document metadata from PostgreSQL
    const document = await getDocumentForPreview(id);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Increment view count
    // await incrementViewCount(id);

    // Initialize MEGA client
    // const storage = await new Storage({
    //   email: process.env.MEGA_EMAIL,
    //   password: process.env.MEGA_PASSWORD
    // }).ready;

    // Fetch file from MEGA using fileUrl (assumed to be a MEGA URL)
    const file = File.fromURL(document.fileUrl);
    await file.loadAttributes(); // Load file metadata
    if (!file) {
      console.error('[API] File not found in MEGA:', document.fileUrl);
      return NextResponse.json({ error: 'File not found in MEGA' }, { status: 404 });
    }

    // Set response headers for preview
    const response = new NextResponse();
    response.headers.set('Content-Type', document.fileType);
    response.headers.set('Content-Disposition', `inline; filename="${document.originalFileName}"`);

    // Stream the file with empty options object
    const downloadStream = file.download({});
    return new NextResponse(downloadStream, {
      headers: response.headers,
    });
  } catch (error) {
    console.error('[API] Error fetching document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}