// Frontend API service for communicating with backend routes
export interface DocumentAnalysis {
  id: string;
  filename: string;
  documentType: string;
  isLegalDocument: boolean;
  confidence: number;
  analysis: {
    summary: string;
    riskScore: number;
    keyRisks: Array<{
      category?: string;
      description?: string;
      severity?: string;
      recommendation?: string;
    } | string>;
    obligations: Array<{
      party?: string;
      description?: string;
      deadline?: string;
    } | string>;
    rights: Array<{
      party?: string;
      description?: string;
    } | string>;
    keyTerms: Array<{
      term?: string;
      definition?: string;
      importance?: string;
    } | string>;
    recommendations: Array<string>;
  };
  uploadTime: string;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  confidence?: number;
  sources?: string[];
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  private baseUrl = '';

  async uploadDocument(file: File): Promise<ApiResponse<DocumentAnalysis>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Upload failed' };
      }

      if (result.success) {
        return { success: true, data: result.document };
      } else {
        return { success: false, error: result.error || 'Upload failed' };
      }
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  async validateDocument(file: File): Promise<ApiResponse<{ isValid: boolean; isLegalDocument: boolean; message: string }>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/validate', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Validation failed' };
      }

      if (result.success) {
        return { success: true, data: result.validation };
      } else {
        return { success: false, error: result.error || 'Validation failed' };
      }
    } catch (error) {
      console.error('Validation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  async getDocument(documentId: string): Promise<ApiResponse<DocumentAnalysis>> {
    try {
      const response = await fetch(`/api/documents?id=${documentId}`);
      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to fetch document' };
      }

      if (result.success) {
        return { success: true, data: result.document };
      } else {
        return { success: false, error: result.error || 'Document not found' };
      }
    } catch (error) {
      console.error('Get document error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  async getAllDocuments(): Promise<ApiResponse<DocumentAnalysis[]>> {
    try {
      const response = await fetch('/api/documents');
      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to fetch documents' };
      }

      if (result.success) {
        return { success: true, data: result.documents };
      } else {
        return { success: false, error: result.error || 'Failed to fetch documents' };
      }
    } catch (error) {
      console.error('Get documents error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  async sendChatMessage(documentId: string, query: string): Promise<ApiResponse<ChatResponse>> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          query
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Chat request failed' };
      }

      if (result.success) {
        return { 
          success: true, 
          data: {
            success: true,
            response: result.response,
            confidence: result.confidence,
            sources: result.sources,
            timestamp: result.timestamp
          }
        };
      } else {
        return { success: false, error: result.error || 'Chat request failed' };
      }
    } catch (error) {
      console.error('Chat error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  async checkHealth(): Promise<ApiResponse<{ status: string }>> {
    try {
      const response = await fetch('/api/health');
      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: 'Health check failed' };
      }

      return { success: true, data: result };
    } catch (error) {
      console.error('Health check error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }
}

export const apiService = new ApiService();
