
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { doc, getDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { createFileRecord, deleteFileRecord } from '@/services/drive';
import { type DriveFile } from '@/lib/types';
import { ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';


export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;
  const category: string | null = data.get('category') as string | null;

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  
  const fileExtension = file.name.split('.').pop();
  const fileName = `${uuidv4()}${fileExtension ? `.${fileExtension}` : ''}`;
  const storagePath = `drive/${fileName}`;
  
  try {
    // Step 1: Upload file to Firebase Storage
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, bytes, { contentType: file.type });
    
    // Step 2: Get the public download URL for the file
    const fileUrl = await getDownloadURL(storageRef);

    // Step 3: Create a record in Firestore
    const fileRecord = {
      fileName: file.name,
      fileType: file.type,
      url: fileUrl, 
      storagePath: storagePath,
      category: category || 'Uncategorized',
    };
    const docId = await createFileRecord(fileRecord);
    
    return NextResponse.json({ success: true, fileId: docId, url: fileUrl, fileName: file.name });
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

    // Delete the file from Firebase Storage
    const fileData = docSnap.data() as DriveFile;
    const storagePath = fileData.storagePath; 
    if (storagePath) {
        const storageRef = ref(storage, storagePath);
        await deleteObject(storageRef);
    }

    // Delete the Firestore record
    await deleteFileRecord(id);
    
    return NextResponse.json({ success: true, message: 'File deleted successfully.' });

  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ success: false, message: 'Error deleting file.' }, { status: 500 });
  }
}
