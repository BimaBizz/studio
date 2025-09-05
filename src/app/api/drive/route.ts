
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createFileRecord, deleteFileRecord } from '@/services/drive';
import { type DriveFile } from '@/lib/types';
import path from 'path';

// Vercel's filesystem is read-only. We can't write files directly.
// This function will now only handle metadata and won't save the physical file.

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;
  const category: string | null = data.get('category') as string | null;

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
  }

  // We are not writing the file to the filesystem anymore.
  // We will generate a placeholder URL and storage path.
  const fileName = `${uuidv4()}${path.extname(file.name)}`;
  const publicUrl = `/uploads/drive/${fileName}`; // This is a placeholder URL
  const storagePath = `simulated/uploads/drive/${fileName}`; // Placeholder path

  try {
    // Step 1: Create a record in Firestore (without writing the file)
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
    console.error('Error creating file record:', error);
    // Return a more descriptive error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during file record creation.';
    return NextResponse.json({ success: false, message: `Error creating file record: ${errorMessage}` }, { status: 500 });
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

    // Since we are not saving files, we don't need to delete them from the filesystem.
    // We only need to delete the Firestore record.
    await deleteFileRecord(id);
    
    return NextResponse.json({ success: true, message: 'File record deleted successfully.' });

  } catch (error) {
    console.error('Error deleting file record:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during file record deletion.';
    return NextResponse.json({ success: false, message: `Error deleting file record: ${errorMessage}` }, { status: 500 });
  }
}
