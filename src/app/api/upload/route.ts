
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { R2 } from '@/lib/r2';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const BUCKET_NAME = process.env.R2_BUCKET_NAME;

export async function POST(request: NextRequest) {
  if (!BUCKET_NAME) {
    return NextResponse.json({ success: false, message: 'R2 bucket name not configured.' }, { status: 500 });
  }
  
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileExtension = file.name.split('.').pop();
  const r2Key = `documents/${uuidv4()}${fileExtension ? `.${fileExtension}` : ''}`;

  try {
    // Upload to R2
    await R2.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: r2Key,
      Body: buffer,
      ContentType: file.type,
    }));
    
    // Unlike the drive endpoint, this one returns the R2 key directly.
    // The client will construct the correct `/api/drive/files/...` URL when needed.
    // However, for user documents, we might need a similar secure serving endpoint.
    // For now, let's assume we'll build a similar endpoint for documents if needed,
    // and just store the key. The URL will be constructed on the client.
    // A better approach is to return the secure serving URL path.
    const fileUrl = `/api/drive/files/${r2Key}`;

    return NextResponse.json({ success: true, url: fileUrl, fileName: file.name, r2Key: r2Key });

  } catch (error) {
    console.error('Error saving file to R2:', error);
    return NextResponse.json({ success: false, message: 'Error saving file.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!BUCKET_NAME) {
    return NextResponse.json({ success: false, message: 'R2 bucket name not configured.' }, { status: 500 });
  }

  const { r2Key } = await request.json();

  if (!r2Key || typeof r2Key !== 'string') {
    return NextResponse.json({ success: false, message: 'Invalid R2 key.' }, { status: 400 });
  }

  try {
    await R2.send(new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: r2Key,
    }));
    
    console.log(`File deleted from R2: ${r2Key}`);
    return NextResponse.json({ success: true, message: 'File deleted successfully.' });

  } catch (error) {
    console.error('Error deleting file from R2:', error);
    // It's okay if the file is already gone, don't fail the request.
    if ((error as any).name === 'NoSuchKey') {
      console.warn(`File not found in R2 for deletion, but proceeding: ${r2Key}`);
      return NextResponse.json({ success: true, message: 'File not found, but proceeding.' });
    }
    return NextResponse.json({ success: false, message: 'Error deleting file.' }, { status: 500 });
  }
}
