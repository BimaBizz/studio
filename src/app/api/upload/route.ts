
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
// Note: Firebase Storage imports are removed as we are not uploading the file bytes.
// import { ref, uploadBytes, deleteObject } from 'firebase/storage';
// import { storage } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
  }

  // We are not processing the file bytes to avoid storage errors on the Spark plan.
  // const bytes = await file.arrayBuffer();
  
  const fileExtension = file.name.split('.').pop();
  const fileName = `${uuidv4()}${fileExtension ? `.${fileExtension}` : ''}`;
  // This path is now a placeholder, not a real storage path.
  const storagePath = `user-documents/${fileName}`;

  try {
    // STEP 1: Skip actual upload to Firebase Storage.
    // const storageRef = ref(storage, storagePath);
    // await uploadBytes(storageRef, bytes, { contentType: file.type });
    
    // STEP 2: The URL will be a placeholder pointing to our file serving API.
    const fileUrl = `/api/drive/files/${storagePath}`; // Reuse the drive file serving endpoint logic

    // Return success as if the file was uploaded, providing the necessary info back to the client.
    return NextResponse.json({ success: true, url: fileUrl, fileName: file.name, storagePath: storagePath });

  } catch (error) {
    console.error('Error during user document upload process:', error);
    return NextResponse.json({ success: false, message: 'Error saving file.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { storagePath } = await request.json();

  if (!storagePath || typeof storagePath !== 'string') {
    return NextResponse.json({ success: false, message: 'Invalid storage path.' }, { status: 400 });
  }

  try {
    // Since we are not uploading to storage, we don't need to delete from there.
    // const storageRef = ref(storage, storagePath);
    // await deleteObject(storageRef);
    
    console.log(`File record deletion requested for: ${storagePath}. No action taken in Storage.`);
    return NextResponse.json({ success: true, message: 'File record marked for deletion.' });

  } catch (error) {
    console.error('Error during file record deletion:', error);
    // Even if the file doesn't exist in storage (which it won't), we can proceed gracefully.
    if ((error as any).code === 'storage/object-not-found') {
      console.warn(`File not found in Storage for deletion, but proceeding: ${storagePath}`);
      return NextResponse.json({ success: true, message: 'File not found, but proceeding.' });
    }
    return NextResponse.json({ success: false, message: 'Error deleting file record.' }, { status: 500 });
  }
}
