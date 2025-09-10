"use client"

import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Globe, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, SupportedLanguageCode } from '@/lib/constants/translation';

interface LanguageSelectorProps {
  currentLanguage?: string;
  onLanguageChange?: (language: SupportedLanguageCode) => void;
  disabled?: boolean;
  className?: string;
}

export function LanguageSelector({
  currentLanguage = 'en',
  onLanguageChange,
  disabled = false,
  className = '',
}: LanguageSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLanguageChange = async (value: string) => {
    if (value === currentLanguage || !onLanguageChange) return;
    
    setIsLoading(true);
    try {
      onLanguageChange(value as SupportedLanguageCode);
    } catch (error) {
      console.error('Language change error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select
        value={currentLanguage}
        onValueChange={handleLanguageChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select language">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Translating...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>{SUPPORTED_LANGUAGES[currentLanguage as SupportedLanguageCode]}</span>
                {currentLanguage !== 'en' && (
                  <Badge variant="secondary" className="text-xs">
                    Translated
                  </Badge>
                )}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
            <SelectItem key={code} value={code}>
              <div className="flex items-center justify-between w-full">
                <span>{name}</span>
                {code === currentLanguage && (
                  <Check className="h-4 w-4 text-primary ml-2" />
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
    <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
      <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <span className="text-sm text-blue-700 dark:text-blue-300">
        Translated from {SUPPORTED_LANGUAGES[originalLanguage as SupportedLanguageCode]} to{' '}
        {SUPPORTED_LANGUAGES[currentLanguage as SupportedLanguageCode]}
      </span>
      {onResetToOriginal && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetToOriginal}
          className="text-blue-600 dark:text-blue-400 h-auto p-1"
        >
          View Original
        </Button>
      )}
    </div>
  );
}
