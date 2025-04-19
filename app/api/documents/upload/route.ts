// api/documents/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Storage } from 'megajs';
import { Readable } from 'stream';
import { createDocument, findExistingDocument, findUserByEmail } from '@/app/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from 'next-auth/next';
import { NEXT_AUTH } from '@/app/lib/auth';
import { ExtractedMetadata } from '@/app/lib/types';

export async function POST(req: NextRequest) {
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
  
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
  }

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ message: 'Unsupported file type' }, { status: 400 });
  }
  if (file.size > maxSize) {
    return NextResponse.json({ message: 'File exceeds 100MB limit' }, { status: 400 });
  }
  
  const title = formData.get('title')?.toString();
  const courseId = formData.get('courseId')?.toString();
  const description = formData.get('description')?.toString();
  
  const rawDocType = formData.get('docType')?.toString();
  const docType = ['EXAM', 'NOTES', 'ASSIGNMENT', 'OTHER_RESOURCES'].includes(rawDocType?.toUpperCase() || '')
    ? rawDocType!.toUpperCase() as 'EXAM' | 'NOTES' | 'ASSIGNMENT' | 'OTHER_RESOURCES'
    : 'OTHER_RESOURCES';
  
  const tags = formData.get('tags')?.toString().split(',')
    .map(tag => tag.trim())
    .filter(tag => tag !== '') || [];

  if (!title) {
    return NextResponse.json({ message: 'Title is required' }, { status: 400 });
  }
  
  if (!courseId) {
    return NextResponse.json({ message: 'Course ID is required' }, { status: 400 });
  }

  try {
    const existingDoc = await findExistingDocument(file.name, userId, courseId);
    if (existingDoc) {
      return NextResponse.json(
        { message: `You have already uploaded a file named "${file.name}" for this course.` },
        { status: 409 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const extractedMetadata: ExtractedMetadata = {
      fileType: file.name.endsWith('.pdf') ? 'PDF' 
        : file.name.endsWith('.docx') ? 'DOCX'
        : file.name.endsWith('.doc') ? 'DOC'
        : 'TXT',
      mimeType: file.type,
      fileSize: file.size,
    };
    

    // TODO: Implement metadata extraction logic for pdf, docx, txt files

    if (description) {
      extractedMetadata.summary = description;
    }

    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;

    const storage = new Storage({
      email: process.env.MEGA_EMAIL!,
      password: process.env.MEGA_PASSWORD!,
      autologin: true,
      autoload: true,
    });
    await storage.ready;

    const upload = storage.root.upload({
      name: uniqueFileName,
      size: file.size,
    });

    const readableStream = Readable.from(buffer);
    readableStream.pipe(upload);
    const uploadedFile = await upload.complete;
    const fileUrl = await uploadedFile.link();

    const document = await createDocument({
      title,
      courseId,
      docType,
      fileUrl,
      fileName: file.name,
      fileType: file.type,
      tags,
      authorId: userId,
      metadata: extractedMetadata,
    });

    return NextResponse.json({
      documentId: document.id,
      message: 'Document uploaded successfully',
      metadata: extractedMetadata,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ message: 'Failed to upload document' }, { status: 500 });
  }
}
