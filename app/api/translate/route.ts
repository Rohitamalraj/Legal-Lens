import { NextRequest, NextResponse } from 'next/server';
import { translationService } from '@/lib/services/translation';
import { SupportedLanguageCode } from '@/lib/constants/translation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, texts, summary, targetLanguage, sourceLanguage, action } = body;

    // Validate target language
    if (!translationService.isLanguageSupported(targetLanguage)) {
      return NextResponse.json(
        { error: 'Unsupported target language' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'translateText':
        if (!text) {
          return NextResponse.json(
            { error: 'Text is required for single text translation' },
            { status: 400 }
          );
        }
        
        const textResult = await translationService.translateText(
          text,
          targetLanguage as SupportedLanguageCode,
          sourceLanguage
        );
        
        return NextResponse.json(textResult);

      case 'translateTexts':
        if (!texts || !Array.isArray(texts)) {
          return NextResponse.json(
            { error: 'Texts array is required for batch translation' },
            { status: 400 }
          );
        }
        
        const textsResult = await translationService.translateTexts(
          texts,
          targetLanguage as SupportedLanguageCode,
          sourceLanguage
        );
        
        return NextResponse.json(textsResult);

      case 'translateSummary': {
        if (!summary || typeof summary !== 'object') {
          return NextResponse.json(
            { error: 'Summary object is required for summary translation' },
            { status: 400 }
          );
        }
        
        const summaryResult = await translationService.translateSummary(
          summary,
          targetLanguage as SupportedLanguageCode,
          sourceLanguage
        );
        
        return NextResponse.json(summaryResult);
      }

      case 'detectLanguage':
        if (!text) {
          return NextResponse.json(
            { error: 'Text is required for language detection' },
            { status: 400 }
          );
        }
        
        const detectionResult = await translationService.detectLanguage(text);
        return NextResponse.json(detectionResult);

      case 'getSupportedLanguages':
        const supportedLanguages = translationService.getSupportedLanguages();
        return NextResponse.json(supportedLanguages);

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: translateText, translateTexts, translateSummary, detectLanguage, getSupportedLanguages' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { 
        error: 'Translation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return supported languages for GET requests
    const supportedLanguages = translationService.getSupportedLanguages();
    return NextResponse.json({
      supportedLanguages,
      totalLanguages: Object.keys(supportedLanguages).length,
    });
  } catch (error) {
    console.error('Translation API GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supported languages' },
      { status: 500 }
    );
  }
}