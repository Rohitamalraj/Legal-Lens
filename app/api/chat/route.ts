import { NextRequest, NextResponse } from 'next/server';
import { LegalDocumentService } from '@/lib/services/legal-document-service';

// Initialize the service
const legalDocumentService = new LegalDocumentService();

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log('🌍 ==========================================');
  console.log('🌍 CHAT API REQUEST RECEIVED AT:', timestamp);
  console.log('🌍 ==========================================');
  
  try {
    console.log('=== CHAT API ENDPOINT DEBUG ===');
    console.log('Chat endpoint called');

    const body = await request.json();
    console.log('Request body received:', body);
    
    const { documentId, query } = body;
    console.log('Extracted documentId:', documentId);
    console.log('Extracted query:', query);

    if (!documentId) {
      console.error('No document ID provided in request');
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      console.error('Invalid query provided:', query);
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    console.log(`Processing chat query for document: ${documentId}`);
    console.log(`Query: ${query}`);
    console.log('Document ID type:', typeof documentId);
    console.log('Query type:', typeof query);

    // Process the chat query
    console.log('Calling legalDocumentService.handleChatQuery...');
    const response = await legalDocumentService.handleChatQuery(documentId, query.trim());

    console.log('Chat query processed successfully');
    console.log('Response received:', response);
    console.log('=== CHAT API ENDPOINT SUCCESS ===');
    
    return NextResponse.json({
      success: true,
      response: response.response,
      confidence: response.confidence,
      sources: response.sources || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('=== CHAT API ENDPOINT ERROR ===');
    console.error('Chat query error:', error);
    
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
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Check if document exists and return basic info
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
        uploadTime: document.uploadTime
      },
      chatAvailable: true
    });

  } catch (error) {
    console.error('Chat info retrieval error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false 
      },
      { status: 500 }
    );
  }
}