
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create a unique filename
  const extension = path.extname(file.name);
  const filename = `${uuidv4()}${extension}`;
  
  // Define the upload directory and ensure it exists
  const uploadDir = path.join(process.cwd(), 'public/uploads');
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, filename);

  try {
    await writeFile(filePath, buffer);
    console.log(`File uploaded to ${filePath}`);
    const fileUrl = `/uploads/${filename}`; // URL path accessible from the browser
    return NextResponse.json({ success: true, url: fileUrl, fileName: file.name });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ success: false, message: 'Error saving file.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { fileUrl } = await request.json();

  if (!fileUrl || typeof fileUrl !== 'string') {
    return NextResponse.json({ success: false, message: 'Invalid file URL.' }, { status: 400 });
  }

  // Convert URL path back to filesystem path
  const filename = path.basename(fileUrl);
  const filePath = path.join(process.cwd(), 'public/uploads', filename);

  try {
    if (existsSync(filePath)) {
      await unlink(filePath);
      console.log(`File deleted from ${filePath}`);
      return NextResponse.json({ success: true, message: 'File deleted successfully.' });
    } else {
      console.warn(`File not found for deletion: ${filePath}`);
      return NextResponse.json({ success: true, message: 'File not found, but proceeding.' }); // Don't block deletion if file is missing
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ success: false, message: 'Error deleting file.' }, { status: 500 });
  }
}
