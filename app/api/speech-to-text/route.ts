import { NextRequest, NextResponse } from 'next/server';
import { GoogleCloudConfig } from '@/lib/services/google-cloud-config';
import { SpeechClient } from '@google-cloud/speech';

// Initialize the Google Cloud Speech client
const googleCloudConfig = GoogleCloudConfig.getInstance();
const speechClient = new SpeechClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: googleCloudConfig.getCredentials(),
});

export async function POST(request: NextRequest) {
  try {
    console.log('=== SPEECH-TO-TEXT API ENDPOINT ===');
    
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'en-US';
    
    if (!audioFile) {
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

    // Configure the speech recognition request
    const request_config = {
      audio: {
        content: audioBuffer.toString('base64'),
      },
      config: {
        encoding: 'WEBM_OPUS' as const, // Common format for web recordings
        sampleRateHertz: 48000, // Standard for web audio
        languageCode: language,
        enableAutomaticPunctuation: true,
        model: 'latest_long', // Better for longer audio
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
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Speech-to-text processing failed',
        success: false 
      },
      { status: 500 }
    );
  }
}