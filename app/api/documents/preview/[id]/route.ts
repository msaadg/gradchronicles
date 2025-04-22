// app/api/documents/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { File } from 'megajs';
import { getDocumentForPreview } from '@/app/lib/db';
import { getServerSession } from 'next-auth'; // Adjust based on your auth setup
import { NEXT_AUTH } from '@/app/lib/auth'; 

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(NEXT_AUTH); // Adjust based on your NextAuth setup
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch document metadata from PostgreSQL
    const document = await getDocumentForPreview(id);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

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