import { NextRequest, NextResponse } from 'next/server';
import { LegalDocumentService } from '@/lib/services/legal-document-service';

// Initialize the service (in production, use dependency injection or singleton pattern)
const legalDocumentService = new LegalDocumentService();

export async function POST(request: NextRequest) {
  try {
    console.log('=== DOCUMENT UPLOAD API DEBUG ===');
    console.log('Document upload endpoint called');

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('No file provided in upload request');
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log(`Processing file: ${file.name} (${file.type})`);
    console.log('File size:', buffer.length, 'bytes');

    // Process the document
    console.log('Calling legalDocumentService.processLegalDocument...');
    const result = await legalDocumentService.processLegalDocument(
      buffer,
      file.name,
      file.type
    );
    
    console.log('Document processed successfully:');
    console.log('- Document ID:', result.id);
    console.log('- Filename:', result.originalFilename);
    console.log('- Document Type:', result.documentProcessing.documentType);
    console.log('- Is Legal Document:', result.documentProcessing.isLegalDocument);
    console.log('- Confidence:', result.documentProcessing.confidence);

    // Return the processed result
    console.log('Returning document response with ID:', result.id);
    console.log('=== DOCUMENT UPLOAD API SUCCESS ===');
    
    return NextResponse.json({
      success: true,
      document: {
        id: result.id,
        filename: result.originalFilename,
        documentType: result.documentProcessing.documentType,
        isLegalDocument: result.documentProcessing.isLegalDocument,
        confidence: result.documentProcessing.confidence,
        analysis: {
          summary: result.legalAnalysis.summary,
          riskScore: result.legalAnalysis.riskScore,
          keyRisks: result.legalAnalysis.keyRisks,
          obligations: result.legalAnalysis.obligations,
          rights: result.legalAnalysis.rights,
          keyTerms: result.legalAnalysis.keyTerms,
          recommendations: result.legalAnalysis.recommendations
        },
        uploadTime: result.uploadTime
      }
    });

  } catch (error) {
    console.error('Document upload/processing error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (documentId) {
      // Get specific document
      const document = legalDocumentService.getProcessedDocument(documentId);
      
      if (!document) {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        document: {
          id: document.id,
          filename: document.originalFilename,
          documentType: document.documentProcessing.documentType,
          isLegalDocument: document.documentProcessing.isLegalDocument,
          confidence: document.documentProcessing.confidence,
          analysis: document.legalAnalysis,
          uploadTime: document.uploadTime
        }
      });
    } else {
      // Get all documents summary
      const documents = legalDocumentService.getProcessedDocuments();
      const summaries = documents.map(doc => 
        legalDocumentService.getDocumentSummary(doc.id)
      );

      return NextResponse.json({
        success: true,
        documents: summaries
      });
    }

  } catch (error) {
    console.error('Document retrieval error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false 
      },
      { status: 500 }
    );
  }
}
