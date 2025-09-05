
import { NextRequest, NextResponse } from 'next/server';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { storage } from '@/lib/firebase';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string[] } }
) {
  const storagePath = params.filename.join('/');

  // --- Authentication Check ---
  const cookieStore = cookies();
  const isLoggedIn = cookieStore.has('firebase-auth-token'); 

  if (!isLoggedIn) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  if (!storagePath) {
    return new NextResponse('Bad Request: Filename is required.', { status: 400 });
  }

  try {
    const fileRef = ref(storage, storagePath);
    const downloadUrl = await getDownloadURL(fileRef);
    
    // Redirect the user to the Firebase Storage URL.
    // This URL includes a download token for access.
    return NextResponse.redirect(downloadUrl);

  } catch (error: any) {
    // Firebase Storage throws 'storage/object-not-found'
    if (error.code === 'storage/object-not-found') {
        return new NextResponse('Not Found', { status: 404 });
    }
    console.error('Error getting download URL:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
