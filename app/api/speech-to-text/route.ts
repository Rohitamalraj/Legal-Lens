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
    
    if (!audioFile) {
      console.error('No audio file provided');
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Convert the audio file to buffer
    const audioBytes = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(audioBytes);

    console.log('Processing speech-to-text...');
    console.log('Audio file size:', audioBuffer.length);
    console.log('Language:', language);

    // Determine audio encoding based on file type/content and mobile status
    let encoding: 'WEBM_OPUS' | 'OGG_OPUS' | 'MP3' | 'LINEAR16' = 'WEBM_OPUS';
    let sampleRateHertz = isMobile ? 16000 : 48000; // Lower sample rate for mobile
    
    // Detect format from MIME type with mobile-specific handling
    if (audioFile.type.includes('mp4') || audioFile.name.includes('.mp4')) {
      // For MP4, use LINEAR16 encoding which works better
      encoding = 'LINEAR16';
      sampleRateHertz = isMobile ? 16000 : 44100;
    } else if (audioFile.type.includes('aac') || audioFile.name.includes('.aac')) {
      // For AAC, also use LINEAR16
      encoding = 'LINEAR16';
      sampleRateHertz = isMobile ? 16000 : 44100;
    } else if (audioFile.type.includes('mp3') || audioFile.name.includes('.mp3')) {
      encoding = 'MP3';
      sampleRateHertz = 44100;
    } else if (audioFile.type.includes('ogg') || audioFile.name.includes('.ogg')) {
      encoding = 'OGG_OPUS';
    } else if (audioFile.type.includes('opus')) {
      encoding = 'WEBM_OPUS';
    }
    
    console.log('Detected audio encoding:', encoding);
    console.log('Sample rate:', sampleRateHertz);
    console.log('Mobile optimized:', isMobile);

    // Configure the speech recognition request
    const request_config = {
      audio: {
        content: audioBuffer.toString('base64'),
      },
      config: {
        encoding,
        sampleRateHertz,
        languageCode: language,
        enableAutomaticPunctuation: true,
        model: isMobile ? 'phone_call' : 'latest_short', // Use phone_call model for mobile
        useEnhanced: true, // Use enhanced model if available
        maxAlternatives: 1, // Only need the best result
        profanityFilter: false,
      },
    };

    // Perform the speech recognition
    const [response] = await speechClient.recognize(request_config);
    
    if (!response.results || response.results.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No speech detected in audio'
      });
    }

    // Extract the transcription
    const transcription = response.results
      .map((result: any) => result.alternatives?.[0]?.transcript || '')
      .join(' ')
      .trim();

    // Get confidence score
    const confidence = response.results[0]?.alternatives?.[0]?.confidence || 0;

    console.log('Speech-to-text successful');
    console.log('Transcription:', transcription);
    console.log('Confidence:', confidence);

    return NextResponse.json({
      success: true,
      transcription,
      confidence,
      language,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Speech-to-text error:', error);
    
    // More detailed error reporting
    let errorMessage = 'Speech-to-text processing failed';
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        success: false,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Add a simple GET endpoint for health checking
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'speech-to-text',
    timestamp: new Date().toISOString(),
    hasCredentials: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'not-set'
  });
}