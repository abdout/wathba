import { NextResponse } from 'next/server';
import swaggerJsdoc from 'swagger-jsdoc';
import options from '@/lib/swagger/config';

export async function GET() {
  try {
    const spec = swaggerJsdoc(options);

    return NextResponse.json(spec, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });
  } catch (error) {
    console.error('Error generating Swagger spec:', error);
    return NextResponse.json(
      { error: 'Failed to generate API documentation' },
      { status: 500 }
    );
  }
}