"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

interface TTSButtonProps {
  text: string;
  sectionId: string;
  onRead: (text: string, sectionId: string) => void;
  isReading: boolean;
  isCurrentlyReading: boolean;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export function TTSButton({
  text,
  sectionId,
  onRead,
  isReading,
  isCurrentlyReading,
  disabled = false,
  size = 'default',
  variant = 'outline',
  className = '',
}: TTSButtonProps) {
  const handleClick = () => {
    if (!disabled && text && text.trim()) {
      onRead(text, sectionId);
    }
  };

  const getIcon = () => {
    if (isReading && isCurrentlyReading) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    return isCurrentlyReading ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />;
  };

  const getTooltip = () => {
    if (disabled) return 'Text-to-speech not available';
    if (isCurrentlyReading) return 'Stop reading';
    return 'Read aloud';
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || !text || text.trim() === ''}
      size={size}
      variant={variant}
      className={`transition-all duration-200 ${isCurrentlyReading ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700' : ''} ${className}`}
      title={getTooltip()}
    >
      {getIcon()}
      <span className="sr-only">{getTooltip()}</span>
    </Button>
  );
}

export default TTSButton;
