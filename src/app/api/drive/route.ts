
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createFileRecord, deleteFileRecord } from '@/services/drive';
import { type DriveFile } from '@/lib/types';
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
  const category: string | null = data.get('category') as string | null;

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileExtension = path.extname(file.name);
  const fileName = `${uuidv4()}${fileExtension}`;
  const localPath = path.join(getUploadsDir('drive'), fileName);
  const publicUrl = `/uploads/drive/${fileName}`;

  try {
    // Step 1: Write file to the local filesystem
    await writeFile(localPath, buffer);

    // Step 2: Create a record in Firestore
    const fileRecord = {
      fileName: file.name,
      fileType: file.type,
      url: publicUrl, // The public URL for the client
      storagePath: localPath, // The local filesystem path for server-side deletion
      category: category || 'Uncategorized',
    };
    const docId = await createFileRecord(fileRecord);
    
    return NextResponse.json({ success: true, fileId: docId, url: publicUrl, fileName: file.name });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, message: 'Error uploading file.' }, { status: 500 });
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

    // Delete the file from the local filesystem
    const fileData = docSnap.data() as DriveFile;
    const localPath = fileData.storagePath;
    if (localPath) {
      try {
        await unlink(localPath);
      } catch (fileError: any) {
        // Log if file doesn't exist but don't block the operation
        if (fileError.code === 'ENOENT') {
          console.warn(`File not found for deletion, but proceeding: ${localPath}`);
        } else {
          throw fileError; // Re-throw other file errors
        }
      }
    }

    // Delete the Firestore record
    await deleteFileRecord(id);
    
    return NextResponse.json({ success: true, message: 'File deleted successfully.' });

  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ success: false, message: 'Error deleting file.' }, { status: 500 });
  }
}
