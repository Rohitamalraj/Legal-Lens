import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { GoogleCloudConfig } from './google-cloud-config';

export interface DocumentProcessingResult {
  text: string;
  confidence: number;
  isLegalDocument: boolean;
  documentType: string;
  entities: Array<{
    type: string;
    mentionText: string;
    confidence: number;
  }>;
}

/**
 * Document AI Service
 * Handles document processing and legal document detection
 */
export class DocumentAIService {
  private client: DocumentProcessorServiceClient;
  private cloudConfig: GoogleCloudConfig;
  private projectId: string;
  private location: string;
  private processorId: string;

  constructor() {
    this.cloudConfig = GoogleCloudConfig.getInstance();
    this.projectId = this.cloudConfig.getProjectId();
    this.location = process.env.DOCUMENT_AI_LOCATION || 'us';
    this.processorId = process.env.DOCUMENT_AI_PROCESSOR_ID || '';

    // Initialize client with proper authentication
    const credentials = this.cloudConfig.getCredentials();
    if (credentials) {
      this.client = new DocumentProcessorServiceClient({
        credentials: credentials,
        projectId: this.projectId
      });
    } else {
      // Use Application Default Credentials
      this.client = new DocumentProcessorServiceClient({
        projectId: this.projectId
      });
    }
  }

  /**
   * Process document and extract text with legal document detection
   */
  async processDocument(fileBuffer: Buffer, mimeType: string): Promise<DocumentProcessingResult> {
    try {
      if (!this.processorId) {
        console.warn('Document AI processor ID not configured, using fallback text extraction');
        return this.fallbackTextExtraction(fileBuffer, mimeType);
      }

      const name = `projects/${this.projectId}/locations/${this.location}/processors/${this.processorId}`;
      
      const request = {
        name,
        rawDocument: {
          content: fileBuffer.toString('base64'),
          mimeType,
        },
      };

      console.log('Processing document with Document AI...');
      const [result] = await this.client.processDocument(request);
      const document = result.document;

      if (!document || !document.text) {
        console.warn('No text extracted from Document AI, using fallback');
        return this.fallbackTextExtraction(fileBuffer, mimeType);
      }

      // Extract entities for legal document detection
      const entities = this.extractEntities(document);
      
      // Analyze if it's a legal document
      const legalAnalysis = this.analyzeLegalContent(document.text, entities);

      return {
        text: document.text,
        confidence: this.calculateOverallConfidence(document),
        isLegalDocument: legalAnalysis.isLegal,
        documentType: legalAnalysis.documentType,
        entities: entities
      };

    } catch (error) {
      console.error('Document processing error:', error);
      console.log('Falling back to simple text extraction');
      return this.fallbackTextExtraction(fileBuffer, mimeType);
    }
  }

  /**
   * Extract entities from the processed document
   */
  private extractEntities(document: any): Array<{ type: string; mentionText: string; confidence: number }> {
    const entities: Array<{ type: string; mentionText: string; confidence: number }> = [];

    if (document.entities) {
      document.entities.forEach((entity: any) => {
        entities.push({
          type: entity.type || 'UNKNOWN',
          mentionText: entity.mentionText || '',
          confidence: entity.confidence || 0
        });
      });
    }

    return entities;
  }

