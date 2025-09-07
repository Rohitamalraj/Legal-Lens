import { NextRequest, NextResponse } from 'next/server';
import { LegalDocumentService } from '@/lib/services/legal-document-service';

// Initialize the service
const legalDocumentService = new LegalDocumentService();

export async function POST(request: NextRequest) {
  try {
    console.log('Document validation endpoint called');

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided for validation' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log(`Validating file: ${file.name} (${file.type})`);

    // Validate the document
    const validation = await legalDocumentService.validateDocument(
      buffer,
      file.name,
      file.type
    );

    return NextResponse.json({
      success: true,
      validation: {
        isValid: validation.isValid,
        isLegalDocument: validation.isLegal,
        documentType: validation.documentType,
        confidence: validation.confidence,
        message: validation.message,
        filename: file.name,
        fileSize: file.size,
        mimeType: file.type
      }
    });

  } catch (error) {
    console.error('Document validation error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false 
      },
      { status: 500 }
    );
  }
}
