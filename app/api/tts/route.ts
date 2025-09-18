import { NextRequest, NextResponse } from 'next/server'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { GoogleCloudConfig } from '@/lib/services/google-cloud-config'

// Initialize the TTS client with GoogleCloudConfig
const createClient = () => {
  try {
    const cloudConfig = GoogleCloudConfig.getInstance()
    const credentials = cloudConfig.getCredentials()
    const projectId = cloudConfig.getProjectId()
    
    console.log('TTS: Initializing client with project:', projectId)
    
    if (credentials) {
      console.log('TTS: Using explicit credentials from environment')
      return new TextToSpeechClient({
        projectId: projectId,
        credentials: credentials,
      })
    } else {
      console.log('TTS: Using Application Default Credentials (ADC)')
      return new TextToSpeechClient({
        projectId: projectId,
      })
    }
  } catch (error) {
    console.error('TTS: Failed to initialize client:', error)
    throw error
  }
}

let client: TextToSpeechClient | null = null

try {
  client = createClient()
  console.log('TTS: Client initialized successfully')
} catch (error) {
  console.error('TTS: Client initialization failed:', error)
  client = null
}

export async function POST(request: NextRequest) {
  try {
    // Re-initialize client if it failed during startup
    if (!client) {
      console.log('TTS: Attempting to re-initialize client...')
      try {
        client = createClient()
        console.log('TTS: Client re-initialized successfully')
      } catch (initError) {
        console.error('TTS: Client re-initialization failed:', initError)
        return NextResponse.json({ 
          error: 'Text-to-speech service not available. Please check Google Cloud credentials configuration.',
          details: initError instanceof Error ? initError.message : 'Unknown error'
        }, { status: 500 })
      }
    }

    const { text, languageCode = 'en-US', voiceType = 'neural' } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Validate text length (Google TTS has limits)
    if (text.length > 5000) {
      return NextResponse.json({ 
        error: 'Text too long. Maximum 5000 characters allowed.' 
      }, { status: 400 })
    }

    // Language voice mapping for better voice selection
    const getVoiceConfig = (lang: string) => {
      const voiceMap: Record<string, { name?: string, ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL' }> = {
        'en-US': { name: 'en-US-Neural2-D', ssmlGender: 'MALE' },
        'en-GB': { name: 'en-GB-Neural2-A', ssmlGender: 'FEMALE' },
        'es-ES': { name: 'es-ES-Neural2-C', ssmlGender: 'FEMALE' },
        'fr-FR': { name: 'fr-FR-Neural2-A', ssmlGender: 'FEMALE' },
        'de-DE': { name: 'de-DE-Neural2-A', ssmlGender: 'FEMALE' },
        'it-IT': { name: 'it-IT-Neural2-A', ssmlGender: 'FEMALE' },
        'pt-PT': { name: 'pt-PT-Wavenet-A', ssmlGender: 'FEMALE' },
        'pt-BR': { name: 'pt-BR-Neural2-A', ssmlGender: 'FEMALE' },
        'ru-RU': { name: 'ru-RU-Wavenet-A', ssmlGender: 'FEMALE' },
        'zh-CN': { name: 'cmn-CN-Wavenet-A', ssmlGender: 'FEMALE' },
        'ja-JP': { name: 'ja-JP-Neural2-B', ssmlGender: 'FEMALE' },
        'ko-KR': { name: 'ko-KR-Neural2-A', ssmlGender: 'FEMALE' },
        'ar-XA': { name: 'ar-XA-Wavenet-A', ssmlGender: 'FEMALE' },
        'hi-IN': { name: 'hi-IN-Neural2-A', ssmlGender: 'FEMALE' },
        'nl-NL': { name: 'nl-NL-Wavenet-A', ssmlGender: 'FEMALE' },
        'sv-SE': { name: 'sv-SE-Wavenet-A', ssmlGender: 'FEMALE' },
        'da-DK': { name: 'da-DK-Wavenet-A', ssmlGender: 'FEMALE' },
        'no-NO': { name: 'nb-NO-Wavenet-A', ssmlGender: 'FEMALE' },
        'fi-FI': { name: 'fi-FI-Wavenet-A', ssmlGender: 'FEMALE' },
        'pl-PL': { name: 'pl-PL-Wavenet-A', ssmlGender: 'FEMALE' },
        'cs-CZ': { name: 'cs-CZ-Wavenet-A', ssmlGender: 'FEMALE' },
        'hu-HU': { name: 'hu-HU-Wavenet-A', ssmlGender: 'FEMALE' },
      }

      return voiceMap[lang] || { ssmlGender: 'NEUTRAL' }
    }

    const voiceConfig = getVoiceConfig(languageCode)

    // Enhanced voice selection based on voiceType parameter
    let selectedVoice = voiceConfig
    if (voiceType === 'neural' && !voiceConfig.name?.includes('Neural')) {
      // Prefer Neural2 voices for better quality
      const neuralNames: Record<string, string> = {
        'en-US': 'en-US-Neural2-D',
        'en-GB': 'en-GB-Neural2-A', 
        'es-ES': 'es-ES-Neural2-C',
        'fr-FR': 'fr-FR-Neural2-A',
        'de-DE': 'de-DE-Neural2-A',
        'it-IT': 'it-IT-Neural2-A',
        'pt-BR': 'pt-BR-Neural2-A',
        'ja-JP': 'ja-JP-Neural2-B',
        'ko-KR': 'ko-KR-Neural2-A',
        'hi-IN': 'hi-IN-Neural2-A',
      }
      
      if (neuralNames[languageCode]) {
        selectedVoice = { name: neuralNames[languageCode], ssmlGender: 'FEMALE' }
      }
    }

    // Construct the request with optimized settings for speed
    const request_config = {
      input: { text },
      voice: {
        languageCode: languageCode,
        ...selectedVoice
      },
      audioConfig: {
        audioEncoding: 'MP3' as const,
        speakingRate: 1.1, // Slightly faster for quicker delivery
        pitch: 0.0,
        effectsProfileId: ['headphone-class-device'], // Optimized for digital playback
        volumeGainDb: 2.0, // Slightly louder for clarity
      },
    }

    console.log('TTS Request:', {
      text: text.substring(0, 100) + '...',
      languageCode,
      voice: selectedVoice
    })

    // Perform the text-to-speech request
    const [response] = await client.synthesizeSpeech(request_config)

    if (!response.audioContent) {
      throw new Error('No audio content received from Google TTS')
    }

    // Return the audio as base64
    const audioBase64 = Buffer.from(response.audioContent as Uint8Array).toString('base64')
    
    return NextResponse.json({ 
      audioContent: audioBase64,
      contentType: 'audio/mpeg'
    })

  } catch (error) {
    console.error('TTS API Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate speech', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}