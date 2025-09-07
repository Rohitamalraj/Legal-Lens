import { ProcessedDocument } from './legal-document-service';

/**
 * Shared document store for persistence between API requests
 * In production, this should be replaced with a proper database
 */

// Declare global variable for better Next.js compatibility
declare global {
  var __LEGAL_LENS_DOCUMENT_STORE__: Map<string, ProcessedDocument> | undefined;
}

// Global document storage that persists across all requests
const globalDocumentStore = globalThis.__LEGAL_LENS_DOCUMENT_STORE__ ?? new Map<string, ProcessedDocument>();
if (!globalThis.__LEGAL_LENS_DOCUMENT_STORE__) {
  globalThis.__LEGAL_LENS_DOCUMENT_STORE__ = globalDocumentStore;
}

class DocumentStore {
  private static instance: DocumentStore;

  private constructor() {
    console.log('DocumentStore instance created - using global store');
    console.log('Global store size on creation:', globalDocumentStore.size);
  }

  static getInstance(): DocumentStore {
    if (!DocumentStore.instance) {
      DocumentStore.instance = new DocumentStore();
    }
    return DocumentStore.instance;
  }

  set(id: string, document: ProcessedDocument): void {
    console.log(`=== DOCUMENT STORE SET ===`);
    console.log(`Storing document with ID: ${id}`);
    console.log(`Document filename: ${document.originalFilename}`);
    console.log(`Global store reference:`, globalDocumentStore);
    console.log(`Store size before set: ${globalDocumentStore.size}`);
    globalDocumentStore.set(id, document);
    console.log(`Store size after set: ${globalDocumentStore.size}`);
    console.log(`Available document IDs: ${Array.from(globalDocumentStore.keys())}`);
    console.log(`Document stored successfully: ${globalDocumentStore.has(id)}`);
    console.log(`=== DOCUMENT STORE SET COMPLETE ===`);
  }

  get(id: string): ProcessedDocument | undefined {
    console.log(`=== DOCUMENT STORE GET ===`);
    console.log(`Retrieving document with ID: ${id}`);
    console.log(`Global store reference:`, globalDocumentStore);
    console.log(`Store size: ${globalDocumentStore.size}`);
    console.log(`Available document IDs: ${Array.from(globalDocumentStore.keys())}`);
    const document = globalDocumentStore.get(id);
    console.log(`Document found: ${!!document}`);
    if (document) {
      console.log(`Retrieved document filename: ${document.originalFilename}`);
    }
    console.log(`=== DOCUMENT STORE GET COMPLETE ===`);
    return document;
  }

  has(id: string): boolean {
    return globalDocumentStore.has(id);
  }

  size(): number {
    return globalDocumentStore.size;
  }

  keys(): IterableIterator<string> {
    return globalDocumentStore.keys();
  }

  entries(): IterableIterator<[string, ProcessedDocument]> {
    return globalDocumentStore.entries();
  }

  delete(id: string): boolean {
    console.log(`Deleting document with ID: ${id}`);
    const result = globalDocumentStore.delete(id);
    console.log(`Document deleted: ${result}`);
    console.log(`Remaining documents: ${globalDocumentStore.size}`);
    return result;
  }

  clear(): void {
    console.log('Clearing all documents from store');
    globalDocumentStore.clear();
  }

  getAllDocuments(): ProcessedDocument[] {
    return Array.from(globalDocumentStore.values());
  }
}

export default DocumentStore;
