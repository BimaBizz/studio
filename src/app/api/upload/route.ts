
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Store in public/uploads
  const relativeUploadDir = 'uploads';
  const uploadDir = path.join(process.cwd(), 'public', relativeUploadDir);

  try {
    // Ensure the directory exists
    await require('fs').promises.mkdir(uploadDir, { recursive: true });
  } catch (error: any) {
    if (error.code !== 'EEXIST') {
      console.error('Error creating directory:', error);
      return NextResponse.json({ success: false, message: 'Error creating upload directory.' }, { status: 500 });
    }
  }

  const fileName = `${uuidv4()}${path.extname(file.name)}`;
  const filePath = path.join(uploadDir, fileName);
  const publicUrl = `/${relativeUploadDir}/${fileName}`;
  const storagePath = filePath;

  try {
    // Write the file to the filesystem
    await writeFile(filePath, buffer);
    
    // Return success with the necessary info for the client to update Firestore
    return NextResponse.json({ success: true, url: publicUrl, fileName: file.name, storagePath: storagePath });
  } catch (error) {
    console.error('Error uploading user document:', error);
    return NextResponse.json({ success: false, message: 'Error uploading file.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { storagePath } = await request.json();

  if (!storagePath || typeof storagePath !== 'string') {
    return NextResponse.json({ success: false, message: 'Invalid storage path.' }, { status: 400 });
  }

  try {
    await unlink(storagePath);
    return NextResponse.json({ success: true, message: 'File deleted successfully.' });
  } catch (error: any) {
    // If file doesn't exist, it's not a critical error, just log it.
    if (error.code === 'ENOENT') {
      console.warn(`File not found for deletion: ${storagePath}`);
      return NextResponse.json({ success: true, message: 'File not found, record can be deleted.' });
    }
    console.error('Error deleting file:', error);
    return NextResponse.json({ success: false, message: 'Error deleting file.' }, { status: 500 });
  }
}
