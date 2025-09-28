import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class APIError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'APIError';
  }
}

export function handleError(error) {
  console.error('API Error:', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      },
      { status: 400 }
    );
  }

  // Custom API errors
  if (error instanceof APIError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        ...(error.details && { details: error.details })
      },
      { status: error.statusCode }
    );
  }

  // Prisma errors
  if (error.code === 'P2002') {
    return NextResponse.json(
      {
        success: false,
        error: 'Duplicate entry',
        message: 'A record with this data already exists'
      },
      { status: 409 }
    );
  }

  if (error.code === 'P2025') {
    return NextResponse.json(
      {
        success: false,
        error: 'Record not found',
        message: 'The requested record does not exist'
      },
      { status: 404 }
    );
  }

  // Stripe errors
  if (error.type && error.type.includes('Stripe')) {
    return NextResponse.json(
      {
        success: false,
        error: 'Payment processing error',
        message: error.message
      },
      { status: 402 }
    );
  }

  // Default error
  return NextResponse.json(
    {
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    },
    { status: 500 }
  );
}

// Async wrapper for API routes
export function withErrorHandler(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleError(error);
    }
  };
}

// Validation wrapper
export function withValidation(schema, handler) {
  return withErrorHandler(async (request, context) => {
    const body = await request.json();
    const validated = schema.parse(body);
    request.validated = validated;
    return handler(request, context);
  });
}