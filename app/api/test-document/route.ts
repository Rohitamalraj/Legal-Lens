import { NextRequest, NextResponse } from 'next/server';
import { LegalDocumentService } from '@/lib/services/legal-document-service';

const legalDocumentService = new LegalDocumentService();

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 TEST DOCUMENT API CALLED');
    
    // Use the service method to create test document
    const documentId = legalDocumentService.createTestDocument();
    
    return NextResponse.json({
      success: true,
      message: 'Test document added',
      documentId: documentId
    });

  } catch (error) {
    console.error('Error adding test document:', error);
    return NextResponse.json(
      { error: 'Failed to add test document' },
      { status: 500 }
    );
  }
}
