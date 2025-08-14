import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the JSON file from the file system (not public folder)
    const filePath = path.join(process.cwd(), 'data', 'impacts.json');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Data not found' }, { status: 404 });
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const impacts = JSON.parse(fileContents);
    
    // Optional: Add basic rate limiting headers
    const response = NextResponse.json(impacts);
    response.headers.set('Cache-Control', 'private, max-age=300'); // Cache for 5 minutes
    
    return response;
  } catch (error) {
    console.error('Error reading impacts data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
