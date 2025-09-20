"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Loader2, Square, Play, Trash2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceMessageButtonProps {
  onVoiceMessage?: (transcript: string, audioBlob?: Blob) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  showLabel?: boolean;
  language?: string;
  maxDuration?: number; // seconds
  autoSend?: boolean;
}

interface RecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  error?: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [key: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function VoiceMessageButton({
  onVoiceMessage,
  disabled = false,
  className = '',
  size = 'default',
  variant = 'outline',
  showLabel = true,
  language = 'en-US',
  maxDuration = 60,
  autoSend = false
}: VoiceMessageButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const lastSentTranscriptRef = useRef<string>('');

  const { toast } = useToast();

  // Improved mobile detection
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768 && 'ontouchstart' in window);
  };

  const checkBrowserSupport = () => {
    const hasMediaRecorder = 'MediaRecorder' in window;
    const hasSpeechRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    const isMobile = isMobileDevice();
    const isSecureContext = window.isSecureContext || location.protocol === 'https:';
    
    console.log('🎤 Browser detection:', { 
      hasMediaRecorder, 
      hasSpeechRecognition, 
      isMobile, 
      isSecureContext,
      userAgent: navigator.userAgent
    });
    
    if (!hasMediaRecorder) {
      throw new Error('Audio recording not supported in this browser');
    }
    if (!isSecureContext) {
      throw new Error('Voice recording requires HTTPS. Please ensure you\'re using a secure connection.');
    }
    
    return { hasMediaRecorder, hasSpeechRecognition, isMobile };
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        const newTime = prev + 1;
        if (newTime >= maxDuration) {
          stopRecording();
        }
        return newTime;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecordingTime(0);
  };

  const getMobileAudioConstraints = () => {
    return {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 16000,
        sampleSize: 16,
        channelCount: 1,
        // Mobile-specific constraints
        latency: 0.1,
        volume: 1.0
      }
    };
  };

  const getDesktopAudioConstraints = () => {
    return {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 44100,
        channelCount: 2
      }
    };
  };

  const getSupportedMimeType = (isMobile: boolean) => {
    const mimeTypes = isMobile 
      ? [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/mp4',
          'audio/aac',
          'audio/ogg;codecs=opus',
          'audio/ogg'
        ]
      : [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/ogg;codecs=opus',
          'audio/ogg'
        ];

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        console.log('🎤 Using MIME type:', mimeType);
        return mimeType;
      }
    }
    
    console.log('🎤 Using default MIME type (browser will choose)');
    return '';
  };

  const startRecording = async () => {
    try {
      console.log('🎤 Starting voice recording...');
      const { hasMediaRecorder, hasSpeechRecognition, isMobile } = checkBrowserSupport();
      console.log('🎤 Mobile device:', isMobile);
      
      setError(null);
      setIsRecording(true);
      setTranscript('');
      setAudioBlob(null);
      setAudioUrl(null);
      audioChunksRef.current = [];

      // Get appropriate audio constraints
      const audioConstraints = isMobile 
        ? getMobileAudioConstraints() 
        : getDesktopAudioConstraints();

      console.log('🎤 Requesting microphone permission...');

      // Get microphone permission
      const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
      streamRef.current = stream;
      console.log('🎤 Microphone access granted');

      // Get supported MIME type
      const mimeType = getSupportedMimeType(isMobile);
      
      // Create MediaRecorder with mobile-optimized settings
      const mediaRecorderOptions = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        console.log('🎤 Audio data available, size:', event.data.size);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('🎤 MediaRecorder stopped, creating blob');
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType || mimeType
        });
        console.log('🎤 Audio blob created, size:', audioBlob.size, 'type:', audioBlob.type);
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
      };

      mediaRecorder.onerror = (event) => {
        console.error('🎤 MediaRecorder error:', event);
        setError('Recording failed');
        stopRecording();
      };

      // Start recording with appropriate time slice
      mediaRecorder.start(isMobile ? 2000 : 1000);
      console.log('🎤 Recording started');

      // Only use browser speech recognition on desktop
      if (hasSpeechRecognition && !isMobile) {
        try {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          const recognition = new SpeechRecognition();
          
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = language;

          recognition.onresult = (event: RecognitionEvent) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.results.length - 1; i >= 0; i--) {
              const result = event.results[i];
              if (result.isFinal) {
                finalTranscript = result[0].transcript + finalTranscript;
              } else {
                interimTranscript = result[0].transcript + interimTranscript;
              }
            }

            const combinedTranscript = finalTranscript + interimTranscript;
            console.log('🎤 Speech recognition result:', combinedTranscript);
            setTranscript(combinedTranscript);
          };

          recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
          };

          recognition.onend = () => {
            if (isRecording && !error) {
              try {
                recognition.start();
              } catch (err) {
                console.log('Recognition restart failed:', err);
              }
            }
          };

          recognitionRef.current = recognition;
          recognition.start();
          console.log('🎤 Browser speech recognition started');
        } catch (err) {
          console.log('Browser speech recognition failed to start:', err);
        }
      }

      startTimer();
      
      toast({
        title: "Recording started",
        description: isMobile 
          ? "Speak clearly - will process with AI when you stop" 
          : "Speak clearly into your microphone",
        variant: "default"
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start recording';
      setError(errorMessage);
      setIsRecording(false);
      
      toast({
        title: "Recording failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const stopRecording = useCallback(() => {
    console.log('🎤 Stopping recording...');
    setIsRecording(false);
    setIsProcessing(true);
    stopTimer();

    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    toast({
      title: "Recording completed",
      description: "Processing your voice...",
      variant: "default"
    });
  }, []);

  // Process audio when recording stops
  useEffect(() => {
    if (audioBlob && !isRecording && isProcessing) {
      const processAudio = async () => {
        try {
          await processWithGoogleCloudAPI();
        } catch (error) {
          console.error('Speech processing failed:', error);
          setError('Speech recognition failed');
          toast({
            title: "Voice Processing Failed",
            description: "Could not transcribe your speech. Please try again or type your message.",
            variant: "destructive"
          });
        } finally {
          setIsProcessing(false);
        }
      };

      // Small delay to ensure blob is ready
      setTimeout(processAudio, 1000);
    }
  }, [audioBlob, isRecording, isProcessing]);

  const processWithGoogleCloudAPI = async () => {
    if (!audioBlob) {
      console.log('No audio blob available');
      return;
    }

    try {
      console.log('🎤 Processing speech with Google Cloud...');
      console.log('🎤 Audio blob details:', {
        size: audioBlob.size,
        type: audioBlob.type
      });
      
      const formData = new FormData();
      
      // Determine filename based on MIME type
      let filename = 'speech.webm';
      if (audioBlob.type.includes('mp4')) {
        filename = 'speech.mp4';
      } else if (audioBlob.type.includes('aac')) {
        filename = 'speech.aac';
      } else if (audioBlob.type.includes('ogg')) {
        filename = 'speech.ogg';
      }
      
      formData.append('audio', audioBlob, filename);
      formData.append('language', language);
      formData.append('isMobile', isMobileDevice().toString());
      
      console.log('🎤 Sending request to /api/speech-to-text endpoint...');
      console.log('🎤 FormData contents:', {
        hasAudio: formData.has('audio'),
        language: formData.get('language'),
        isMobile: formData.get('isMobile'),
        audioFileName: (formData.get('audio') as File)?.name
      });
      
      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it for FormData
      });
      
      console.log('🎤 API Response status:', response.status);
      console.log('🎤 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🎤 API error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('🎤 Speech-to-text result:', result);
      
      if (result.success && result.transcription) {
        console.log('✅ Speech transcribed successfully:', result.transcription);
        const cleanTranscript = result.transcription.trim();
        setTranscript(cleanTranscript);
        
        // Immediately send to parent component
        if (onVoiceMessage && cleanTranscript) {
          console.log('🎤 Sending transcript to parent:', cleanTranscript);
          onVoiceMessage(cleanTranscript, audioBlob);
        }
        
        toast({
          title: "Voice message ready!",
          description: "Speech successfully converted to text",
          variant: "default"
        });
      } else {
        throw new Error(result.error || 'No transcription received');
      }
    } catch (error) {
      console.error('🎤 Google Cloud Speech API error:', error);
      throw error; // Re-throw to be handled by caller
    }
  };

  const clearRecording = () => {
    console.log('🎤 Clearing recording state');
    setTranscript('');
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setError(null);
    setIsProcessing(false);
    lastSentTranscriptRef.current = '';
  };

  // Enhanced styling
  const buttonClasses = `
    flex items-center gap-2 
    rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 
    px-3 py-2 transition-all duration-200
    hover:bg-white/20 hover:border-white/30
    disabled:opacity-50 disabled:cursor-not-allowed
    ${isRecording ? 'bg-red-500/20 border-red-500/30 animate-pulse' : ''}
    ${transcript && !isRecording ? 'bg-green-500/20 border-green-500/30' : ''}
    ${error ? 'bg-red-500/20 border-red-500/30' : ''}
    ${className}
  `;

  const getButtonContent = () => {
    const isMobile = isMobileDevice();
    
    if (isProcessing) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-white" />
          {showLabel && <span className="text-white text-sm hidden sm:inline">Processing...</span>}
        </>
      );
    }

    if (isRecording) {
      return (
        <>
          <Square className="h-4 w-4 text-red-400" />
          {showLabel && (
            <span className="text-red-300 text-sm hidden sm:inline">
              {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </span>
          )}
        </>
      );
    }

    if (error) {
      return (
        <>
          <MicOff className="h-4 w-4 text-red-400" />
          {showLabel && <span className="text-red-300 text-sm hidden sm:inline">Error</span>}
        </>
      );
    }

    if (transcript && !isRecording && !isProcessing) {
      return (
        <>
          <Mic className="h-4 w-4 text-green-400" />
          {showLabel && <span className="text-green-300 text-sm hidden sm:inline">Ready</span>}
        </>
      );
    }

    return (
      <>
        <Mic className="h-4 w-4 text-white/80" />
        {showLabel && <span className="text-white text-sm hidden sm:inline">{isMobile ? 'Voice' : 'Voice'}</span>}
      </>
    );
  };

  const tooltipText = error 
    ? `Error: ${error}` 
    : isRecording 
      ? 'Tap to stop recording'
      : transcript
        ? 'Tap to record again'
        : 'Tap to start voice recording';

  return (
    <Button
      variant={variant}
      size={size}
      onClick={isRecording ? stopRecording : (transcript && !isProcessing ? clearRecording : startRecording)}
      disabled={disabled || isProcessing}
      className={buttonClasses}
      title={tooltipText}
    >
      {getButtonContent()}
    </Button>
  );
}

export default VoiceMessageButton;