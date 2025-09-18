import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase-config';
import { ProcessedDocument } from './legal-document-service';

// Firestore collection names
const COLLECTIONS = {
  DOCUMENTS: 'documents',
  CHAT_HISTORY: 'chat_history'
} as const;

// Document interface for Firestore
export interface FirestoreDocument {
  documentId: string;
  originalFilename: string;
  documentType: string;
  isLegalDocument: boolean;
  confidence: number;
  extractedText: string;
  fileSize: number;
  mimeType: string;
  analysis: {
    summary: string;
    riskScore: number;
    keyRisks: any[];
    obligations: any[];
    rights: any[];
    keyTerms: any[];
    recommendations: string[];
  };
  uploadTime: Timestamp;
  lastAccessed: Timestamp;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    sessionId?: string;
  };
}

// Chat message interface
export interface ChatMessage {
  id?: string;
  documentId: string;
  query: string;
  response: string;
  confidence: number;
  timestamp: Timestamp;
  sources?: string[];
}

/**
 * Firestore Database Service for Legal-Lens
 * Handles all document storage, retrieval, and chat history
 */
export class FirestoreService {
  private static instance: FirestoreService;

  private constructor() {
    console.log('🔥 FirestoreService initialized');
  }

  /**
   * Check if Firebase is properly configured
   */
  private isFirebaseConfigured(): boolean {
    return !!(
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'demo-project'
    );
  }

  static getInstance(): FirestoreService {
    if (!FirestoreService.instance) {
      FirestoreService.instance = new FirestoreService();
    }
    return FirestoreService.instance;
  }

