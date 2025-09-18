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

  const checkBrowserSupport = () => {
    const hasMediaRecorder = 'MediaRecorder' in window;
    const hasSpeechRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isChrome = /Chrome/i.test(navigator.userAgent);
    const isSecureContext = window.isSecureContext || location.protocol === 'https:';
    
    console.log('🎤 Browser detection:', { 
      hasMediaRecorder, 
      hasSpeechRecognition, 
      isMobile, 
      isChrome, 
      isSecureContext,
      userAgent: navigator.userAgent
    });
    
    if (!hasMediaRecorder) {
      throw new Error('Audio recording not supported in this browser');
    }
    if (!hasSpeechRecognition) {
      console.warn('Speech recognition not supported in this browser - will use Google Cloud API');
    }
    if (isMobile && !isSecureContext) {
      throw new Error('Voice recording requires HTTPS on mobile devices');
    }
    
    return { hasMediaRecorder, hasSpeechRecognition, isMobile, isChrome };
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

  const startRecording = async () => {
    try {
      console.log('🎤 Starting voice recording...');
      const { hasMediaRecorder, hasSpeechRecognition, isMobile, isChrome } = checkBrowserSupport();
      console.log('🎤 Browser support - MediaRecorder:', hasMediaRecorder, 'SpeechRecognition:', hasSpeechRecognition);
      
      setError(null);
      setIsRecording(true);
      setTranscript('');
      setAudioBlob(null);
      setAudioUrl(null);
      audioChunksRef.current = [];

      // Mobile-specific constraints - more conservative audio settings
      const audioConstraints = isMobile ? {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Lower sample rate for mobile
          sampleSize: 16,
          channelCount: 1, // Mono for mobile
        }
      } : {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      };

      console.log('🎤 Requesting microphone permission with constraints:', audioConstraints);

      // Get microphone permission and start audio recording
      const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
      
      streamRef.current = stream;
      console.log('🎤 Microphone access granted, stream active:', stream.active);

      // Start audio recording with mobile-compatible MIME types
      let mimeType = 'audio/webm';
      if (isMobile) {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/aac')) {
          mimeType = 'audio/aac';
        } else {
          mimeType = ''; // Let browser choose
        }
      } else {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        }
      }

      console.log('🎤 Using MIME type:', mimeType);

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      
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
          type: mediaRecorder.mimeType 
        });
        console.log('🎤 Audio blob created, size:', audioBlob.size);
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
      };

      mediaRecorder.onerror = (event) => {
        console.error('🎤 MediaRecorder error:', event);
        setError('Recording failed');
      };

      mediaRecorder.start(isMobile ? 2000 : 1000); // Collect data less frequently on mobile

      // Start speech recognition if supported (with mobile-specific handling)
      if (hasSpeechRecognition && !isMobile) {
        // On desktop, use browser speech recognition
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
          if (event.error === 'not-allowed') {
            setError('Microphone access denied');
            toast({
              title: "Microphone Access Denied",
              description: "Please allow microphone access to use voice input",
              variant: "destructive"
            });
          } else if (event.error === 'network') {
            console.log('Browser speech recognition network error, will try Google Cloud API fallback');
            // Don't set error here, let it fall back to Google Cloud API
          } else if (event.error === 'no-speech') {
            setError('No speech detected');
            toast({
              title: "No Speech Detected",
              description: "Please speak clearly into your microphone",
              variant: "destructive"
            });
          } else {
            console.log(`Browser speech recognition error: ${event.error}, will try Google Cloud API fallback`);
            // Don't set error for other cases, let it fall back to Google Cloud API
          }
        };

        recognition.onend = () => {
          if (isRecording) {
            // Restart recognition if still recording, but only if no error occurred
            try {
              if (!error) {
                recognition.start();
              }
            } catch (err) {
              console.error('Failed to restart recognition:', err);
              // Don't restart if there's an error
            }
          }
        };

        recognitionRef.current = recognition;
        
        try {
          recognition.start();
          console.log('🎤 Browser speech recognition started');
        } catch (err) {
          console.error('Failed to start browser speech recognition:', err);
          // Continue without browser recognition - will use Google Cloud API
        }
      } else if (isMobile) {
        console.log('🎤 Mobile device detected - will use Google Cloud API for speech recognition');
        // On mobile, skip browser speech recognition and rely entirely on Google Cloud API
        // This is more reliable due to mobile browser limitations
      }

      startTimer();
      
      toast({
        title: "Recording started",
        description: isMobile 
          ? "Speak clearly - will process with AI after recording" 
          : hasSpeechRecognition 
            ? "Speak clearly into your microphone" 
            : "Recording audio only - speech recognition unavailable",
        variant: "default"
      });

      console.log('🎤 Recording started successfully');

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

    // Process with Google Cloud API if no browser transcript or if on mobile
    setTimeout(async () => {
      // On mobile, always use Google Cloud API since browser recognition is unreliable
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const shouldUseGoogleAPI = !transcript.trim() || isMobileDevice;
      
      if (shouldUseGoogleAPI && audioBlob) {
        try {
          console.log('Processing with Google Cloud API...');
          await processWithGoogleCloudAPI();
        } catch (error) {
          console.error('Google Cloud API processing failed:', error);
          setError('Speech recognition failed');
          toast({
            title: "Voice Processing Failed",
            description: "Could not transcribe your speech. Please try typing instead.",
            variant: "destructive"
          });
        }
      }
      
      setIsProcessing(false);
      if (autoSend && transcript.trim()) {
        handleSend();
      }
    }, /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 1500 : 1000); // Give mobile a bit more time

    toast({
      title: "Recording completed",
      description: transcript.trim() 
        ? "Voice message ready to send" 
        : "Processing audio...",
      variant: "default"
    });
  }, [transcript, autoSend, audioBlob]);

  const processWithGoogleCloudAPI = async () => {
    if (!audioBlob) return;

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
      } else if (audioBlob.type.includes('opus')) {
        filename = 'speech.opus';
      }
      
      formData.append('audio', audioBlob, filename);
      formData.append('language', language);
      formData.append('isMobile', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent).toString());
      
      console.log('🎤 Sending request to speech-to-text API...');
      
      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      });
      
      console.log('🎤 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🎤 API error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('🎤 Speech-to-text result:', result);
      
      if (result.success && result.transcription) {
        console.log('✅ Speech transcribed:', result.transcription);
        setTranscript(result.transcription);
        
        toast({
          title: "Voice message ready!",
          description: result.confidence && result.confidence < 0.8 
            ? `Transcribed with ${Math.round(result.confidence * 100)}% confidence`
            : "Speech successfully converted to text",
          variant: "default"
        });
      } else {
        throw new Error(result.error || 'Speech recognition failed');
      }
    } catch (error) {
      console.error('🎤 Google Cloud Speech API error:', error);
      
      // Provide more helpful error messages for mobile users
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setError('Voice recognition failed');
      
      toast({
        title: "Voice recognition failed",
        description: isMobileDevice 
          ? "Please try speaking closer to your device's microphone, or type your message instead"
          : "Network error. Please type your message instead.",
        variant: "destructive"
      });
    }
  };

  const handleSend = () => {
    if (transcript.trim() && onVoiceMessage) {
      onVoiceMessage(transcript, audioBlob || undefined);
      clearRecording();
      
      toast({
        title: "Voice message sent",
        description: "Your message has been processed",
        variant: "default"
      });
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
    lastSentTranscriptRef.current = '';
  };

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(console.error);
    }
  };

  // Enhanced styling matching frontend-new design system
  const buttonClasses = `
    flex items-center gap-2 
    rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 
    px-3 py-2 transition-all duration-200
    hover:bg-white/20 hover:border-white/30
    disabled:opacity-50 disabled:cursor-not-allowed
    ${isRecording ? 'bg-red-500/20 border-red-500/30 animate-pulse' : ''}
    ${transcript ? 'bg-green-500/20 border-green-500/30' : ''}
    ${error ? 'bg-red-500/20 border-red-500/30' : ''}
    ${className}
  `;

  const getButtonContent = () => {
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isProcessing) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-white" />
          {showLabel && <span className="text-white text-sm hidden sm:inline">{isMobileDevice ? 'AI Processing...' : 'Processing...'}</span>}
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

    if (transcript) {
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
        {showLabel && <span className="text-white text-sm hidden sm:inline">{isMobileDevice ? 'Speak' : 'Voice'}</span>}
      </>
    );
  };

  const tooltipText = error 
    ? `Error: ${error}` 
    : isRecording 
      ? 'Click to stop recording'
      : transcript
        ? 'Click to record again or type in textbox'
        : 'Click to start voice recording';

  // Auto-send transcript to parent immediately when available
  useEffect(() => {
    if (transcript && !isRecording && !isProcessing && onVoiceMessage && transcript !== lastSentTranscriptRef.current) {
      console.log('🎤 Sending transcript to parent:', transcript);
      onVoiceMessage(transcript, audioBlob || undefined);
      lastSentTranscriptRef.current = transcript;
      // Don't clear the transcript immediately - let parent handle it
      // This allows the button to show "Ready" state until user acts
    }
  }, [transcript, isRecording, isProcessing, onVoiceMessage]);

  // Show voice message preview if we have transcript
  // REMOVED - transcript is now sent directly to main text box
  // if (transcript && !isRecording && !isProcessing) {
  //   return voice preview component
  // }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={isRecording ? stopRecording : (transcript ? clearRecording : startRecording)}
      disabled={disabled || isProcessing}
      className={buttonClasses}
      title={tooltipText}
    >
      {getButtonContent()}
    </Button>
  );
}

export default VoiceMessageButton;