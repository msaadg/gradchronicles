// api/documents/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Storage } from 'megajs';
import { Readable } from 'stream';
import { createDocument, findDocumentByTitleAndAuthor } from '@/lib/db';

export async function POST(req: NextRequest) {
  const userId = '1';
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
  }

  const allowedTypes = ['application/pdf', 'application/msword', 'text/plain'];
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ message: 'Unsupported file type' }, { status: 400 });
  }
  if (file.size > maxSize) {
    return NextResponse.json({ message: 'File exceeds 100MB limit' }, { status: 400 });
  }

  const course = formData.get('course')?.toString();
  const tags = formData.get('tags')?.toString().split(',') || [];
  const description = formData.get('description')?.toString();

  if (!course) {
    return NextResponse.json({ message: 'Course name is required' }, { status: 400 });
  }

  try {
    const existingDoc = await findDocumentByTitleAndAuthor(file.name, userId, course);
    if (existingDoc) {
      return NextResponse.json(
        { message: `You have already uploaded a file named "${file.name}" for ${course}.` },
        { status: 409 }
      );
    }

    const storage = new Storage({
      email: process.env.MEGA_EMAIL!,
      password: process.env.MEGA_PASSWORD!,
      autologin: true,
      autoload: true,
    });
    await storage.ready;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const upload = storage.root.upload({
      name: file.name || 'unnamed_file',
      size: file.size,
    });

    const readableStream = Readable.from(buffer);
    readableStream.pipe(upload);
    const uploadedFile = await upload.complete;
    const fileUrl = await uploadedFile.link();

    const document = await createDocument({
      title: file.name || 'Untitled',
      course,
      fileUrl,
      fileType: file.type || 'application/pdf',
      tags,
      authorId: userId,
      metadata: description ? { summary: description } : undefined,
    });

    return NextResponse.json({
      documentId: document.id,
      message: 'Document uploaded successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ message: 'Failed to upload document' }, { status: 500 });
  }
}