  /**
   * Store a processed document in Firestore
   */
  async storeDocument(document: ProcessedDocument): Promise<void> {
    // Skip if Firebase is not properly configured
    if (!this.isFirebaseConfigured()) {
      console.log('⚠️ Firebase not configured, skipping Firestore storage');
      return;
    }

    try {
      console.log('🔥 Storing document in Firestore:', document.id);
      
      const firestoreDoc: FirestoreDocument = {
        documentId: document.id,
        originalFilename: document.originalFilename,
        documentType: document.documentProcessing.documentType,
        isLegalDocument: document.documentProcessing.isLegalDocument,
        confidence: document.documentProcessing.confidence,
        extractedText: document.documentProcessing.text,
        fileSize: document.fileBuffer?.length || 0,
        mimeType: document.mimeType,
        analysis: {
          summary: document.legalAnalysis.summary,
          riskScore: document.legalAnalysis.riskScore,
          keyRisks: document.legalAnalysis.keyRisks,
          obligations: document.legalAnalysis.obligations,
          rights: document.legalAnalysis.rights,
          keyTerms: document.legalAnalysis.keyTerms,
          recommendations: document.legalAnalysis.recommendations
        },
        uploadTime: Timestamp.fromDate(new Date(document.uploadTime)),
        lastAccessed: Timestamp.now(),
        metadata: {
          sessionId: this.generateSessionId()
        }
      };

      const docRef = doc(db, COLLECTIONS.DOCUMENTS, document.id);
      await setDoc(docRef, firestoreDoc);
      
      console.log('✅ Document stored successfully in Firestore');
    } catch (error) {
      console.error('❌ Error storing document in Firestore:', error);
      throw new Error(`Failed to store document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve a document from Firestore
   */
  async getDocument(documentId: string): Promise<ProcessedDocument | null> {
    // Skip if Firebase is not properly configured
    if (!this.isFirebaseConfigured()) {
      console.log('⚠️ Firebase not configured, skipping Firestore retrieval');
      return null;
    }

    try {
      console.log('🔍 Retrieving document from Firestore:', documentId);
      
      const docRef = doc(db, COLLECTIONS.DOCUMENTS, documentId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.log('❌ Document not found in Firestore');
        return null;
      }

      const data = docSnap.data() as FirestoreDocument;
      
      // Update last accessed time
      await updateDoc(docRef, {
        lastAccessed: Timestamp.now()
      });

      // Convert Firestore document back to ProcessedDocument format
      const processedDoc: ProcessedDocument = {
        id: data.documentId,
        originalFilename: data.originalFilename,
        mimeType: data.mimeType,
        uploadTime: data.uploadTime.toDate(),
        fileHash: `hash_${data.documentId}`, // Generate simple hash
        documentProcessing: {
          text: data.extractedText,
          documentType: data.documentType,
          isLegalDocument: data.isLegalDocument,
          confidence: data.confidence,
          entities: [] // Empty entities array for now
        },
        legalAnalysis: {
          summary: data.analysis.summary,
          riskScore: data.analysis.riskScore,
          keyRisks: data.analysis.keyRisks,
          obligations: data.analysis.obligations,
          rights: data.analysis.rights,
          keyTerms: data.analysis.keyTerms,
          recommendations: data.analysis.recommendations
        }
      };

      console.log('✅ Document retrieved successfully from Firestore');
      return processedDoc;
      
    } catch (error) {
      console.error('❌ Error retrieving document from Firestore:', error);
      throw new Error(`Failed to retrieve document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if a document exists in Firestore
   */
  async documentExists(documentId: string): Promise<boolean> {
    // Skip if Firebase is not properly configured
    if (!this.isFirebaseConfigured()) {
      console.log('⚠️ Firebase not configured, assuming document does not exist');
      return false;
    }

    try {
      const docRef = doc(db, COLLECTIONS.DOCUMENTS, documentId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      console.error('❌ Error checking document existence:', error);
      return false;
    }
  }

  /**
   * Get all documents (with pagination)
   */
  async getAllDocuments(limitCount: number = 50): Promise<ProcessedDocument[]> {
    // Skip if Firebase is not properly configured
    if (!this.isFirebaseConfigured()) {
      console.log('⚠️ Firebase not configured, returning empty document list');
      return [];
    }

    try {
      console.log('📄 Retrieving all documents from Firestore');
      
      const q = query(
        collection(db, COLLECTIONS.DOCUMENTS),
        orderBy('uploadTime', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const documents: ProcessedDocument[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirestoreDocument;
        const processedDoc: ProcessedDocument = {
          id: data.documentId,
          originalFilename: data.originalFilename,
          mimeType: data.mimeType,
          uploadTime: data.uploadTime.toDate(),
          fileHash: `hash_${data.documentId}`,
          documentProcessing: {
            text: data.extractedText,
            documentType: data.documentType,
            isLegalDocument: data.isLegalDocument,
            confidence: data.confidence,
            entities: []
          },
          legalAnalysis: {
            summary: data.analysis.summary,
            riskScore: data.analysis.riskScore,
            keyRisks: data.analysis.keyRisks,
            obligations: data.analysis.obligations,
            rights: data.analysis.rights,
            keyTerms: data.analysis.keyTerms,
            recommendations: data.analysis.recommendations
          }
        };
        documents.push(processedDoc);
      });

      console.log(`✅ Retrieved ${documents.length} documents from Firestore`);
      return documents;
    } catch (error) {
      console.error('❌ Error retrieving all documents:', error);
      throw new Error(`Failed to retrieve documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Store chat message in Firestore
   */
  async storeChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<string> {
    // Skip if Firebase is not properly configured
    if (!this.isFirebaseConfigured()) {
      console.log('⚠️ Firebase not configured, returning mock chat message ID');
      return `mock_${Date.now()}`;
    }

    try {
      console.log('💬 Storing chat message in Firestore');
      
      const chatMessage: Omit<ChatMessage, 'id'> = {
        ...message,
        timestamp: Timestamp.now()
      };

      const docRef = doc(collection(db, COLLECTIONS.CHAT_HISTORY));
      await setDoc(docRef, chatMessage);
      
      console.log('✅ Chat message stored successfully');
      return docRef.id;
    } catch (error) {
      console.error('❌ Error storing chat message:', error);
      throw new Error(`Failed to store chat message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get chat history for a document
   */
  async getChatHistory(documentId: string, limitCount: number = 50): Promise<ChatMessage[]> {
    // Skip if Firebase is not properly configured
    if (!this.isFirebaseConfigured()) {
      console.log('⚠️ Firebase not configured, returning empty chat history');
      return [];
    }

    try {
      console.log('💬 Retrieving chat history for document:', documentId);
      
      const q = query(
        collection(db, COLLECTIONS.CHAT_HISTORY),
        where('documentId', '==', documentId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const chatHistory: ChatMessage[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as ChatMessage;
        chatHistory.push({
          id: doc.id,
          ...data
        });
      });

      console.log(`✅ Retrieved ${chatHistory.length} chat messages`);
      return chatHistory.reverse(); // Return in chronological order
    } catch (error) {
      console.error('❌ Error retrieving chat history:', error);
      return []; // Return empty array on error
    }
  }

  /**
   * Delete a document from Firestore
   */
  async deleteDocument(documentId: string): Promise<void> {
    // Skip if Firebase is not properly configured
    if (!this.isFirebaseConfigured()) {
      console.log('⚠️ Firebase not configured, skipping document deletion');
      return;
    }

    try {
      console.log('🗑️ Deleting document from Firestore:', documentId);
      
      // Use batch to delete document and its chat history
      const batch = writeBatch(db);
      
      // Delete the document
      const docRef = doc(db, COLLECTIONS.DOCUMENTS, documentId);
      batch.delete(docRef);
      
      // Delete associated chat messages
      const chatQuery = query(
        collection(db, COLLECTIONS.CHAT_HISTORY),
        where('documentId', '==', documentId)
      );
      
      const chatSnapshot = await getDocs(chatQuery);
      chatSnapshot.forEach((chatDoc) => {
        batch.delete(chatDoc.ref);
      });
      
      await batch.commit();
      console.log('✅ Document and chat history deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting document:', error);
      throw new Error(`Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clean up old documents (optional - for storage management)
   */
  async cleanupOldDocuments(maxAgeHours: number = 24): Promise<number> {
    // Skip if Firebase is not properly configured
    if (!this.isFirebaseConfigured()) {
      console.log('⚠️ Firebase not configured, skipping cleanup');
      return 0;
    }

    try {
      console.log(`🧹 Cleaning up documents older than ${maxAgeHours} hours`);
      
      const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
      const cutoffTimestamp = Timestamp.fromDate(cutoffTime);
      
      const q = query(
        collection(db, COLLECTIONS.DOCUMENTS),
        where('lastAccessed', '<', cutoffTimestamp)
      );
      
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      let deleteCount = 0;
      
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
        deleteCount++;
      });
      
      if (deleteCount > 0) {
        await batch.commit();
        console.log(`✅ Cleaned up ${deleteCount} old documents`);
      }
      
      return deleteCount;
    } catch (error) {
      console.error('❌ Error cleaning up old documents:', error);
      return 0;
    }
  }

  /**
   * Generate a simple session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    totalDocuments: number;
    totalChatMessages: number;
  }> {
    // Skip if Firebase is not properly configured
    if (!this.isFirebaseConfigured()) {
      console.log('⚠️ Firebase not configured, returning zero stats');
      return { totalDocuments: 0, totalChatMessages: 0 };
    }

    try {
      const [docsSnapshot, chatSnapshot] = await Promise.all([
        getDocs(collection(db, COLLECTIONS.DOCUMENTS)),
        getDocs(collection(db, COLLECTIONS.CHAT_HISTORY))
      ]);

      return {
        totalDocuments: docsSnapshot.size,
        totalChatMessages: chatSnapshot.size
      };
    } catch (error) {
      console.error('❌ Error getting database stats:', error);
      return { totalDocuments: 0, totalChatMessages: 0 };
    }
  }
}

// Export singleton instance
export const firestoreService = FirestoreService.getInstance();