"use client"

import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Globe, Check, Languages } from 'lucide-react';
import { SUPPORTED_LANGUAGES, SupportedLanguageCode } from '@/lib/constants/translation';

interface TranslationButtonProps {
  currentLanguage?: string;
  onLanguageChange?: (language: SupportedLanguageCode) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  showLabel?: boolean;
}

export function TranslationButton({
  currentLanguage = 'en',
  onLanguageChange,
  disabled = false,
  className = '',
  size = 'default',
  variant = 'outline',
  showLabel = true,
}: TranslationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLanguageChange = async (value: string) => {
    if (value === currentLanguage || !onLanguageChange) return;
    
    setIsLoading(true);
    try {
      await onLanguageChange(value as SupportedLanguageCode);
    } catch (error) {
      console.error('Language change error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced styling matching frontend-new design system
  const containerClasses = `
    flex items-center gap-2 
    rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 
    px-3 py-2 transition-all duration-200
    hover:bg-white/20 hover:border-white/30
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  return (
    <div className={containerClasses}>
      <Languages className="h-4 w-4 text-white/80" />
      
      <Select
        value={currentLanguage}
        onValueChange={handleLanguageChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger 
          className={`
            border-0 bg-transparent text-white placeholder:text-white/60
            focus:ring-0 focus:ring-offset-0 h-auto p-0
            hover:bg-transparent data-[state=open]:bg-transparent
            ${size === 'sm' ? 'text-sm' : 'text-base'}
          `}
        >
          <SelectValue placeholder="Select language">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                {showLabel && <span className="text-white">Translating...</span>}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {showLabel && (
                  <span className="text-white">
                    {SUPPORTED_LANGUAGES[currentLanguage as SupportedLanguageCode]}
                  </span>
                )}
                {currentLanguage !== 'en' && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-green-500/20 text-green-200 border-green-500/30"
                  >
                    Translated
                  </Badge>
                )}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent className="bg-gray-900/95 backdrop-blur-lg border-white/20">
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
            <SelectItem 
              key={code} 
              value={code}
              className="text-white hover:bg-white/10 focus:bg-white/10"
            >
              <div className="flex items-center justify-between w-full">
                <span>{name}</span>
                {code === currentLanguage && (
                  <Check className="h-4 w-4 text-green-400 ml-2" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface TranslationStatusProps {
  isTranslated: boolean;
  originalLanguage?: string;
  currentLanguage: string;
  onResetToOriginal?: () => void;
}

export function TranslationStatus({
  isTranslated,
  originalLanguage = 'en',
  currentLanguage,
  onResetToOriginal,
}: TranslationStatusProps) {
  if (!isTranslated || currentLanguage === originalLanguage) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-blue-500/10 backdrop-blur-sm rounded-lg border border-blue-500/20">
      <Globe className="h-4 w-4 text-blue-400" />
      <span className="text-sm text-blue-200">
        Translated from {SUPPORTED_LANGUAGES[originalLanguage as SupportedLanguageCode]} to{' '}
        {SUPPORTED_LANGUAGES[currentLanguage as SupportedLanguageCode]}
      </span>
      {onResetToOriginal && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetToOriginal}
          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-auto p-1 ml-auto"
        >
          View Original
        </Button>
      )}
    </div>
  );
}