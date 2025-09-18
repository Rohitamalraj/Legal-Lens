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
    
    console.log('Audio file received:', !!audioFile);
    console.log('Language:', language);
    
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

    // Determine audio encoding based on file type/content
    let encoding: 'WEBM_OPUS' | 'OGG_OPUS' | 'MP3' | 'LINEAR16' = 'WEBM_OPUS';
    let sampleRateHertz = 48000;
    
    // Try to detect format from MIME type
    if (audioFile.type.includes('mp3')) {
      encoding = 'MP3';
      sampleRateHertz = 44100;
    } else if (audioFile.type.includes('ogg')) {
      encoding = 'OGG_OPUS';
    }
    
    console.log('Detected audio encoding:', encoding);
    console.log('Sample rate:', sampleRateHertz);

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
        model: 'latest_short', // Better for shorter audio clips
        useEnhanced: true, // Use enhanced model if available
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