  /**
   * Analyze if the document contains legal content
   */
  private analyzeLegalContent(text: string, entities: Array<{ type: string; mentionText: string; confidence: number }>): { isLegal: boolean; documentType: string } {
    const legalKeywords = [
  'agreement', 'contract', 'lease', 'terms and conditions', 'privacy policy',
  'liability', 'indemnification', 'jurisdiction', 'governing law',
  'whereas', 'hereby', 'herein', 'therein', 'party', 'parties',
  'covenant', 'warrant', 'represent', 'breach', 'termination',
  'intellectual property', 'confidentiality', 'non-disclosure',
  'license', 'copyright', 'trademark', 'patent',
  'arbitration', 'mediation', 'dispute resolution',
  'force majeure', 'amendment', 'modification', 'assignment',
  'partnership', 'partner', 'partners', 'profit sharing', 'capital contribution',
  'services', 'service provider', 'client', 'deliverables', 'scope of work', 'fees',
  'loan', 'borrower', 'lender', 'interest rate', 'repayment', 'principal',
  'franchise', 'franchisor', 'franchisee', 'territory', 'royalty',
  'settlement', 'release', 'claims', 'waiver',
  'shares', 'shareholder', 'stock', 'equity', 'voting rights', 'dividends',
  'memorandum', 'understanding', 'intent', 'collaboration'
];

const documentTypes = [
  { keywords: ['lease', 'rent', 'tenant', 'landlord', 'premises'], type: 'LEASE_AGREEMENT' },
  { keywords: ['employment', 'employee', 'employer', 'work', 'salary'], type: 'EMPLOYMENT_CONTRACT' },
  { keywords: ['privacy', 'data', 'personal information', 'cookies'], type: 'PRIVACY_POLICY' },
  { keywords: ['terms of service', 'terms of use', 'user agreement'], type: 'TERMS_OF_SERVICE' },
  { keywords: ['non-disclosure', 'confidential', 'proprietary'], type: 'NDA' },
  { keywords: ['purchase', 'sale', 'buyer', 'seller', 'goods'], type: 'PURCHASE_AGREEMENT' },
  { keywords: ['license', 'software', 'intellectual property'], type: 'LICENSE_AGREEMENT' },
  { keywords: ['partnership', 'partner', 'partners', 'profit sharing', 'capital contribution'], type: 'PARTNERSHIP_AGREEMENT' },
  { keywords: ['services', 'service provider', 'client', 'deliverables', 'scope of work', 'fees'], type: 'SERVICE_AGREEMENT' },
  { keywords: ['loan', 'borrower', 'lender', 'interest rate', 'repayment', 'principal'], type: 'LOAN_AGREEMENT' },
  { keywords: ['franchise', 'franchisor', 'franchisee', 'territory', 'royalty'], type: 'FRANCHISE_AGREEMENT' },
  { keywords: ['settlement', 'release', 'claims', 'waiver'], type: 'SETTLEMENT_AGREEMENT' },
  { keywords: ['shares', 'shareholder', 'stock', 'equity', 'voting rights', 'dividends'], type: 'SHAREHOLDER_AGREEMENT' },
  { keywords: ['memorandum', 'understanding', 'intent', 'collaboration'], type: 'MOU' }
];


    const textLower = text.toLowerCase();
    
    // Count legal keyword matches
    const keywordMatches = legalKeywords.filter(keyword => 
      textLower.includes(keyword.toLowerCase())
    ).length;

    // Determine document type
    let documentType = 'GENERAL_LEGAL';
    let maxMatches = 0;

    documentTypes.forEach(type => {
      const matches = type.keywords.filter(keyword => 
        textLower.includes(keyword.toLowerCase())
      ).length;
      
      if (matches > maxMatches) {
        maxMatches = matches;
        documentType = type.type;
      }
    });

    // Consider it a legal document if:
    // - Has significant legal keyword density
    // - Contains legal entities
    // - Has typical legal document structure
    const legalKeywordDensity = keywordMatches / Math.max(text.split(' ').length / 100, 1);
    const hasLegalEntities = entities.some(entity => 
      ['PERSON', 'ORGANIZATION', 'DATE', 'MONEY'].includes(entity.type)
    );

    const isLegal = legalKeywordDensity >= 2 || keywordMatches >= 5 || hasLegalEntities;

    return {
      isLegal,
      documentType: isLegal ? documentType : 'NON_LEGAL'
    };
  }

  /**
   * Calculate overall confidence score from document processing
   */
  private calculateOverallConfidence(document: any): number {
    if (!document.pages || document.pages.length === 0) {
      return 0;
    }

    let totalConfidence = 0;
    let elementCount = 0;

    document.pages.forEach((page: any) => {
      if (page.tokens) {
        page.tokens.forEach((token: any) => {
          if (token.detectedBreak && token.detectedBreak.confidence) {
            totalConfidence += token.detectedBreak.confidence;
            elementCount++;
          }
        });
      }
    });

    return elementCount > 0 ? totalConfidence / elementCount : 0.85; // Default confidence
  }

  /**
   * Validate if a file is supported for processing
   */
  isValidDocumentType(mimeType: string): boolean {
    const supportedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/png',
      'image/jpeg',
      'image/tiff'
    ];

    return supportedTypes.includes(mimeType);
  }

  /**
   * Fallback text extraction when Document AI is not available
   */
  private fallbackTextExtraction(fileBuffer: Buffer, mimeType: string): DocumentProcessingResult {
    let extractedText = '';
    
    // For text files, extract directly
    if (mimeType === 'text/plain') {
      extractedText = fileBuffer.toString('utf-8');
    } else {
      // For other file types, create a simple placeholder
      extractedText = `[Document content - ${mimeType}] This is a placeholder for document text. ` +
        'Document AI processor is not configured. Please configure Document AI processor ID in your environment variables.';
    }

    // Simple legal document detection based on filename and basic content
    const entities: Array<{ type: string; mentionText: string; confidence: number }> = [];
    const legalAnalysis = this.analyzeLegalContent(extractedText, entities);

    return {
      text: extractedText,
      confidence: 0.5, // Lower confidence for fallback
      isLegalDocument: legalAnalysis.isLegal,
      documentType: legalAnalysis.documentType,
      entities: entities
    };
  }
}
