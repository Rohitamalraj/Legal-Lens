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

  const { toast } = useToast();

  const checkBrowserSupport = () => {
    const hasMediaRecorder = 'MediaRecorder' in window;
    const hasSpeechRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    
    if (!hasMediaRecorder) {
      throw new Error('Audio recording not supported in this browser');
    }
    if (!hasSpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
    }
    
    return { hasMediaRecorder, hasSpeechRecognition };
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
      const { hasMediaRecorder, hasSpeechRecognition } = checkBrowserSupport();
      
      setError(null);
      setIsRecording(true);
      setTranscript('');
      setAudioBlob(null);
      setAudioUrl(null);
      audioChunksRef.current = [];

      // Get microphone permission and start audio recording
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      
      streamRef.current = stream;

      // Start audio recording
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType 
        });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
      };

      mediaRecorder.start(1000); // Collect data every second

      // Start speech recognition if supported
      if (hasSpeechRecognition) {
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

          setTranscript(finalTranscript + interimTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            setError('Microphone access denied');
          } else if (event.error === 'network') {
            setError('Network error during speech recognition');
          }
        };

        recognition.onend = () => {
          if (isRecording) {
            // Restart recognition if still recording
            try {
              recognition.start();
            } catch (err) {
              console.error('Failed to restart recognition:', err);
            }
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      }

      startTimer();
      
      toast({
        title: "Recording started",
        description: hasSpeechRecognition 
          ? "Speak clearly into your microphone" 
          : "Recording audio (speech recognition not available)",
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

    // Process with Google Cloud API if no browser transcript
    setTimeout(async () => {
      if (!transcript.trim() && audioBlob) {
        try {
          await processWithGoogleCloudAPI();
        } catch (error) {
          console.error('Google Cloud API processing failed:', error);
        }
      }
      
      setIsProcessing(false);
      if (autoSend && transcript.trim()) {
        handleSend();
      }
    }, 1000);

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
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'speech.webm');
      formData.append('language', language);
      
      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      console.log('Speech-to-text result:', result);
      
      if (result.success && result.transcription) {
        console.log('✅ Speech transcribed:', result.transcription);
        setTranscript(result.transcription);
        
        // Show confidence feedback
        if (result.confidence < 0.8) {
          toast({
            title: "Speech processed",
            description: `Transcribed with ${Math.round(result.confidence * 100)}% confidence`,
            variant: "default"
          });
        }
      } else {
        throw new Error(result.error || 'Speech recognition failed');
      }
    } catch (error) {
      console.error('Google Cloud Speech API error:', error);
      setError('Failed to process speech');
      
      toast({
        title: "Speech processing failed",
        description: "Could not transcribe audio. Please try again.",
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
    setTranscript('');
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setError(null);
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
    if (isProcessing) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-white" />
          {showLabel && <span className="text-white text-sm">Processing...</span>}
        </>
      );
    }

    if (isRecording) {
      return (
        <>
          <Square className="h-4 w-4 text-red-400" />
          {showLabel && (
            <span className="text-red-300 text-sm">
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
          {showLabel && <span className="text-red-300 text-sm">Error</span>}
        </>
      );
    }

    if (transcript) {
      return (
        <>
          <Mic className="h-4 w-4 text-green-400" />
          {showLabel && <span className="text-green-300 text-sm">Ready</span>}
        </>
      );
    }

    return (
      <>
        <Mic className="h-4 w-4 text-white/80" />
        {showLabel && <span className="text-white text-sm">Voice</span>}
      </>
    );
  };

  const tooltipText = error 
    ? `Error: ${error}` 
    : isRecording 
      ? 'Click to stop recording'
      : transcript
        ? 'Voice message ready'
        : 'Click to start voice recording';

  // Auto-send transcript to parent immediately when available
  useEffect(() => {
    if (transcript && !isRecording && !isProcessing && onVoiceMessage) {
      onVoiceMessage(transcript, audioBlob || undefined);
      // Clear the transcript after sending to parent
      setTranscript('');
      setAudioBlob(null);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      setError(null);
    }
  }, [transcript, isRecording, isProcessing, onVoiceMessage, audioBlob, audioUrl]);

  // Show voice message preview if we have transcript
  // REMOVED - transcript is now sent directly to main text box
  // if (transcript && !isRecording && !isProcessing) {
  //   return voice preview component
  // }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={isRecording ? stopRecording : startRecording}
      disabled={disabled || isProcessing}
      className={buttonClasses}
      title={tooltipText}
    >
      {getButtonContent()}
    </Button>
  );
}

export default VoiceMessageButton;