"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Square, RefreshCw } from 'lucide-react';

interface TTSDiagnosticProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export function TTSDiagnostic({ isVisible = false, onClose }: TTSDiagnosticProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isTestingVoice, setIsTestingVoice] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, string>>({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isVisible && isMounted) {
      loadVoices();
    }
  }, [isVisible]);

  const loadVoices = () => {
    const availableVoices = window.speechSynthesis.getVoices();
    setVoices(availableVoices);
    
    if (availableVoices.length === 0) {
      // Retry after a delay for browsers that load voices asynchronously
      setTimeout(() => {
        const retryVoices = window.speechSynthesis.getVoices();
        setVoices(retryVoices);
      }, 1000);
    }
  };

  const testVoice = (voice: SpeechSynthesisVoice) => {
    if (isTestingVoice) {
      window.speechSynthesis.cancel();
      setIsTestingVoice(null);
      return;
    }

    setIsTestingVoice(voice.name);
    setTestResults(prev => ({ ...prev, [voice.name]: 'testing' }));

    const testText = `Hello, this is a test of the ${voice.name} voice for ${voice.lang} language.`;
    const utterance = new SpeechSynthesisUtterance(testText);
    utterance.voice = voice;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setTestResults(prev => ({ ...prev, [voice.name]: 'playing' }));
    };

    utterance.onend = () => {
      setIsTestingVoice(null);
      setTestResults(prev => ({ ...prev, [voice.name]: 'success' }));
    };

    utterance.onerror = (event) => {
      setIsTestingVoice(null);
      setTestResults(prev => ({ 
        ...prev, 
        [voice.name]: `error: ${event.error || 'unknown'}` 
      }));
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      setIsTestingVoice(null);
      setTestResults(prev => ({ 
        ...prev, 
        [voice.name]: `error: ${error instanceof Error ? error.message : 'unknown'}` 
      }));
    }
  };

  const stopAllSpeech = () => {
    window.speechSynthesis.cancel();
    setIsTestingVoice(null);
  };

  const getStatusBadge = (voiceName: string) => {
    const result = testResults[voiceName];
    if (!result) return null;

    switch (result) {
      case 'testing':
        return <Badge variant="secondary">Preparing...</Badge>;
      case 'playing':
        return <Badge className="bg-blue-500">Playing</Badge>;
      case 'success':
        return <Badge className="bg-green-500">Working</Badge>;
      default:
        return <Badge variant="destructive">Error: {result.replace('error: ', '')}</Badge>;
    }
  };

  const groupedVoices = voices.reduce((acc, voice) => {
    const lang = voice.lang.split('-')[0];
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(voice);
    return acc;
  }, {} as Record<string, SpeechSynthesisVoice[]>);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full max-h-[80vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Text-to-Speech Diagnostic</CardTitle>
            <div className="flex gap-2">
              <Button onClick={loadVoices} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Voices
              </Button>
              <Button onClick={stopAllSpeech} variant="outline" size="sm">
                <Square className="h-4 w-4 mr-2" />
                Stop All
              </Button>
              <Button onClick={onClose} variant="outline" size="sm">
                Close
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Browser Support:</strong> 
                {isMounted && window.speechSynthesis ? ' ✅ Supported' : ' ❌ Not Supported'}
              </div>
              <div>
                <strong>Total Voices:</strong> {voices.length}
              </div>
              <div>
                <strong>Languages:</strong> {Object.keys(groupedVoices).length}
              </div>
            </div>

            <div className="space-y-6">
              {Object.entries(groupedVoices).map(([lang, langVoices]) => (
                <div key={lang} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3 text-lg">
                    {lang.toUpperCase()} ({langVoices.length} voices)
                  </h3>
                  <div className="grid gap-2">
                    {langVoices.map((voice) => (
                      <div 
                        key={voice.name} 
                        className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{voice.name}</div>
                          <div className="text-sm text-gray-600">
                            {voice.lang} 
                            {voice.localService && <span className="ml-2 text-xs bg-blue-100 px-1 rounded">Local</span>}
                            {voice.default && <span className="ml-2 text-xs bg-green-100 px-1 rounded">Default</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(voice.name)}
                          <Button
                            onClick={() => testVoice(voice)}
                            disabled={isTestingVoice !== null && isTestingVoice !== voice.name}
                            variant="outline"
                            size="sm"
                          >
                            {isTestingVoice === voice.name ? (
                              <Square className="h-3 w-3" />
                            ) : (
                              <Play className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {voices.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No voices detected. This might indicate:</p>
                <ul className="mt-2 text-sm list-disc list-inside">
                  <li>Browser doesn't support speech synthesis</li>
                  <li>Voices are still loading (try refreshing)</li>
                  <li>System has no TTS voices installed</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TTSDiagnostic;
