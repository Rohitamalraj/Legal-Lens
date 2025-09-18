import { DocumentAIService, DocumentProcessingResult } from './document-ai';
import { vertexAIService, VertexAIService, LegalAnalysisResult, ChatResponse } from './vertex-ai';
import DocumentStore from './document-store';

export interface ProcessedDocument {
  id: string;
  originalFilename: string;
  mimeType: string;
  documentProcessing: DocumentProcessingResult;
  legalAnalysis: LegalAnalysisResult;
  uploadTime: Date;
  fileHash: string;
  fileBuffer?: Buffer;
}

export interface DocumentValidationResult {
  isValid: boolean;
  isLegal: boolean;
  documentType: string;
  confidence: number;
  message: string;
}

/**
 * Legal Document Processing Service
 * Orchestrates the complete document processing pipeline
 */
export class LegalDocumentService {
  private documentAI: DocumentAIService;
  private vertexAI: VertexAIService;
  private documentStore: DocumentStore;

  constructor() {
    console.log('Creating LegalDocumentService instance');
    this.documentAI = new DocumentAIService();
    this.vertexAI = vertexAIService.getInstance();
    this.documentStore = DocumentStore.getInstance();
    console.log('LegalDocumentService initialized with shared document store');
  }

  /**
   * Complete document processing pipeline
   */
  async processLegalDocument(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<ProcessedDocument> {
    try {
      console.log(`Starting processing for: ${filename} (${mimeType})`);

      // Generate document ID at the beginning
      const documentId = this.generateDocumentId();
      console.log(`Generated document ID: ${documentId}`);

      // Check if this document has already been processed recently
      const existingDocumentId = this.findExistingDocument(fileBuffer, filename, mimeType);
      if (existingDocumentId) {
        const existingDocument = this.documentStore.get(existingDocumentId);
        if (existingDocument) {
          console.log(`Using existing processed document: ${existingDocumentId}`);
          return existingDocument;
        }
      }

      // Step 1: Validate document type
      const validation = await this.validateDocument(fileBuffer, filename, mimeType);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      if (!validation.isLegal) {
        throw new Error('Document does not appear to be a legal document. Please upload a legal document such as contracts, leases, or agreements.');
      }

      // Step 2: Process with Document AI
      console.log('Processing document with Document AI...');
      const documentProcessing = await this.documentAI.processDocument(fileBuffer, mimeType);

      // Step 3: Analyze with Vertex AI
      console.log('Analyzing document with Vertex AI...');
      const legalAnalysis = await this.vertexAI.analyzeLegalDocument(
        documentProcessing.text,
        documentProcessing.documentType
      );

      // Step 4: Create processed document record
      const crypto = require('crypto');
      const fileHash = crypto.createHash('md5').update(fileBuffer).digest('hex');
      
      const processedDocument: ProcessedDocument = {
        id: documentId,
        originalFilename: filename,
        mimeType,
        documentProcessing,
        legalAnalysis,
        uploadTime: new Date(),
        fileHash,
        fileBuffer: undefined // Store buffer only if needed to save memory
      };

      // Store for future reference
      this.documentStore.set(documentId, processedDocument);

      console.log(`Document processing completed successfully: ${documentId}`);
      return processedDocument;

    } catch (error) {
      console.error('Document processing failed:', error);
      throw new Error(`Failed to process document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate document before processing
   */
  async validateDocument(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<DocumentValidationResult> {
    try {
      // Check file size (10MB limit)
      const maxSize = parseInt(process.env.UPLOAD_MAX_SIZE || '10485760');
      if (fileBuffer.length > maxSize) {
        return {
          isValid: false,
          isLegal: false,
          documentType: 'OVERSIZED',
          confidence: 0,
          message: `File size exceeds the ${Math.round(maxSize / 1024 / 1024)}MB limit`
        };
      }

      // Check supported file types
      if (!this.documentAI.isValidDocumentType(mimeType)) {
        return {
          isValid: false,
          isLegal: false,
          documentType: 'UNSUPPORTED',
          confidence: 0,
          message: 'Unsupported file type. Please upload PDF, DOC, DOCX, or TXT files.'
        };
      }

      // Process document to check if it's legal
      const result = await this.documentAI.processDocument(fileBuffer, mimeType);

      return {
        isValid: true,
        isLegal: result.isLegalDocument,
        documentType: result.documentType,
        confidence: result.confidence,
        message: result.isLegalDocument 
          ? `Legal document detected: ${result.documentType}` 
          : 'This does not appear to be a legal document'
      };

    } catch (error) {
      console.error('Document validation error:', error);
      return {
        isValid: false,
        isLegal: false,
        documentType: 'ERROR',
        confidence: 0,
        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Handle chat queries about processed documents
   */
  async handleChatQuery(documentId: string, query: string, fallbackDocumentText?: string, fallbackDocumentType?: string): Promise<ChatResponse> {
    try {
      console.log('=== LEGAL DOCUMENT SERVICE CHAT QUERY DEBUG ===');
      console.log('Document ID requested:', documentId);
      console.log('Query received:', query);
      console.log('Has fallback text:', !!fallbackDocumentText);
      console.log('Total processed documents in memory:', this.documentStore.size());
      console.log('Available document IDs:', Array.from(this.documentStore.keys()));
      
      const document = this.documentStore.get(documentId);
      console.log('Document found:', !!document);
      
      // If document not found in store but we have fallback text, use it
      if (!document && fallbackDocumentText) {
        console.log('Document not found in store, using fallback text');
        console.log('Fallback text length:', fallbackDocumentText.length);
        console.log('Fallback document type:', fallbackDocumentType || 'unknown');
        
        const contextString = `Document Type: ${fallbackDocumentType || 'Legal Document'}`;
        console.log('Context string for AI:', contextString);
        console.log('Calling Vertex AI with fallback document text...');

        const result = await this.vertexAI.chatQuery(
          query,
          fallbackDocumentText,
          contextString
        );
        
        console.log('Chat query completed successfully with fallback');
        console.log('=== LEGAL DOCUMENT SERVICE CHAT QUERY SUCCESS (FALLBACK) ===');
        return result;
      }
      
      if (!document) {
        console.error('Document not found in memory and no fallback provided!');
        console.error('Requested ID:', documentId);
        console.error('Available IDs:', Array.from(this.documentStore.keys()));
        throw new Error('Document not found. Please upload a document first.');
      }

      console.log('Document details:');
      console.log('- ID:', document.id);
      console.log('- Filename:', document.originalFilename);
      console.log('- Document Type:', document.documentProcessing.documentType);
      console.log('- Text length:', document.documentProcessing.text?.length || 0);
      console.log('- Upload time:', document.uploadTime);
      
      const contextString = `Document: ${document.originalFilename}, Type: ${document.documentProcessing.documentType}`;
      console.log('Context string for AI:', contextString);
      console.log('Calling Vertex AI with document text...');

      const result = await this.vertexAI.chatQuery(
        query,
        document.documentProcessing.text,
        contextString
      );
      
      console.log('Chat query completed successfully');
      console.log('=== LEGAL DOCUMENT SERVICE CHAT QUERY SUCCESS ===');
      return result;

    } catch (error) {
      console.error('=== LEGAL DOCUMENT SERVICE CHAT QUERY ERROR ===');
      console.error('Chat query error:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Document ID that failed:', documentId);
      console.error('Available documents:', Array.from(this.documentStore.keys()));
      throw new Error(`Chat query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get processed document by ID
   */
  getProcessedDocument(documentId: string): ProcessedDocument | null {
    return this.documentStore.get(documentId) || null;
  }

  /**
   * List all processed documents
   */
  getProcessedDocuments(): ProcessedDocument[] {
    return this.documentStore.getAllDocuments();
  }

  /**
   * Get document analysis summary for dashboard
   */
  getDocumentSummary(documentId: string) {
    const document = this.documentStore.get(documentId);
    if (!document) {
      return null;
    }

    const analysis = document.legalAnalysis;
    return {
      id: documentId,
      filename: document.originalFilename,
      documentType: document.documentProcessing.documentType,
      riskScore: analysis.riskScore,
      summary: analysis.summary,
      keyRisks: analysis.keyRisks.length,
      obligations: analysis.obligations.length,
      rights: analysis.rights.length,
      uploadTime: document.uploadTime,
      confidence: document.documentProcessing.confidence
    };
  }

  /**
   * Get full document content for chat functionality
   */
  getDocumentForChat(documentId: string) {
    const document = this.documentStore.get(documentId);
    if (!document) {
      return null;
    }

    return {
      id: documentId,
      filename: document.originalFilename,
      documentType: document.documentProcessing.documentType,
      extractedText: document.documentProcessing.text,
      legalAnalysis: document.legalAnalysis,
      uploadTime: document.uploadTime,
      confidence: document.documentProcessing.confidence
    };
  }

  /**
   * List all processed documents
   */
  listProcessedDocuments() {
    const documents = [];
    for (const [id, document] of this.documentStore.entries()) {
      documents.push({
        id,
        filename: document.originalFilename,
        documentType: document.documentProcessing.documentType,
        uploadTime: document.uploadTime,
        riskScore: document.legalAnalysis.riskScore
      });
    }
    return documents.sort((a, b) => b.uploadTime.getTime() - a.uploadTime.getTime());
  }

  /**
   * Check if a document with the same content already exists
   */
  private findExistingDocument(fileBuffer: Buffer, filename: string, mimeType: string): string | null {
    // Generate hash of the file content for comparison
    const crypto = require('crypto');
    const fileHash = crypto.createHash('md5').update(fileBuffer).digest('hex');
    
    // Check all existing documents for a match
    for (const [documentId, document] of this.documentStore.entries()) {
      // Compare file hash (most reliable)
      if (document.fileHash === fileHash) {
        console.log(`Found existing document with same content: ${documentId}`);
        return documentId;
      }
      
      // Fallback: compare filename and size if hash is not available
      if (document.originalFilename === filename && 
          document.fileBuffer && 
          document.fileBuffer.length === fileBuffer.length) {
        console.log(`Found existing document with same filename and size: ${documentId}`);
        return documentId;
      }
    }
    
    return null;
  }

  /**
   * Generate unique document ID
   */
  private generateDocumentId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `doc_${timestamp}_${random}`;
  }

  /**
   * Clean up old documents (optional - for memory management)
   */
  cleanupOldDocuments(maxAge: number = 24 * 60 * 60 * 1000): number {
    const cutoffTime = new Date(Date.now() - maxAge);
    let cleaned = 0;

    for (const [id, document] of this.documentStore.entries()) {
      if (document.uploadTime < cutoffTime) {
        this.documentStore.delete(id);
        cleaned++;
      }
    }

    console.log(`Cleaned up ${cleaned} old documents`);
    return cleaned;
  }
}
