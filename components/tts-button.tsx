"use client"

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, VolumeX, Loader2, Download, AlertCircle, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TTSButtonProps {
  text: string;
  language?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  showLabel?: boolean;
  voiceType?: 'standard' | 'neural' | 'wavenet';
}

export function TTSButton({
  text,
  language = 'en',
  disabled = false,
  className = '',
  size = 'default',
  variant = 'outline',
  showLabel = true,
  voiceType = 'neural'
}: TTSButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const handleTTS = async () => {
    if (!text.trim()) {
      toast({
        title: "No text to convert",
        description: "Please provide text for speech synthesis.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          languageCode: language,
          voiceType: voiceType
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `TTS request failed: ${response.status}`);
      }

      // Get JSON response with base64 audio content
      const result = await response.json();
      
      if (!result.audioContent) {
        throw new Error('No audio content received from server');
      }

      // Convert base64 to blob
      const audioBytes = atob(result.audioContent);
      const audioArray = new Uint8Array(audioBytes.length);
      for (let i = 0; i < audioBytes.length; i++) {
        audioArray[i] = audioBytes.charCodeAt(i);
      }
      
      const audioBlob = new Blob([audioArray], { type: result.contentType || 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);

      // Play audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setError('Failed to play audio');
        setIsPlaying(false);
        audioRef.current = null;
      };

      await audio.play();
      
      toast({
        title: "Speech synthesis complete",
        description: "Audio is now playing",
        variant: "default"
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('TTS Error:', error);
      
      toast({
        title: "Speech synthesis failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      audioRef.current = null;
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `tts-audio-${Date.now()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Audio downloaded",
        description: "TTS audio file saved successfully",
        variant: "default"
      });
    }
  };

  // Enhanced styling matching frontend-new design system
  const buttonClasses = `
    flex items-center gap-2 
    rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 
    px-3 py-2 transition-all duration-200
    hover:bg-white/20 hover:border-white/30
    disabled:opacity-50 disabled:cursor-not-allowed
    ${isPlaying ? 'bg-green-500/20 border-green-500/30' : ''}
    ${error ? 'bg-red-500/20 border-red-500/30' : ''}
    ${className}
  `;

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-white" />
          {showLabel && <span className="text-white text-sm">Converting...</span>}
        </>
      );
    }

    if (error) {
      return (
        <>
          <AlertCircle className="h-4 w-4 text-red-400" />
          {showLabel && <span className="text-red-300 text-sm">Error</span>}
        </>
      );
    }

    if (isPlaying) {
      return (
        <>
          <VolumeX className="h-4 w-4 text-green-400" />
          {showLabel && <span className="text-green-300 text-sm">Playing</span>}
          {audioUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-white hover:text-green-300 hover:bg-green-500/10 h-auto p-1 ml-1"
            >
              <Download className="h-3 w-3" />
            </Button>
          )}
        </>
      );
    }

    return (
      <>
        <Volume2 className="h-4 w-4 text-white/80" />
        {showLabel && <span className="text-white text-sm">Listen</span>}
        {audioUrl && (
          <Badge 
            variant="secondary" 
            className="text-xs bg-blue-500/20 text-blue-200 border-blue-500/30"
          >
            Ready
          </Badge>
        )}
      </>
    );
  };

  const tooltipText = error 
    ? `Error: ${error}` 
    : isLoading 
      ? 'Converting text to speech...'
      : isPlaying 
        ? 'Click to stop audio'
        : 'Click to convert text to speech';

  return (
    <Button
      variant={variant}
      size={size}
      onClick={isPlaying ? handleStop : handleTTS}
      disabled={disabled || isLoading || !text.trim()}
      className={buttonClasses}
      title={tooltipText}
    >
      {getButtonContent()}
    </Button>
  );
}

interface TTSControlsProps {
  text: string;
  language?: string;
  disabled?: boolean;
  className?: string;
  showDownload?: boolean;
  showLanguageInfo?: boolean;
}

export function TTSControls({
  text,
  language = 'en',
  disabled = false,
  className = '',
  showDownload = true,
  showLanguageInfo = true
}: TTSControlsProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TTSButton 
        text={text}
        language={language}
        disabled={disabled}
        showLabel={true}
      />
      
      {showLanguageInfo && language !== 'en' && (
        <Badge 
          variant="outline" 
          className="text-xs text-white/80 border-white/20 bg-white/5"
        >
          {language.toUpperCase()}
        </Badge>
      )}
      
      {showDownload && (
        <span className="text-xs text-white/60">
          Audio will be available for download after conversion
        </span>
      )}
    </div>
  );
}

export default TTSButton;