
import { NextRequest, NextResponse } from 'next/server';
import { stat, readFile } from 'fs/promises';
import path from 'path';
import { cookies } from 'next/headers'; // Using next/headers for server component context

const UPLOAD_DIR = path.join(process.cwd(), 'private_uploads', 'drive');

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;

  // --- Authentication Check ---
  // In a real app, you would verify a JWT or session cookie.
  // For this demo, we'll check for a simple login cookie marker.
  const cookieStore = cookies();
  const isLoggedIn = cookieStore.has('firebase-auth-token'); // A placeholder check

  if (!isLoggedIn) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  // --- File Serving Logic ---
  if (!filename) {
    return new NextResponse('Bad Request: Filename is required.', { status: 400 });
  }

  // Sanitize filename to prevent directory traversal attacks
  const sanitizedFilename = path.basename(filename);
  if (sanitizedFilename !== filename) {
      return new NextResponse('Bad Request: Invalid filename.', { status: 400 });
  }

  const filePath = path.join(UPLOAD_DIR, sanitizedFilename);

  try {
    // Check if file exists
    await stat(filePath);

    // Read the file content
    const fileBuffer = await readFile(filePath);

    // Set appropriate headers for the browser to handle the file
    const headers = new Headers();
    // This header prompts the browser to download the file with its original name
    // For now, we are just serving it. To force download, you'd need the original filename.
    // For simplicity, we serve it directly.
    headers.set('Content-Type', 'application/octet-stream'); // Generic binary stream
    headers.set('Content-Disposition', `attachment; filename="${sanitizedFilename}"`);


    return new NextResponse(fileBuffer, { status: 200, headers });

  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return new NextResponse('Not Found', { status: 404 });
    }
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
