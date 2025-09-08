import { GoogleAuth } from 'google-auth-library'

/**
 * Google Cloud Configuration Service
 * Reads credentials from environment variables or uses ADC when not provided
 */
export class GoogleCloudConfig {
  private static instance: GoogleCloudConfig
  private auth: GoogleAuth
  private credentials?: any

  private constructor() {
    this.initializeCredentials()
    this.auth = new GoogleAuth({
      credentials: this.credentials,
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/cloud-platform.read-only',
      ],
    })
  }

  public static getInstance(): GoogleCloudConfig {
    if (!GoogleCloudConfig.instance) {
      GoogleCloudConfig.instance = new GoogleCloudConfig()
    }
    return GoogleCloudConfig.instance
  }

  private initializeCredentials() {
    // Prefer a single env var containing the JSON string
    const raw =
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ||
      ''

    if (raw) {
      try {
        // If value is a path-like string, allow fallback to file read in future as an enhancement.
        // For now we assume it's JSON content.
        this.credentials = JSON.parse(raw)
      } catch (_err) {
        // If parsing fails, leave credentials undefined to let ADC resolve.
        this.credentials = undefined
      }
    }
  }

  public getAuth(): GoogleAuth {
    return this.auth
  }

  public getCredentials() {
    return this.credentials
  }

  public getProjectId(): string {
    // If explicitly set, prefer env; otherwise try embedded credentials project_id
    return (
      process.env.GOOGLE_CLOUD_PROJECT_ID ||
      (this.credentials && this.credentials.project_id) ||
      ''
    )
  }

  public getLocation(): string {
    return process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
  }

  public async getAccessToken(): Promise<string> {
    const client = await this.auth.getClient()
    const accessToken = await client.getAccessToken()
    return accessToken.token || ''
  }
}
