"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, MicOff, Square } from "lucide-react"

type Msg = { role: "user" | "assistant"; text: string; timestamp?: Date; confidence?: number }

export function ChatPanel() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: "Upload a legal document first, then ask me anything about it...", timestamp: new Date() }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [documentName, setDocumentName] = useState<string>("")
  
  // Speech-to-Text state
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  // Check for uploaded documents
  useEffect(() => {
    const checkForDocument = async () => {
      console.log('=== CHAT PANEL DOCUMENT CHECK ===');
      if (typeof window !== 'undefined') {
        const storedDocId = localStorage.getItem('currentDocumentId')
        console.log('Stored document ID from localStorage:', storedDocId);
        if (storedDocId) {
          console.log('Setting document ID in state:', storedDocId);
          setDocumentId(storedDocId)
          fetchDocumentInfo(storedDocId)
        } else {
          console.log('No document ID found in localStorage');
        }
      } else {
        console.log('Window not available (SSR)');
      }
    }

    checkForDocument()

    // Listen for document upload events
    const handleDocumentUploaded = (event: CustomEvent) => {
      console.log('=== DOCUMENT UPLOADED EVENT ===');
      const document = event.detail
      console.log('Document received from upload event:', document);
      console.log('Document ID:', document?.id);
      console.log('Document filename:', document?.filename);
      
      // Clear any old document ID from localStorage first
      localStorage.removeItem('currentDocumentId');
      
      setDocumentId(document.id)
      setDocumentName(document.filename)
      localStorage.setItem('currentDocumentId', document.id)
      
      setMessages([{
        role: "assistant", 
        text: `Great! I've analyzed your document "${document.filename}". You can now ask me questions about it. For example: "What are the key risks?" or "Who are the parties involved?"`,
        timestamp: new Date()
      }])
      console.log('Document ID set in state:', document.id);
      console.log('Updated localStorage with new document ID');
    }

    window.addEventListener('documentUploaded', handleDocumentUploaded as EventListener)

    return () => {
      window.removeEventListener('documentUploaded', handleDocumentUploaded as EventListener)
    }
  }, [])

  const fetchDocumentInfo = async (docId: string) => {
    try {
      const response = await fetch(`/api/documents?id=${docId}`)
      const result = await response.json()
      
      if (result.success && result.document) {
        setDocumentName(result.document.filename)
        setMessages([{
          role: "assistant", 
          text: `I have your document "${result.document.filename}" ready for analysis. What would you like to know about it?`,
          timestamp: new Date()
        }])
      }
    } catch (error) {
      console.error('Error fetching document info:', error)
    }
  }

  const handleSendClick = () => {
    console.log('🔥 SEND BUTTON CLICKED 🔥');
    console.log('Button click timestamp:', new Date().toISOString());
    console.log('Current input value:', input);
    console.log('Input trimmed:', input.trim());
    console.log('Input length:', input.trim().length);
    console.log('Document ID available:', !!documentId);
    console.log('Is loading:', isLoading);
    onSend();
  }

  const onSend = async () => {
    console.log('=== CHAT PANEL SEND MESSAGE ===');
    console.log('Input value:', input.trim());
    console.log('Current document ID in state:', documentId);
    console.log('Current document name in state:', documentName);
    
    if (!input.trim()) return
    
    // Check localStorage as fallback if no document ID in state
    let activeDocumentId = documentId;
    if (!activeDocumentId && typeof window !== 'undefined') {
      console.log('No document ID in state, checking localStorage...');
      const storedDocId = localStorage.getItem('currentDocumentId');
      console.log('Document ID from localStorage:', storedDocId);
      
      if (storedDocId) {
        activeDocumentId = storedDocId;
        setDocumentId(storedDocId);
        console.log('Using document ID from localStorage:', storedDocId);
        
        // Try to fetch document info
        try {
          const response = await fetch(`/api/documents?id=${storedDocId}`);
          const result = await response.json();
          if (result.success && result.document) {
            setDocumentName(result.document.filename || 'Document');
            console.log('Loaded document name from API:', result.document.filename);
          }
        } catch (error) {
          console.error('Error fetching document info:', error);
        }
      }
    }
    
    if (!activeDocumentId) {
      console.log('No document ID available - showing upload message');
      setMessages(prev => [...prev, 
        { role: "user", text: input.trim(), timestamp: new Date() },
        { role: "assistant", text: "Please upload a legal document first before asking questions.", timestamp: new Date() }
      ])
      setInput("")
      return
    }

    setIsLoading(true)
    const userMsg: Msg = { role: "user", text: input.trim(), timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    
    const currentQuery = input.trim()
    setInput("")

    try {
      console.log('Sending chat request to API...');
      console.log('Request payload:', {
        documentId: activeDocumentId,
        query: currentQuery
      });
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: activeDocumentId,
          query: currentQuery
        }),
      })

      console.log('Response status:', response.status);
      const result = await response.json()
      console.log('Response result:', result);

      if (!result.success) {
        throw new Error(result.error)
      }

      const assistantMsg: Msg = {
        role: "assistant",
        text: result.response,
        timestamp: new Date(),
        confidence: result.confidence
      }

      setMessages(prev => [...prev, assistantMsg])

    } catch (error) {
      console.error('Chat error:', error)
      const errorMsg: Msg = {
        role: "assistant",
        text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    console.log('⌨️ KEY PRESSED:', e.key);
    if (e.key === 'Enter' && !e.shiftKey) {
      console.log('🚀 ENTER KEY PRESSED - SENDING MESSAGE');
      e.preventDefault()
      onSend()
    }
  }

  // Speech-to-Text functions
  const startRecording = async () => {
    try {
      console.log('🎤 Starting speech recording...');
      
      // Check if browser supports speech recognition for immediate feedback
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        console.log('🎤 Browser speech recognition available, using direct approach...');
        startBrowserSpeechRecognition();
        return;
      }
      
      // Fallback to audio recording for Google Cloud API
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      recorder.onstop = async () => {
        console.log('🎤 Recording stopped, processing speech...');
        setIsProcessingSpeech(true);
        
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
          await processSpeech(audioBlob);
        } catch (error) {
          console.error('Speech processing error:', error);
          setMessages(prev => [...prev, {
            role: "assistant",
            text: "Sorry, I couldn't understand the audio. Please try again.",
            timestamp: new Date()
          }]);
        } finally {
          setIsProcessingSpeech(false);
          // Clean up
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        }
      };
      
      setMediaRecorder(recorder);
      setIsRecording(true);
      recorder.start();
      
      console.log('🎤 Recording started successfully');
    } catch (error) {
      console.error('Failed to start recording:', error);
      setMessages(prev => [...prev, {
        role: "assistant",
        text: "Sorry, I couldn't access your microphone. Please check your browser permissions.",
        timestamp: new Date()
      }]);
    }
  };

  // Browser Speech Recognition (immediate, no API needed)
  const startBrowserSpeechRecognition = () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      setIsRecording(true);
      setIsProcessingSpeech(false);
      
      recognition.onstart = () => {
        console.log('🎤 Browser speech recognition started');
        setMessages(prev => [...prev, {
          role: "assistant",
          text: "🎤 Listening... Please speak your question now.",
          timestamp: new Date()
        }]);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        
        console.log('✅ Browser speech transcribed:', transcript);
        setInput(transcript);
        setIsRecording(false);
        
        if (confidence < 0.8) {
          setMessages(prev => [...prev, {
            role: "assistant",
            text: `I heard: "${transcript}" (${Math.round(confidence * 100)}% confidence). You can edit it before sending.`,
            timestamp: new Date()
          }]);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Browser speech recognition error:', event.error);
        setIsRecording(false);
        setMessages(prev => [...prev, {
          role: "assistant",
          text: "Sorry, I couldn't understand. Please try speaking clearly or type your question.",
          timestamp: new Date()
        }]);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
        console.log('🎤 Browser speech recognition ended');
      };
      
      recognition.start();
      
    } catch (error) {
      console.error('Browser speech recognition error:', error);
      setIsRecording(false);
      setMessages(prev => [...prev, {
        role: "assistant",
        text: "Speech recognition is not supported in your browser. Please type your question instead.",
        timestamp: new Date()
      }]);
    }
  };

  const stopRecording = () => {
    console.log('🎤 Stopping recording...');
    
    // Stop MediaRecorder if it exists
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
    
    // Stop browser speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // Browser speech recognition stops automatically, just update state
      setIsRecording(false);
    }
  };

  const processSpeech = async (audioBlob: Blob) => {
    try {
      console.log('🎤 Processing speech with Google Cloud...');
      console.log('Audio blob size:', audioBlob.size);
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'speech.webm');
      formData.append('language', 'en-US'); // You can make this dynamic based on user preference
      
      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      console.log('Speech-to-text result:', result);
      
      if (result.success && result.transcription) {
        console.log('✅ Speech transcribed:', result.transcription);
        setInput(result.transcription);
        
        // Show confidence feedback
        if (result.confidence < 0.8) {
          setMessages(prev => [...prev, {
            role: "assistant",
            text: `I heard: "${result.transcription}" (${Math.round(result.confidence * 100)}% confidence). You can edit it before sending.`,
            timestamp: new Date()
          }]);
        }
      } else {
        throw new Error(result.error || 'Speech recognition failed');
      }
    } catch (error) {
      console.error('Google Cloud Speech processing error:', error);
      
      // Fallback to browser Speech Recognition
      console.log('🔄 Falling back to browser speech recognition...');
      setMessages(prev => [...prev, {
        role: "assistant",
        text: "Using browser speech recognition as fallback. Please speak again when prompted.",
        timestamp: new Date()
      }]);
      
      // Use browser Speech Recognition as fallback
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        try {
          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          const recognition = new SpeechRecognition();
          
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = 'en-US';
          
          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            const confidence = event.results[0][0].confidence;
            
            console.log('✅ Browser speech transcribed:', transcript);
            setInput(transcript);
            
            if (confidence < 0.8) {
              setMessages(prev => [...prev, {
                role: "assistant",
                text: `I heard: "${transcript}" (${Math.round(confidence * 100)}% confidence). You can edit it before sending.`,
                timestamp: new Date()
              }]);
            }
          };
          
          recognition.onerror = (event: any) => {
            console.error('Browser speech recognition error:', event.error);
            setMessages(prev => [...prev, {
              role: "assistant",
              text: "Sorry, I couldn't understand the audio. Please try typing your question instead.",
              timestamp: new Date()
            }]);
          };
          
          recognition.start();
          
          setMessages(prev => [...prev, {
            role: "assistant",
            text: "🎤 Please speak now... (using browser speech recognition)",
            timestamp: new Date()
          }]);
          
        } catch (browserError) {
          console.error('Browser speech recognition not supported:', browserError);
          setMessages(prev => [...prev, {
            role: "assistant",
            text: "Speech recognition is not supported in your browser. Please type your question instead.",
            timestamp: new Date()
          }]);
        }
      } else {
        setMessages(prev => [...prev, {
          role: "assistant",
          text: "Speech recognition is not supported. Please enable the Google Cloud Speech-to-Text API or use a modern browser.",
          timestamp: new Date()
        }]);
      }
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);



  return (
    <div className="rounded-lg bg-white p-4 card-shadow" role="region" aria-label="Contract Q&A">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold" style={{ color: "var(--color-brand)" }}>
          Interactive Q&amp;A
        </h3>
        {documentName && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {documentName}
          </span>
        )}
      </div>
      
      <div
        className="h-48 overflow-y-auto border rounded-md p-3 space-y-3"
        style={{ borderColor: "rgba(55,65,81,0.15)" }}
      >
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <div className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={[
                  "inline-block px-3 py-2 rounded-md text-sm max-w-[80%]",
                  m.role === "user" ? "text-white" : ""
                ].join(" ")}
                style={{
                  background:
                    m.role === "user"
                      ? "linear-gradient(135deg, var(--color-brand) 0%, var(--color-electric) 100%)"
                      : "rgba(30,58,138,0.08)",
                }}
              >
                <div>{m.text}</div>
                {m.confidence && (
                  <div className="text-xs opacity-75 mt-1">
                    Confidence: {Math.round(m.confidence * 100)}%
                  </div>
                )}
              </div>
            </div>
            {m.timestamp && (
              <div className={`text-xs text-gray-400 mt-1 ${m.role === "user" ? "text-right" : "text-left"}`}>
                {m.timestamp.toLocaleTimeString()}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="text-left">
            <div
              className="inline-block px-3 py-2 rounded-md text-sm"
              style={{ background: "rgba(30,58,138,0.08)" }}
            >
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                <span>Analyzing your question...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            console.log('📝 INPUT CHANGED:', e.target.value);
            setInput(e.target.value);
          }}
          placeholder={documentId ? "Ask me about your document..." : "Upload a document first..."}
          className="flex-1 rounded-md border px-3 py-2 text-sm"
          style={{ borderColor: "rgba(55,65,81,0.15)" }}
          onKeyDown={handleKeyPress}
          disabled={isLoading || isProcessingSpeech}
          aria-label="Type your question"
        />
        
        {/* Speech-to-Text Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLoading || isProcessingSpeech}
          className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          title={isRecording ? "Stop recording" : "Start voice recording"}
        >
          {isProcessingSpeech ? (
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          ) : isRecording ? (
            <Square className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>
        
        <button
          onClick={handleSendClick}
          disabled={isLoading || !documentId || !input.trim() || isProcessingSpeech || isRecording}
          className="rounded-md px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, var(--color-brand) 0%, var(--color-electric) 100%)",
          }}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-600">
        {documentId 
          ? 'Type or click the microphone to speak: "What are the key risks?" or "What happens if I break this lease early?"'
          : 'Upload a legal document to start asking questions about it'
        }
      </p>
    </div>
  )
}
