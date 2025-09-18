import { NextRequest, NextResponse } from 'next/server';
import { vertexAIService } from '@/lib/services/vertex-ai';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Document text is required' },
        { status: 400 }
      );
    }

    console.log('=== DETAILED ANALYSIS API START ===');
    console.log('Analyzing document for detailed clauses and risks...');
    console.log('Text length:', text.length);
    console.log('Text preview:', text.substring(0, 200) + '...');

    // Get detailed analysis from Vertex AI
    const result = await vertexAIService.analyzeClausesAndRisks(text);

    console.log('Detailed analysis completed successfully');
    console.log('Result:', {
      clausesCount: result.clauses?.length || 0,
      risksCount: result.risks?.length || 0,
      sampleClause: result.clauses?.[0]?.title || 'None',
      sampleRisk: result.risks?.[0]?.title || 'None'
    });
    console.log('=== DETAILED ANALYSIS API SUCCESS ===');

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('=== DETAILED ANALYSIS API ERROR ===');
    console.error('Detailed analysis API error:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    
    // Return detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isCredentialError = errorMessage.includes('credentials') || errorMessage.includes('authentication');
    const isQuotaError = errorMessage.includes('quota') || errorMessage.includes('limit');
    const isPermissionError = errorMessage.includes('permission') || errorMessage.includes('access');
    
    let userMessage = 'Failed to analyze document details with Vertex AI';
    if (isCredentialError) {
      userMessage = 'Google Cloud credentials not configured properly';
    } else if (isQuotaError) {
      userMessage = 'Vertex AI quota exceeded - please try again later';
    } else if (isPermissionError) {
      userMessage = 'Missing permissions for Vertex AI API';
    }

    return NextResponse.json(
      { 
        success: false,
        error: userMessage,
        message: errorMessage,
        isCredentialError,
        isQuotaError,
        isPermissionError,
        fallbackAvailable: true
      },
      { status: 500 }
    );
  }
}