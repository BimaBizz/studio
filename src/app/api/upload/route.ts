
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, unlink } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

const getUploadsDir = (subpath: string = '') => {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', subpath);
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
};

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileExtension = path.extname(file.name);
  const fileName = `${uuidv4()}${fileExtension}`;
  const localPath = path.join(getUploadsDir(), fileName);
  const publicUrl = `/uploads/${fileName}`;

  try {
    // Step 1: Write the file to the local filesystem
    await writeFile(localPath, buffer);
    
    // Return success with the necessary info for the client
    return NextResponse.json({ success: true, url: publicUrl, fileName: file.name, storagePath: localPath });

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
    // Delete the file from the local filesystem
    await unlink(storagePath);
    
    return NextResponse.json({ success: true, message: 'File deleted successfully.' });

  } catch (error) {
    // If the file doesn't exist, we can proceed gracefully.
    if ((error as any).code === 'ENOENT') {
      console.warn(`File not found in filesystem for deletion, but proceeding: ${storagePath}`);
      return NextResponse.json({ success: true, message: 'File not found, but record deletion can proceed.' });
    }
    console.error('Error deleting file from filesystem:', error);
    return NextResponse.json({ success: false, message: 'Error deleting file from storage.' }, { status: 500 });
  }
}
