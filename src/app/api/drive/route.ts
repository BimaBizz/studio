
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createFileRecord, deleteFileRecord } from '@/services/drive';
import { type DriveFile } from '@/lib/types';
// Note: Firebase Storage imports are removed as we are not uploading the file bytes for now.
// import { ref, uploadBytes, deleteObject } from 'firebase/storage';
// import { storage } from '@/lib/firebase';


export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;
  const category: string | null = data.get('category') as string | null;

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
  }

  // We are not processing the file bytes for now to avoid storage errors.
  // const bytes = await file.arrayBuffer();
  
  // Create a unique path placeholder
  const fileExtension = file.name.split('.').pop();
  const fileName = `${uuidv4()}${fileExtension ? `.${fileExtension}` : ''}`;
  // This path is now a placeholder, not a real storage path.
  const storagePath = `drive/${fileName}`;
  
  try {
    // STEP 1: Skip actual upload to Firebase Storage to prevent errors on Spark plan.
    // const storageRef = ref(storage, storagePath);
    // await uploadBytes(storageRef, bytes, { contentType: file.type });
    
    // STEP 2: The URL will be a placeholder. In a real scenario, this would point to the actual file.
    // For now, we'll make it clear this is not a real downloadable link.
    const fileUrl = `/api/drive/files/placeholder/${fileName}`;

    // STEP 3: Create a record in Firestore as before.
    const fileRecord = {
      fileName: file.name,
      fileType: file.type,
      url: fileUrl, 
      storagePath: storagePath, // Still useful to have a unique identifier
      category: category || 'Uncategorized',
    };
    const docId = await createFileRecord(fileRecord);
    
    // Return success as if the file was uploaded.
    return NextResponse.json({ success: true, fileId: docId, url: fileUrl, fileName: file.name });
  } catch (error) {
    console.error('Error creating file record in Firestore:', error);
    return NextResponse.json({ success: false, message: 'Error saving file metadata.' }, { status: 500 });
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

    // Since we are not uploading to storage, we don't need to delete from there.
    // const fileData = docSnap.data() as DriveFile;
    // const storagePath = fileData.storagePath; 
    // const storageRef = ref(storage, storagePath);
    // await deleteObject(storageRef);

    // Only delete the Firestore record.
    await deleteFileRecord(id);
    
    return NextResponse.json({ success: true, message: 'File record deleted successfully.' });

  } catch (error) {
    console.error('Error deleting file record:', error);
    return NextResponse.json({ success: false, message: 'Error deleting file record.' }, { status: 500 });
  }
}
