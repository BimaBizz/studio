
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { ref, uploadBytes, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  
  const fileExtension = file.name.split('.').pop();
  const fileName = `${uuidv4()}${fileExtension ? `.${fileExtension}` : ''}`;
  const storagePath = `user-documents/${fileName}`;

  try {
    // Upload to Firebase Storage
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, bytes, { contentType: file.type });
    
    const fileUrl = `/api/drive/files/${storagePath}`;

    return NextResponse.json({ success: true, url: fileUrl, fileName: file.name, storagePath: storagePath });

  } catch (error) {
    console.error('Error saving file to Firebase Storage:', error);
    return NextResponse.json({ success: false, message: 'Error saving file.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { storagePath } = await request.json();

  if (!storagePath || typeof storagePath !== 'string') {
    return NextResponse.json({ success: false, message: 'Invalid storage path.' }, { status: 400 });
  }

  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
    
    console.log(`File deleted from Firebase Storage: ${storagePath}`);
    return NextResponse.json({ success: true, message: 'File deleted successfully.' });

  } catch (error) {
    console.error('Error deleting file from Firebase Storage:', error);
    if ((error as any).code === 'storage/object-not-found') {
      console.warn(`File not found in Storage for deletion, but proceeding: ${storagePath}`);
      return NextResponse.json({ success: true, message: 'File not found, but proceeding.' });
    }
    return NextResponse.json({ success: false, message: 'Error deleting file.' }, { status: 500 });
  }
}
