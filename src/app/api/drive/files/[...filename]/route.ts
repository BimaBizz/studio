
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { R2 } from '@/lib/r2';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const BUCKET_NAME = process.env.R2_BUCKET_NAME;

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string[] } }
) {
  const r2Key = params.filename.join('/');

  // --- Authentication Check ---
  const cookieStore = cookies();
  const isLoggedIn = cookieStore.has('firebase-auth-token'); 

  if (!isLoggedIn) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  if (!BUCKET_NAME) {
    return new NextResponse('Server not configured for file storage.', { status: 500 });
  }

  if (!r2Key) {
    return new NextResponse('Bad Request: Filename is required.', { status: 400 });
  }

  try {
    // Create a short-lived signed URL to access the private R2 object
    const signedUrl = await getSignedUrl(
        R2,
        new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: r2Key,
        }),
        { expiresIn: 60 } // URL is valid for 60 seconds
    );

    // Redirect the user to the signed URL
    return NextResponse.redirect(signedUrl);

  } catch (error: any) {
    // The S3 client throws an error if the object is not found.
    if (error.name === 'NoSuchKey' || error.name === 'NotFound') {
        return new NextResponse('Not Found', { status: 404 });
    }
    console.error('Error generating signed URL:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
