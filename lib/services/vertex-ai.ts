import { VertexAI } from '@google-cloud/vertexai';
import { GoogleCloudConfig } from './google-cloud-config';

export interface LegalAnalysisResult {
  summary: string;
  riskScore: number;
  keyRisks: Array<{
    category: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    recommendation: string;
  }>;
  obligations: Array<{
    party: string;
    description: string;
    deadline?: string;
  }>;
  rights: Array<{
    party: string;
    description: string;
  }>;
  keyTerms: Array<{
    term: string;
    definition: string;
    importance: 'LOW' | 'MEDIUM' | 'HIGH';
  }>;
  recommendations: string[];
}

export interface ChatResponse {
  response: string;
  confidence: number;
  sources?: string[];
}

export interface ClauseData {
  id: string;
  type: string;
  title: string;
  originalText: string;
  simplifiedPoints: string[];
  keyTakeaway: string;
}

export interface RiskData {
  id: string;
  level: 'high' | 'medium' | 'low';
  title: string;
  section: string;
  description: string;
  recommendation: string;
  impact: string;
}

export interface DetailedAnalysisResult {
  clauses: ClauseData[];
  risks: RiskData[];
}

/**
 * Vertex AI Service
 * Handles AI-powered legal document analysis using Gemini
 */
export class VertexAIService {
  private vertexAI: any;
  private cloudConfig: GoogleCloudConfig;
  private projectId: string;
  private location: string;
  private model: string;

  constructor() {
    this.cloudConfig = GoogleCloudConfig.getInstance();
    this.projectId = this.cloudConfig.getProjectId();
    this.location = process.env.VERTEX_AI_LOCATION || 'us-central1';
    this.model = process.env.VERTEX_AI_MODEL || 'gemini-1.5-pro';

    // Initialize Vertex AI client
    const credentials = this.cloudConfig.getCredentials();
    if (credentials) {
      this.vertexAI = new VertexAI({
        project: this.projectId,
        location: this.location,
        googleAuthOptions: {
          credentials: credentials
        }
      });
    } else {
      // Use Application Default Credentials
      this.vertexAI = new VertexAI({
        project: this.projectId,
        location: this.location
      });
    }
  }

