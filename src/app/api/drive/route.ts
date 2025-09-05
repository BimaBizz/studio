
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, mkdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createFileRecord, deleteFileRecord } from '@/services/drive';
import { type DriveFile } from '@/lib/types';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'drive');

async function ensureUploadDirExists() {
  try {
    await stat(UPLOAD_DIR);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      await mkdir(UPLOAD_DIR, { recursive: true });
    } else {
      throw error;
    }
  }
}

export async function POST(request: NextRequest) {
  await ensureUploadDirExists();
  
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Sanitize filename to prevent directory traversal
  const sanitizedFilename = path.basename(file.name).replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const uniqueFilename = `${uuidv4()}-${sanitizedFilename}`;
  const filePath = path.join(UPLOAD_DIR, uniqueFilename);
  
  try {
    await writeFile(filePath, buffer);
    const fileUrl = `/uploads/drive/${uniqueFilename}`;

    // Create a record in Firestore
    const fileRecord = {
      fileName: file.name, // Store original file name
      fileType: file.type,
      url: fileUrl,
    };
    const docId = await createFileRecord(fileRecord);
    
    return NextResponse.json({ success: true, fileId: docId, url: fileUrl, fileName: file.name });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ success: false, message: 'Error saving file.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, message: 'File ID is required.' }, { status: 400 });
  }

  try {
    const docRef = doc(db, "driveFiles", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ success: false, message: 'File record not found.' }, { status: 404 });
    }

    const fileData = docSnap.data() as DriveFile;
    const fileUrl = fileData.url;

    // Convert URL path back to filesystem path
    const filename = path.basename(fileUrl);
    const filePath = path.join(UPLOAD_DIR, filename);

    // Delete the physical file
    if (existsSync(filePath)) {
      await unlink(filePath);
    } else {
      console.warn(`File not found for deletion, but proceeding: ${filePath}`);
    }

    // Delete the Firestore record
    await deleteFileRecord(id);
    
    return NextResponse.json({ success: true, message: 'File deleted successfully.' });

  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ success: false, message: 'Error deleting file.' }, { status: 500 });
  }
}
