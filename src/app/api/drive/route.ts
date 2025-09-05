
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createFileRecord, deleteFileRecord } from '@/services/drive';
import { type DriveFile } from '@/lib/types';
import { R2 } from '@/lib/r2';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const BUCKET_NAME = process.env.R2_BUCKET_NAME;

export async function POST(request: NextRequest) {
  if (!BUCKET_NAME) {
    return NextResponse.json({ success: false, message: 'R2 bucket name not configured.' }, { status: 500 });
  }

  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;
  const category: string | null = data.get('category') as string | null;

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate a unique key for the file in R2
  const fileExtension = file.name.split('.').pop();
  const r2Key = `drive/${uuidv4()}${fileExtension ? `.${fileExtension}` : ''}`;
  
  try {
    // Upload to R2
    await R2.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: r2Key,
        Body: buffer,
        ContentType: file.type,
    }));
    
    // The URL now points to our secure file serving API route
    const fileUrl = `/api/drive/files/${r2Key}`;

    // Create a record in Firestore
    const fileRecord = {
      fileName: file.name, // Store original file name
      fileType: file.type,
      url: fileUrl, // Store the API URL
      storagePath: r2Key, // Store the R2 object key
      category: category || 'Uncategorized', // Default category if not provided
    };
    const docId = await createFileRecord(fileRecord);
    
    return NextResponse.json({ success: true, fileId: docId, url: fileUrl, fileName: file.name });
  } catch (error) {
    console.error('Error saving file to R2:', error);
    return NextResponse.json({ success: false, message: 'Error saving file.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!BUCKET_NAME) {
    return NextResponse.json({ success: false, message: 'R2 bucket name not configured.' }, { status: 500 });
  }

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
    const r2Key = fileData.storagePath; 

    // Delete the object from R2
    await R2.send(new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: r2Key,
    }));

    // Delete the Firestore record
    await deleteFileRecord(id);
    
    return NextResponse.json({ success: true, message: 'File deleted successfully.' });

  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ success: false, message: 'Error deleting file.' }, { status: 500 });
  }
}