  /**
   * Analyze legal document and provide comprehensive analysis
   */
  async analyzeLegalDocument(documentText: string, documentType: string): Promise<LegalAnalysisResult> {
    try {
      const prompt = this.buildAnalysisPrompt(documentText, documentType);
      
      const generativeModel = this.vertexAI.getGenerativeModel({
        model: this.model,
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.2,
          topP: 0.8,
        },
      });

      console.log('Analyzing document with Vertex AI...');
      const result = await generativeModel.generateContent(prompt);
      
console.log("Gemini AI response:", result.response?.candidates?.[0]?.content?.parts[0]?.text);
      const response = result.response;
      
      if (!response || !response.candidates || response.candidates.length === 0) {
        throw new Error('No analysis generated');
      }

      const analysisText = response.candidates[0].content.parts[0].text || '';
      return this.parseAnalysisResult(analysisText);

    } catch (error) {
      console.error('Vertex AI analysis error:', error);
      
      // Fallback to mock analysis if Vertex AI is not available
      console.log('Falling back to mock analysis due to Vertex AI unavailability');
      return this.generateMockAnalysis(documentText, documentType);
    }
  }

  /**
   * Handle chat queries about the legal document
   */
  async chatQuery(query: string, documentText: string, context?: string): Promise<ChatResponse> {
    try {
      console.log('=== VERTEX AI CHAT QUERY DEBUG ===');
      console.log('Query received:', query);
      console.log('Document text length:', documentText?.length || 0);
      console.log('Document text preview:', documentText?.substring(0, 200) || 'No document text');
      console.log('Context provided:', context || 'No context');
      
      const prompt = this.buildChatPrompt(query, documentText, context);
      console.log('Generated prompt preview:', prompt.substring(0, 300) + '...');
      
      const generativeModel = this.vertexAI.getGenerativeModel({
        model: this.model,
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.3,
          topP: 0.9,
        },
      });
      
      console.log('Processing chat query with Vertex AI...');
      console.log('Model:', this.model);
      console.log('Project ID:', this.projectId);
      console.log('Location:', this.location);

      const result = await generativeModel.generateContent(prompt);
      const response = result.response;
      
      if (!response || !response.candidates || response.candidates.length === 0) {
        console.error('No response from Vertex AI:', response);
        throw new Error('No response generated');
      }

      const responseText = response.candidates[0].content.parts[0].text || '';
      console.log("Gemini AI chat response:", responseText);
      console.log("Response confidence calculated:", this.calculateResponseConfidence(responseText));
      console.log("Sources extracted:", this.extractSources(responseText, documentText));
      console.log('=== VERTEX AI CHAT QUERY SUCCESS ===');
      
      return {
        response: responseText,
        confidence: this.calculateResponseConfidence(responseText),
        sources: this.extractSources(responseText, documentText)
      };

    } catch (error) {
      console.error('=== VERTEX AI CHAT QUERY ERROR ===');
      console.error('Vertex AI chat error:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      throw new Error(`Chat query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build comprehensive analysis prompt
   */
  private buildAnalysisPrompt(documentText: string, documentType: string): string {
    return `You are an expert legal analyst. Analyze the following ${documentType} document and provide a comprehensive analysis.

Document Text:
${documentText}

CRITICAL INSTRUCTIONS:
- Return ONLY valid JSON with no additional text, explanations, or markdown
- Use double quotes for all strings
- Do not include trailing commas
- Escape any quotes within string values
- Ensure all brackets and braces are properly closed

Provide your analysis in this EXACT JSON structure:
{
  "summary": "A clear, concise summary in plain English (2-3 paragraphs)",
  "riskScore": 50,
  "keyRisks": [
    {
      "category": "Risk category",
      "description": "Risk description",
      "severity": "LOW",
      "recommendation": "How to mitigate this risk"
    }
  ],
  "obligations": [
    {
      "party": "Who has the obligation",
      "description": "What they must do",
      "deadline": "When if specified or null"
    }
  ],
  "rights": [
    {
      "party": "Who has the right",
      "description": "What right they have"
    }
  ],
  "keyTerms": [
    {
      "term": "Important term or clause",
      "definition": "What it means in plain English",
      "importance": "LOW"
    }
  ],
  "recommendations": ["List of actionable recommendations"]
}

REQUIREMENTS:
1. riskScore must be a number from 0-100
2. severity must be exactly one of: "LOW", "MEDIUM", "HIGH", "CRITICAL"
3. importance must be exactly one of: "LOW", "MEDIUM", "HIGH"
4. All array fields must be arrays (use empty arrays [] if no data)
5. Return ONLY the JSON object, no explanatory text before or after

Focus on identifying risks, explaining legal terms, highlighting obligations, and providing practical recommendations for non-lawyers.`;
  }

  /**
   * Build chat prompt for Q&A
   */private buildChatPrompt(
  query: string,
  documentText?: string,
  context?: string,
  language: string = "English" // default English if not provided
): string {
  if (documentText && documentText.trim().length > 0) {
    return `You are a legal expert helping someone understand a legal document.
Answer their question clearly and concisely in plain ${language}.

Document Context:
${documentText}

${context ? `Previous Context: ${context}` : ''}

User Question: ${query}

Guidelines:
1. Answer in plain ${language}, avoiding legal jargon
2. Be specific and reference relevant sections of the document
3. If the document doesn't contain the answer, say so clearly
4. Provide practical implications when relevant
5. Keep responses helpful but not overly long
6. If legal advice is needed, recommend consulting a lawyer in the user's jurisdiction

Answer:`;
  }

  // Fallback: general knowledge mode
  return `You are a legal expert. Answer the user's question clearly and concisely in plain ${language}.

${context ? `Previous Context: ${context}` : ''}

User Question: ${query}

Guidelines:
1. Answer in plain ${language}, avoiding legal jargon
2. Provide practical implications when relevant
3. Keep responses helpful but not overly long
4. If legal advice is needed, recommend consulting a lawyer in the user's jurisdiction

Answer:`;
}

  /**
   * Parse the AI analysis result from JSON string
   */
  private parseAnalysisResult(analysisText: string): LegalAnalysisResult {
    try {
      console.log('=== PARSING ANALYSIS RESULT ===');
      console.log('Raw analysis text length:', analysisText.length);
      console.log('Raw analysis preview:', analysisText.substring(0, 500));
      
      // Clean up the response to extract JSON
      let jsonText = analysisText.trim();
      
      // Remove markdown code blocks if present (more thorough cleaning)
      jsonText = jsonText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
      jsonText = jsonText.replace(/^```\s*/i, '').replace(/```\s*$/i, '');
      
      // Remove any leading/trailing whitespace again
      jsonText = jsonText.trim();
      
      console.log('Cleaned JSON text for parsing:', jsonText.substring(0, 200) + '...');
      
      const parsed = JSON.parse(jsonText);
      
      // Validate and set defaults - ensure riskScore is a number
      const riskScore = typeof parsed.riskScore === 'string' ? 
        parseInt(parsed.riskScore, 10) : 
        (parsed.riskScore || 0);
      
      return {
        summary: parsed.summary || 'No summary available',
        riskScore: Math.min(Math.max(riskScore, 0), 100),
        keyRisks: Array.isArray(parsed.keyRisks) ? parsed.keyRisks : [],
        obligations: Array.isArray(parsed.obligations) ? parsed.obligations : [],
        rights: Array.isArray(parsed.rights) ? parsed.rights : [],
        keyTerms: Array.isArray(parsed.keyTerms) ? parsed.keyTerms : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
      };
      
    } catch (error) {
      console.error('Failed to parse analysis result:', error);
      console.error('Original analysis text:', analysisText.substring(0, 500) + '...');
      
      // Fallback: try to extract information manually
      return this.fallbackAnalysis(analysisText);
    }
  }

  /**
   * Clean JSON string to fix common formatting issues
   */
  private cleanJsonString(jsonText: string): string {
    // Remove any text before the first {
    const firstBrace = jsonText.indexOf('{');
    if (firstBrace > 0) {
      jsonText = jsonText.substring(firstBrace);
    }
    
    // Remove any text after the last }
    const lastBrace = jsonText.lastIndexOf('}');
    if (lastBrace >= 0 && lastBrace < jsonText.length - 1) {
      jsonText = jsonText.substring(0, lastBrace + 1);
    }
    
    // Fix common JSON issues
    jsonText = jsonText
      // Remove markdown remnants
      .replace(/```json|```/g, '')
      // Replace single quotes with double quotes for property names
      .replace(/(\s*)'([^']+)'(\s*):/g, '$1"$2"$3:')
      // Replace single quotes with double quotes for string values (be careful with apostrophes)
      .replace(/:\s*'([^'\\]*(?:\\.[^'\\]*)*)'(\s*[,}\]])/g, ': "$1"$2')
      // Remove trailing commas before closing brackets or braces
      .replace(/,(\s*[}\]])/g, '$1')
      // Fix duplicate commas
      .replace(/,,+/g, ',')
      // Fix missing commas between objects in arrays
      .replace(/}\s*{/g, '}, {')
      // Fix missing commas between array elements
      .replace(/]\s*\[/g, '], [')
      // Ensure proper spacing around colons
      .replace(/"\s*:\s*/g, '": ')
      // Fix potential issues with line breaks in strings
      .replace(/"\s*\n\s*"/g, '" "')
      // Remove any control characters that might break JSON
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    
    return jsonText.trim();
  }

  /**
   * Try alternative parsing methods
   */
  private tryAlternativeParsing(analysisText: string): LegalAnalysisResult | null {
    try {
      // Method 1: Try to find JSON object within the text
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const potentialJson = this.cleanJsonString(jsonMatch[0]);
        try {
          const parsed = JSON.parse(potentialJson);
          console.log('Successfully parsed JSON from match');
          return {
            summary: parsed.summary || 'No summary available',
            riskScore: Math.min(Math.max(parsed.riskScore || 0, 0), 100),
            keyRisks: Array.isArray(parsed.keyRisks) ? parsed.keyRisks : [],
            obligations: Array.isArray(parsed.obligations) ? parsed.obligations : [],
            rights: Array.isArray(parsed.rights) ? parsed.rights : [],
            keyTerms: Array.isArray(parsed.keyTerms) ? parsed.keyTerms : [],
            recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
          };
        } catch (innerError) {
          console.log('JSON match parsing failed:', innerError instanceof Error ? innerError.message : innerError);
        }
      }
      
      // Method 2: Try manual extraction using regex patterns
      const extractedData = this.extractDataManually(analysisText);
      if (extractedData) {
        console.log('Successfully extracted data manually');
        return extractedData;
      }
    } catch (error) {
      console.log('Alternative parsing also failed:', error instanceof Error ? error.message : error);
    }
    
    return null;
  }

  /**
   * Extract data manually using regex patterns
   */
  private extractDataManually(text: string): LegalAnalysisResult | null {
    try {
      const result: any = {};
      
      // Extract summary
      const summaryMatch = text.match(/"summary"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
      if (summaryMatch) {
        result.summary = summaryMatch[1].replace(/\\"/g, '"');
      }
      
      // Extract risk score
      const riskScoreMatch = text.match(/"riskScore"\s*:\s*(\d+)/);
      if (riskScoreMatch) {
        result.riskScore = parseInt(riskScoreMatch[1]);
      }
      
      // Extract arrays - this is more complex, but let's try basic extraction
      const keyRisksMatch = text.match(/"keyRisks"\s*:\s*\[([\s\S]*?)\]/);
      if (keyRisksMatch) {
        try {
          result.keyRisks = JSON.parse(`[${keyRisksMatch[1]}]`);
        } catch {
          result.keyRisks = [];
        }
      }
      
      // If we got at least summary or risk score, return partial result
      if (result.summary || result.riskScore) {
        return {
          summary: result.summary || 'Analysis completed',
          riskScore: result.riskScore || 50,
          keyRisks: result.keyRisks || [],
          obligations: result.obligations || [],
          rights: result.rights || [],
          keyTerms: result.keyTerms || [],
          recommendations: result.recommendations || []
        };
      }
    } catch (error) {
      console.error('Manual extraction failed:', error);
    }
    
    return null;
  }

  /**
   * Fallback analysis if JSON parsing fails
   */
  private fallbackAnalysis(analysisText: string): LegalAnalysisResult {
    // Try to extract JSON from markdown if it's wrapped
    const jsonMatch = analysisText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        console.log('Successfully extracted JSON from markdown in fallback');
        
        const riskScore = typeof parsed.riskScore === 'string' ? 
          parseInt(parsed.riskScore, 10) : 
          (parsed.riskScore || 50);
        
        return {
          summary: parsed.summary || 'Analysis completed but formatting error occurred.',
          riskScore: Math.min(Math.max(riskScore, 0), 100),
          keyRisks: Array.isArray(parsed.keyRisks) ? parsed.keyRisks : [{
            category: 'General',
            description: 'Please review the document carefully for potential risks.',
            severity: 'MEDIUM' as const,
            recommendation: 'Consider consulting with a legal professional.'
          }],
          obligations: Array.isArray(parsed.obligations) ? parsed.obligations : [],
          rights: Array.isArray(parsed.rights) ? parsed.rights : [],
          keyTerms: Array.isArray(parsed.keyTerms) ? parsed.keyTerms : [],
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : ['Review all terms carefully', 'Consider legal consultation if needed']
        };
      } catch (e) {
        console.error('Failed to parse JSON even in fallback:', e);
      }
    }
    
    // Ultimate fallback
    return {
      summary: analysisText.length > 0 ? analysisText : 'Analysis completed but formatting error occurred.',
      riskScore: 50, // Default moderate risk
      keyRisks: [{
        category: 'General',
        description: 'Please review the document carefully for potential risks.',
        severity: 'MEDIUM' as const,
        recommendation: 'Consider consulting with a legal professional.'
      }],
      obligations: [],
      rights: [],
      keyTerms: [],
      recommendations: ['Review all terms carefully', 'Consider legal consultation if needed']
    };
  }

  /**
   * Calculate confidence score for chat responses
   */
  private calculateResponseConfidence(responseText: string): number {
    // Simple heuristic based on response characteristics
    let confidence = 0.7; // Base confidence
    
    if (responseText.includes('I don\'t know') || responseText.includes('not specified')) {
      confidence -= 0.2;
    }
    
    if (responseText.includes('specifically states') || responseText.includes('according to')) {
      confidence += 0.2;
    }
    
    if (responseText.length < 50) {
      confidence -= 0.1;
    }
    
    return Math.min(Math.max(confidence, 0), 1);
  }

  /**
   * Extract potential sources/references from response
   */
  private extractSources(responseText: string, documentText: string): string[] {
    const sources: string[] = [];
    
    // Look for section references
    const sectionMatches = responseText.match(/section \d+/gi);
    if (sectionMatches) {
      sources.push(...sectionMatches);
    }
    
    // Look for specific terms mentioned
    const commonTerms = ['clause', 'paragraph', 'article', 'subsection'];
    commonTerms.forEach(term => {
      const regex = new RegExp(`${term} \\w+`, 'gi');
      const matches = responseText.match(regex);
      if (matches) {
        sources.push(...matches);
      }
    });
    
    return [...new Set(sources)]; // Remove duplicates
  }

  /**
   * Generate mock analysis when Vertex AI is not available
   */
  private generateMockAnalysis(documentText: string, documentType: string): LegalAnalysisResult {
    const textLength = documentText.length;
    const complexity = textLength > 5000 ? 'HIGH' : textLength > 2000 ? 'MEDIUM' : 'LOW';
    
    return {
      summary: `This ${documentType} contains key legal provisions and obligations. The document appears to be a standard legal agreement with typical terms and conditions. Due to Vertex AI service unavailability, this is a fallback analysis.`,
      
      riskScore: textLength > 5000 ? 75 : textLength > 2000 ? 60 : 45,
      
      keyRisks: [
        {
          category: "Service Availability",
          description: "AI analysis service temporarily unavailable - manual review recommended",
          severity: "MEDIUM" as const,
          recommendation: "Enable Vertex AI API in Google Cloud Console for detailed analysis"
        },
        {
          category: "Document Complexity",
          description: `Document complexity assessed as ${complexity} based on length`,
          severity: complexity === 'HIGH' ? "HIGH" as const : "MEDIUM" as const,
          recommendation: "Consider professional legal review for complex documents"
        }
      ],
      
      obligations: [
        {
          party: "Both Parties",
          description: "Review and understand all terms before signing",
          deadline: "Before execution"
        }
      ],
      
      rights: [
        {
          party: "Document Holder",
          description: "Right to seek legal counsel for document interpretation"
        }
      ],
      
      keyTerms: [
        {
          term: "Legal Review",
          definition: "Professional examination of legal document terms",
          importance: "HIGH" as const
        }
      ],
      
      recommendations: [
        "Enable Vertex AI API for detailed AI-powered analysis",
        "Consider professional legal review",
        "Ensure all parties understand the document terms"
      ]
    };
  }

  /**
   * Analyze document for detailed clauses and risk information
   */
  async analyzeClausesAndRisks(documentText: string): Promise<DetailedAnalysisResult> {
    try {
      console.log('=== DETAILED ANALYSIS START ===');
      console.log('Document text length:', documentText.length);
      console.log('Project ID:', this.projectId);
      console.log('Location:', this.location);
      console.log('Model:', this.model);

      const prompt = this.buildDetailedAnalysisPrompt(documentText);
      console.log('Generated prompt length:', prompt.length);
      console.log('Prompt preview:', prompt.substring(0, 500) + '...');
      
      const generativeModel = this.vertexAI.getGenerativeModel({
        model: this.model,
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.2,
          topP: 0.8,
        },
      });

      console.log('Analyzing document clauses and risks with Vertex AI...');
      const result = await generativeModel.generateContent(prompt);
      
      console.log('Raw Vertex AI response received');
      console.log('Response structure:', {
        hasResponse: !!result.response,
        hasCandidates: !!result.response?.candidates,
        candidatesLength: result.response?.candidates?.length || 0
      });

      const response = result.response;
      
      if (!response || !response.candidates || response.candidates.length === 0) {
        console.error('No detailed analysis generated from Vertex AI');
        throw new Error('No detailed analysis generated from Vertex AI - empty response');
      }

      const analysisText = response.candidates[0].content.parts[0].text || '';
      console.log('Analysis text received, length:', analysisText.length);
      console.log('Analysis text preview:', analysisText.substring(0, 300) + '...');

      const parsedResult = this.parseDetailedAnalysisResult(analysisText);
      
      console.log('Parsed result:', {
        clausesCount: parsedResult.clauses.length,
        risksCount: parsedResult.risks.length,
        firstClause: parsedResult.clauses[0]?.title || 'None',
        firstRisk: parsedResult.risks[0]?.title || 'None'
      });
      console.log('=== DETAILED ANALYSIS SUCCESS ===');

      return parsedResult;

    } catch (error) {
      console.error('=== DETAILED ANALYSIS ERROR ===');
      console.error('Vertex AI detailed analysis error:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Check if it's a credential or API issue
      if (error instanceof Error) {
        if (error.message.includes('credentials') || error.message.includes('authentication')) {
          console.error('CREDENTIAL ERROR: Please check your Google Cloud credentials');
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
          console.error('QUOTA ERROR: Vertex AI quota exceeded');
        } else if (error.message.includes('permission') || error.message.includes('access')) {
          console.error('PERMISSION ERROR: Check Vertex AI API permissions');
        }
      }
      
      // Re-throw the error instead of falling back to mock data
      // This will allow the frontend to handle the error appropriately
      throw new Error(`Vertex AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build detailed analysis prompt for clauses and risks
   */
  private buildDetailedAnalysisPrompt(documentText: string): string {
    return `You are an expert legal analyst. Carefully read and analyze the following legal document to extract specific clauses and identify real risks.

DOCUMENT TO ANALYZE:
${documentText}

CRITICAL INSTRUCTIONS:
- Analyze the ACTUAL document text provided above
- Extract REAL clauses and risks that exist in this specific document
- Do NOT use generic/template examples
- Return ONLY valid JSON with no additional text, explanations, or markdown
- Use double quotes for all strings
- Do not include trailing commas
- Escape any quotes within string values
- Ensure all brackets and braces are properly closed

ANALYSIS REQUIREMENTS:
1. CLAUSES: Find 4-8 actual important clauses from the document
   - Extract the real text from the document (not generic examples)
   - Focus on: payment terms, termination, liability, IP rights, confidentiality, dispute resolution, obligations
   - Use the actual section numbers/references from the document

2. RISKS: Identify 4-8 real risks based on the specific document content
   - Analyze what could actually go wrong based on the document terms
   - Consider: unfair terms, unclear language, one-sided obligations, missing protections
   - Provide specific recommendations for this document

Provide your analysis in this EXACT JSON structure:
{
  "clauses": [
    {
      "id": "clause_001",
      "type": "payment|termination|liability|intellectual_property|confidentiality|dispute_resolution|obligations|warranties|indemnification",
      "title": "Descriptive title based on actual clause content",
      "originalText": "EXACT text extracted from the provided document",
      "simplifiedPoints": [
        "Plain English explanation of what this clause means",
        "What this requires from each party",
        "Any important conditions or exceptions"
      ],
      "keyTakeaway": "Main practical implication for the reader"
    }
  ],
  "risks": [
    {
      "id": "risk_001",
      "level": "high|medium|low",
      "title": "Specific risk based on document content",
      "section": "Actual section reference from document or general area",
      "description": "Detailed explanation of the specific risk in this document",
      "recommendation": "Specific action to mitigate this risk",
      "impact": "What could realistically happen if this risk materializes"
    }
  ]
}

IMPORTANT: Base your analysis on the ACTUAL document content provided. Do not use generic legal language - extract and analyze the real terms in this specific document.`;
  }

  /**
   * Parse detailed analysis result for clauses and risks
   */
  private parseDetailedAnalysisResult(analysisText: string): DetailedAnalysisResult {
    try {
      console.log('=== PARSING DETAILED ANALYSIS RESULT ===');
      console.log('Raw analysis text length:', analysisText.length);
      
      // Clean up the response to extract JSON
      let jsonText = analysisText.trim();
      
      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
      jsonText = jsonText.replace(/^```\s*/i, '').replace(/```\s*$/i, '');
      
      // Remove any leading/trailing whitespace again
      jsonText = jsonText.trim();
      
      const parsed = JSON.parse(jsonText);
      
      // Validate structure
      if (!parsed.clauses || !Array.isArray(parsed.clauses)) {
        throw new Error('Invalid clauses structure');
      }
      
      if (!parsed.risks || !Array.isArray(parsed.risks)) {
        throw new Error('Invalid risks structure');
      }

      return {
        clauses: parsed.clauses,
        risks: parsed.risks
      };

    } catch (error) {
      console.error('Error parsing detailed analysis result:', error);
      throw new Error('Failed to parse analysis result');
    }
  }

  /**
   * Generate mock clauses and risks data
   */
  private generateMockClausesAndRisks(): DetailedAnalysisResult {
    return {
      clauses: [
        {
          id: "clause_001",
          type: "payment",
          title: "Payment Terms",
          originalText: "Payment shall be made within thirty (30) days of invoice receipt. Late payments are subject to interest charges.",
          simplifiedPoints: [
            "You must pay within 30 days of receiving an invoice",
            "Late payments will be charged interest"
          ],
          keyTakeaway: "Standard payment terms - ensure your accounting team can meet the deadline."
        },
        {
          id: "clause_002",
          type: "termination",
          title: "Termination Rights",
          originalText: "Either party may terminate this agreement with sixty (60) days written notice.",
          simplifiedPoints: [
            "Either side can end the contract with 60 days notice",
            "Notice must be in writing"
          ],
          keyTakeaway: "Fair termination terms that protect both parties."
        }
      ],
      risks: [
        {
          id: "risk_001",
          level: "medium",
          title: "Limited Liability Exposure",
          section: "Section 8.2",
          description: "The service provider has limited their maximum liability, which could leave you exposed if their work causes issues.",
          recommendation: "Consider requiring professional liability insurance for critical projects.",
          impact: "Could result in unrecoverable losses if issues arise"
        },
        {
          id: "risk_002",
          level: "low",
          title: "Standard Confidentiality",
          section: "Section 9.1",
          description: "Good mutual confidentiality protections are in place for both parties.",
          recommendation: "This clause provides adequate protection for sensitive information.",
          impact: "Positive protection for your business information"
        }
      ]
    };
  }
}

// Export singleton instance with lazy loading
let _vertexAIService: VertexAIService | null = null;

export const vertexAIService = {
  getInstance(): VertexAIService {
    if (!_vertexAIService) {
      _vertexAIService = new VertexAIService();
    }
    return _vertexAIService;
  },
  
  // Proxy methods to maintain backward compatibility
  async analyzeLegalDocument(documentText: string, documentType: string): Promise<LegalAnalysisResult> {
    return this.getInstance().analyzeLegalDocument(documentText, documentType);
  },
  
  async chatQuery(query: string, documentText: string, context?: string): Promise<ChatResponse> {
    return this.getInstance().chatQuery(query, documentText, context);
  },
  
  async analyzeClausesAndRisks(documentText: string): Promise<DetailedAnalysisResult> {
    return this.getInstance().analyzeClausesAndRisks(documentText);
  }
};
