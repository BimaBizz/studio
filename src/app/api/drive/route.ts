
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createFileRecord, deleteFileRecord } from '@/services/drive';
import { type DriveFile } from '@/lib/types';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;
  const category: string | null = data.get('category') as string | null;

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Store in public/uploads/drive
  const relativeUploadDir = 'uploads/drive';
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

    // Create a record in Firestore
    const fileRecord = {
      fileName: file.name,
      fileType: file.type,
      url: publicUrl,
      storagePath: storagePath,
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
      return NextResponse.json({ success: false, message: 'File not found.' }, { status: 404 });
    }
    
    const fileData = docSnap.data() as DriveFile;
    const filePath = fileData.storagePath;

    // Delete the file from the filesystem
    if (filePath) {
        try {
            await unlink(filePath);
        } catch (unlinkError: any) {
            // Log the error but don't block the process if the file doesn't exist
            if (unlinkError.code !== 'ENOENT') {
                console.error('Error deleting file from filesystem:', unlinkError);
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
