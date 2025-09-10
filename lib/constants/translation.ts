// Supported languages for legal document translation
export const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'es': 'Spanish', 
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'zh': 'Chinese (Simplified)',
  'ja': 'Japanese',
  'ko': 'Korean',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'da': 'Danish',
  'no': 'Norwegian',
  'fi': 'Finnish',
  'pl': 'Polish',
  'cs': 'Czech',
  'hu': 'Hungarian',
} as const;

export type SupportedLanguageCode = keyof typeof SUPPORTED_LANGUAGES;

export interface TranslationResponse {
  translatedText: string;
  originalText: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

export interface SummaryTranslation {
  summary: string;
  keyPoints: string[];
  riskLevel: string;
  recommendations: string[];
  language: string;
}

// UI Labels for translation
export const UI_LABELS = {
  en: {
    'Legal Lens Summary': '🧠 Legal Lens Summary',
    'Key Terms': 'Key Terms:',
    'Risk Analysis': '⚠️ Risk Analysis',
    'Risk Score': 'Risk Score:',
    'Key Risks': 'Key Risks:',
    'Recommendations': 'Recommendations:',
    'Your Obligations': '📋 Your Obligations',
    'Your Rights': '✅ Your Rights',
    'Translating': 'Translating content to',
    'Translated to': 'Translated to'
  }
} as const;

export type UILanguageKey = keyof typeof UI_LABELS.en;
