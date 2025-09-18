import { v2 as Translate } from '@google-cloud/translate';
import { GoogleCloudConfig } from './google-cloud-config';
import { SUPPORTED_LANGUAGES, SupportedLanguageCode, TranslationResponse, SummaryTranslation } from '@/lib/constants/translation';

// Initialize the Google Cloud Translation client using the same auth as other services
const googleCloudConfig = GoogleCloudConfig.getInstance();
const translate = new Translate.Translate({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: googleCloudConfig.getCredentials(),
});

class TranslationService {
  /**
   * Translate a single text string to the target language
   */
  async translateText(
    text: string,
    targetLanguage: SupportedLanguageCode,
    sourceLanguage?: string
  ): Promise<TranslationResponse> {
    try {
      const options: any = {
        to: targetLanguage,
      };
      
      if (sourceLanguage) {
        options.from = sourceLanguage;
      }

      const [translation, metadata] = await translate.translate(text, options);
      
      return {
        translatedText: Array.isArray(translation) ? translation[0] : translation,
        originalText: text,
        targetLanguage,
        sourceLanguage: metadata?.data?.translations?.[0]?.detectedSourceLanguage || sourceLanguage,
      };
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error(`Failed to translate text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Translate an array of texts to the target language
   */
  async translateTexts(
    texts: string[],
    targetLanguage: SupportedLanguageCode,
    sourceLanguage?: string
  ): Promise<TranslationResponse[]> {
    try {
      const options: any = {
        to: targetLanguage,
      };
      
      if (sourceLanguage) {
        options.from = sourceLanguage;
      }

      const [translations] = await translate.translate(texts, options);
      
      return texts.map((originalText, index) => ({
        translatedText: translations[index],
        originalText,
        targetLanguage,
        sourceLanguage,
      }));
    } catch (error) {
      console.error('Batch translation error:', error);
      throw new Error(`Failed to translate texts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Translate a complete legal document summary to the target language
   */
  async translateSummary(
    summary: {
      summary: string;
      keyPoints: string[];
      riskLevel: string;
      recommendations: string[];
      keyRisks?: string[];
      obligations?: string[];
      rights?: string[];
      uiLabels?: Record<string, string>;
    },
    targetLanguage: SupportedLanguageCode,
    sourceLanguage?: string
  ): Promise<any> {
    try {
      // Prepare all texts for batch translation
      const textsToTranslate = [
        summary.summary,
        summary.riskLevel,
        ...summary.keyPoints,
        ...summary.recommendations,
        ...(summary.keyRisks || []),
        ...(summary.obligations || []),
        ...(summary.rights || []),
        ...(summary.uiLabels ? Object.values(summary.uiLabels) : [])
      ];

      const translations = await this.translateTexts(
        textsToTranslate,
        targetLanguage,
        sourceLanguage
      );

      // Reconstruct the translated summary
      let index = 0;
      const translatedSummary = translations[index++].translatedText;
      const translatedRiskLevel = translations[index++].translatedText;
      
      const translatedKeyPoints = summary.keyPoints.map(() => 
        translations[index++].translatedText
      );
      
      const translatedRecommendations = summary.recommendations.map(() => 
        translations[index++].translatedText
      );

      const translatedKeyRisks = (summary.keyRisks || []).map(() => 
        translations[index++].translatedText
      );

      const translatedObligations = (summary.obligations || []).map(() => 
        translations[index++].translatedText
      );

      const translatedRights = (summary.rights || []).map(() => 
        translations[index++].translatedText
      );

      // Translate UI Labels
      const translatedUiLabels: Record<string, string> = {};
      if (summary.uiLabels) {
        const uiLabelKeys = Object.keys(summary.uiLabels);
        uiLabelKeys.forEach(key => {
          translatedUiLabels[key] = translations[index++].translatedText;
        });
      }

      return {
        summary: translatedSummary,
        keyPoints: translatedKeyPoints,
        riskLevel: translatedRiskLevel,
        recommendations: translatedRecommendations,
        keyRisks: translatedKeyRisks,
        obligations: translatedObligations,
        rights: translatedRights,
        uiLabels: translatedUiLabels,
        language: targetLanguage,
      };
    } catch (error) {
      console.error('Summary translation error:', error);
      throw new Error(`Failed to translate summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Detect the language of a given text
   */
  async detectLanguage(text: string): Promise<{ language: string; confidence: number }> {
    try {
      const [detection] = await translate.detect(text);
      
      return {
        language: detection.language,
        confidence: detection.confidence || 0,
      };
    } catch (error) {
      console.error('Language detection error:', error);
      throw new Error(`Failed to detect language: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get available languages for translation
   */
  getSupportedLanguages(): Record<string, string> {
    return SUPPORTED_LANGUAGES;
  }

  /**
   * Check if a language code is supported
   */
  isLanguageSupported(languageCode: string): languageCode is SupportedLanguageCode {
    return languageCode in SUPPORTED_LANGUAGES;
  }
}

// Export singleton instance with lazy loading
let _translationService: TranslationService | null = null;

export const translationService = {
  getInstance(): TranslationService {
    if (!_translationService) {
      _translationService = new TranslationService();
    }
    return _translationService;
  },
  
  // Proxy methods to maintain backward compatibility
  async translateText(
    text: string,
    targetLanguage: SupportedLanguageCode,
    sourceLanguage?: string
  ): Promise<TranslationResponse> {
    return this.getInstance().translateText(text, targetLanguage, sourceLanguage);
  },
  
  async translateTexts(
    texts: string[],
    targetLanguage: SupportedLanguageCode,
    sourceLanguage?: string
  ): Promise<TranslationResponse[]> {
    return this.getInstance().translateTexts(texts, targetLanguage, sourceLanguage);
  },
  
  async translateSummary(
    summary: any,
    targetLanguage: SupportedLanguageCode,
    sourceLanguage?: string
  ): Promise<any> {
    return this.getInstance().translateSummary(summary, targetLanguage, sourceLanguage);
  },
  
  async detectLanguage(text: string): Promise<{ language: string; confidence: number }> {
    return this.getInstance().detectLanguage(text);
  },
  
  getSupportedLanguages(): Record<string, string> {
    return this.getInstance().getSupportedLanguages();
  },
  
  isLanguageSupported(languageCode: string): languageCode is SupportedLanguageCode {
    return this.getInstance().isLanguageSupported(languageCode);
  }
};

export default translationService;
