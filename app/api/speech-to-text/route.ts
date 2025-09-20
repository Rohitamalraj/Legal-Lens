import { NextRequest, NextResponse } from 'next/server';
import { GoogleCloudConfig } from '@/lib/services/google-cloud-config';
import { SpeechClient } from '@google-cloud/speech';

// Initialize the Google Cloud Speech client
const googleCloudConfig = GoogleCloudConfig.getInstance();

// Validate required environment variables
if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
  console.error('GOOGLE_CLOUD_PROJECT_ID environment variable is not set');
}

const speechClient = new SpeechClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: googleCloudConfig.getCredentials(),
});

// Helper function to detect audio format from buffer with improved WebM handling
function detectAudioFormat(buffer: Buffer, mimeType: string, filename: string): {
  encoding: 'WEBM_OPUS' | 'OGG_OPUS' | 'MP3' | 'LINEAR16' | 'FLAC';
  sampleRateHertz: number;
} {
  const first4Bytes = buffer.subarray(0, 4);
  const first8Bytes = buffer.subarray(0, 8);
  
  // Check magic numbers
  if (first4Bytes.toString('hex') === '664c6143') {
    return { encoding: 'FLAC', sampleRateHertz: 44100 };
  }
  
  if (first4Bytes.toString('ascii') === 'OggS') {
    return { encoding: 'OGG_OPUS', sampleRateHertz: 48000 };
  }
  
  if (first4Bytes.toString('ascii') === 'RIFF') {
    return { encoding: 'LINEAR16', sampleRateHertz: 16000 };
  }
  
  // Check for WebM signature - WebM OPUS typically uses 48kHz
  if (first4Bytes.toString('hex') === '1a45dfa3' || mimeType.includes('webm')) {
    return { encoding: 'WEBM_OPUS', sampleRateHertz: 48000 };
  }
  
  // Fallback to MIME type and filename detection
  if (mimeType.includes('mp4') || filename.includes('.mp4') || 
      mimeType.includes('aac') || filename.includes('.aac')) {
    return { encoding: 'LINEAR16', sampleRateHertz: 16000 };
  }
  
  if (mimeType.includes('mp3') || filename.includes('.mp3')) {
    return { encoding: 'MP3', sampleRateHertz: 44100 };
  }
  
  if (mimeType.includes('ogg') || filename.includes('.ogg')) {
    return { encoding: 'OGG_OPUS', sampleRateHertz: 48000 };
  }
  
  if (mimeType.includes('flac') || filename.includes('.flac')) {
    return { encoding: 'FLAC', sampleRateHertz: 44100 };
  }
  
  // Default to WebM OPUS for modern browsers with correct sample rate
  return { encoding: 'WEBM_OPUS', sampleRateHertz: 48000 };
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== SPEECH-TO-TEXT API ENDPOINT ===');
    console.log('Request received at:', new Date().toISOString());
    
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'en-US';
    const isMobile = formData.get('isMobile') === 'true';
    
    console.log('Audio file received:', !!audioFile);
    console.log('Language:', language);
    console.log('Is mobile request:', isMobile);
    console.log('Audio file type:', audioFile?.type);
    console.log('Audio file name:', audioFile?.name);
    console.log('Audio file size:', audioFile?.size);
    
    if (!audioFile) {
      console.error('No audio file provided');
      return NextResponse.json(
        { 
          success: false,
          error: 'Audio file is required' 
        },
        { status: 400 }
      );
    }

    // Check file size (Google Cloud has limits)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (audioFile.size > maxSize) {
      console.error('Audio file too large:', audioFile.size);
      return NextResponse.json(
        { 
          success: false,
          error: 'Audio file too large. Maximum size is 10MB.' 
        },
        { status: 400 }
      );
    }

    // Convert the audio file to buffer
    const audioBytes = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(audioBytes);

    console.log('Processing speech-to-text...');
    console.log('Audio buffer size:', audioBuffer.length);

    // Detect audio format automatically
    const { encoding, sampleRateHertz: detectedSampleRate } = detectAudioFormat(
      audioBuffer, 
      audioFile.type, 
      audioFile.name
    );
    
    console.log('Detected audio encoding:', encoding);
    console.log('Detected sample rate:', detectedSampleRate);
    console.log('Mobile optimized:', isMobile);
    
    // For WebM OPUS, Google Cloud auto-detects the sample rate from headers
    // For other formats, we can specify the detected rate
    const shouldSpecifySampleRate = encoding !== 'WEBM_OPUS';
    console.log('Will specify sample rate:', shouldSpecifySampleRate);

    // Configure the speech recognition request with proper sample rate handling
    const speechConfig = {
      encoding,
      // Only specify sample rate for non-WebM formats
      ...(shouldSpecifySampleRate && { sampleRateHertz: detectedSampleRate }),
      languageCode: language,
      enableAutomaticPunctuation: true,
      model: isMobile ? 'phone_call' : 'latest_short',
      useEnhanced: true,
      maxAlternatives: 1,
      profanityFilter: false,
      // Additional mobile optimizations
      ...(isMobile && {
        enableWordTimeOffsets: false, // Reduce processing overhead
        enableWordConfidence: false,
        adaptationBias: {
          phrases: [] // Could add common phrases here
        }
      })
    };

    const request_config = {
      audio: {
        content: audioBuffer.toString('base64'),
      },
      config: speechConfig,
    };

    console.log('Sending request to Google Cloud Speech-to-Text...');
    console.log('Request config:', JSON.stringify({...request_config, audio: '[BASE64_DATA]'}, null, 2));

    // Perform the speech recognition with timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Speech recognition timeout')), 30000)
    );

    const speechPromise = speechClient.recognize(request_config);
    
    const [response] = await Promise.race([speechPromise, timeoutPromise]) as any;
    
    console.log('Google Cloud response received');
    console.log('Results count:', response.results?.length || 0);
    
    if (!response.results || response.results.length === 0) {
      console.log('No speech detected in audio');
      return NextResponse.json({
        success: false,
        error: 'No speech detected in the audio. Please try speaking more clearly or closer to the microphone.',
        confidence: 0
      });
    }

    // Extract the transcription with better error handling
    let transcription = '';
    let confidence = 0;
    
    try {
      transcription = response.results
        .map((result: any) => {
          const alternative = result.alternatives?.[0];
          if (alternative) {
            confidence = Math.max(confidence, alternative.confidence || 0);
            return alternative.transcript || '';
          }
          return '';
        })
        .join(' ')
        .trim();
    } catch (error) {
      console.error('Error extracting transcription:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to process speech recognition results'
      });
    }

    // Validate transcription
    if (!transcription || transcription.length < 1) {
      console.log('Empty transcription result');
      return NextResponse.json({
        success: false,
        error: 'Could not transcribe speech. Please try speaking more clearly.',
        confidence: confidence
      });
    }

    console.log('Speech-to-text successful');
    console.log('Transcription:', transcription);
    console.log('Confidence:', confidence);

    // Success response
    return NextResponse.json({
      success: true,
      transcription: transcription.trim(),
      confidence: confidence,
      language: language,
      isMobile: isMobile,
      audioFormat: encoding,
      sampleRate: detectedSampleRate,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Speech-to-text error:', error);
    
    // Enhanced error handling
    let errorMessage = 'Speech-to-text processing failed';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Error details:', error.stack);
      
      // Handle specific error types
      if (error.message.includes('timeout')) {
        errorMessage = 'Speech processing timed out. Please try with a shorter recording.';
        statusCode = 408;
      } else if (error.message.includes('INVALID_ARGUMENT')) {
        errorMessage = 'Invalid audio format. Please try recording again.';
        statusCode = 400;
      } else if (error.message.includes('PERMISSION_DENIED')) {
        errorMessage = 'Speech service unavailable. Please try again later.';
        statusCode = 503;
      } else if (error.message.includes('QUOTA_EXCEEDED')) {
        errorMessage = 'Service quota exceeded. Please try again later.';
        statusCode = 429;
      }
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    // Test Google Cloud Speech client initialization
    const testConfig = {
      hasCredentials: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'not-set',
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json({
      status: 'ok',
      service: 'speech-to-text',
      ...testConfig
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      service: 'speech-to-text',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}