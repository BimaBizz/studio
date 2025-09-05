
// This file is no longer needed with local public file serving.
// It can be deleted, but for now we'll just empty it to prevent errors.
import { NextResponse } from 'next/server';

export async function GET() {
    return new NextResponse('Not Found', { status: 404 });
}
