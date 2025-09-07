import { NextRequest, NextResponse } from 'next/server';
import { GoogleCloudConfig } from '@/lib/services/google-cloud-config';

export async function GET(request: NextRequest) {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        googleCloud: false,
        documentAI: false,
        vertexAI: false
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'unknown',
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'not-set',
        hasCredentials: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY
      }
    };

    // Test Google Cloud connection
    try {
      const cloudConfig = GoogleCloudConfig.getInstance();
      const projectId = cloudConfig.getProjectId();
      
      if (projectId) {
        healthStatus.services.googleCloud = true;
        
        // Try to get access token
        await cloudConfig.getAccessToken();
        healthStatus.services.documentAI = true;
        healthStatus.services.vertexAI = true;
      }
    } catch (error) {
      console.error('Google Cloud health check failed:', error);
      healthStatus.status = 'degraded';
    }

    // Check required environment variables
    const requiredEnvVars = [
      'GOOGLE_CLOUD_PROJECT_ID',
      'GOOGLE_SERVICE_ACCOUNT_KEY'
    ];

    const missingEnvVars = requiredEnvVars.filter(
      envVar => !process.env[envVar]
    );

    if (missingEnvVars.length > 0) {
      healthStatus.status = 'unhealthy';
      return NextResponse.json(
        {
          ...healthStatus,
          error: 'Missing required environment variables',
          missingEnvVars
        },
        { status: 503 }
      );
    }

    // Return appropriate status code
    const statusCode = healthStatus.status === 'healthy' ? 200 : 
                      healthStatus.status === 'degraded' ? 200 : 503;

    return NextResponse.json(healthStatus, { status: statusCode });

  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 503 }
    );
  }
}
