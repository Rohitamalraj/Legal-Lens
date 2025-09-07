import { GoogleAuth } from 'google-auth-library';

/**
 * Google Cloud Configuration Service
 * Handles authentication and configuration for Google Cloud services
 */
export class GoogleCloudConfig {
  private static instance: GoogleCloudConfig;
  private auth: GoogleAuth;
  private credentials: any;

  private constructor() {
    this.initializeCredentials();
    this.auth = new GoogleAuth({
      credentials: this.credentials,
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/cloud-platform.read-only'
      ]
    });
  }

  public static getInstance(): GoogleCloudConfig {
    if (!GoogleCloudConfig.instance) {
      GoogleCloudConfig.instance = new GoogleCloudConfig();
    }
    return GoogleCloudConfig.instance;
  }

  private initializeCredentials() {
    try {
      // Use hardcoded credentials for now to avoid parsing issues
      this.credentials = {
        type: "service_account",
        project_id: "legal-470516",
        private_key_id: "e0f24b8c70275f6f7a00f3c170598479716d1569",
        private_key: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCR9j9E0Hjms+6g
0fuslQmadgv8khSDEgl5dvYHis2uxBriTzyy4fJezhBJVB2w8+LVpgAw5ntlEtsG
46b6/3lexWj8VNz1m6/y38z9Yj5EZzs7UA2eWXTTxjPXOSSxL7x8+lPVSS3saowt
RIrv2EbKVlSmMrOo2Nz++N8qZ2RormuUfYY9hKGSm9zyBvbV4H4xCkdA8wTGmkjq
rC+C1nrBtQPJXItY21bbM1ekoO8NAFjnBJ1qExDs6kwdew2OHpvU3plFTxGg/Kh1
pR1xufnPwYh/V4eJf8rq4AG0w5e2hRSEzg8KbWplNmEQnctH7FzC0Qf1pnGG5ZVO
020z3X+1AgMBAAECggEARn/4jj3db50QEOhrla/E3DDRWFSciLRhFCST8A+oihXZ
YF7iVAqTXRxNvIVe8/XQpd4QsI3aovapCRpTMF/OGSrjqyE4On9QzFAxvF9D8Rkl
gGAJu+a8aX+N0ZIduWFzuq/UZyv5/Pt3qnO1YeSGSLvLFh1eLptUnujJLbuTwYVm
2zJ/ZtgDAo1AHKCcxVBN1ZXYo41R7zd5vukwWKeO3ezoYQrMbi+TV+0gAWH5mxw0
1IWfkgEt/HeJe0bZWUe7q96rCdHVSneVOKV2rRnk5SJXZyGauncz3CK5O0IJo1rZ
7VI07eSqTBcUWoSULuknfVBFfqoNNrOluucWCkMF7wKBgQDEAWsftNVpRyaEusew
UdQT09mGMGXqKjBGuGg+Y1sZrBKqzUGt+X3FIJ1569BBf9sTbRGnlQzCMW385c9p
Q7V0rqC+yWtvPSzTJBClXsPgq/iMe0byigFJHxsgAMk+S+7MQ3aD44Qqca6pKJpF
CneCdMkOk5GxOf7jVfgO9+5ARwKBgQC+o4O7OcDAFqFB5VMqwr+1ypHoylZhl9RN
9psUpdVSeZM0pyVvYY6fZXqRYrvgoEkmuPUt8/oRRYgoZEohx9Dq6xJyDXEVrRy9
/SvO9rQjWIMy3Dj4oho1oo0nLFn3a02HzttYN55neNF3ky+6YALGG2Pql4mw08po
BGg2l2CaIwKBgA/0qZrIJsNONnWBmvXgg2olycRhtjosuwdWxa2meukJF+/ti5Y1
BCcC867UInzigpv/OfuxZ3t7eJ+ouYyxJVldSdqeHO/ORBLgEbbUkw98EFynQGxI
Dbi9HoEpbzhyB/t61nAAGmc2H+jHVF+gbYAiL6fPHYIW3Yf2HJ5jUnLLAoGBAJOC
Rm3aVDDN0d0BKwcNRfXOVnRAC/Lb3mStCnZBkvyMIcE+DBNQ82CWzu4r7Z/zpmaV
+vChtb8jhCVs5Iea6ya62bzydawGFRVVDk7ISb6HwIzcJiEMnScfLgU/piVyG72X
69UoxCLgM4RImUem/r53dyqQMvRmDFnL/y8ulortAoGAe2q1RYjQfHExFVhd9SrY
/WWvox3iC4WDI1Br1XqVja3kgGxRyJI0t83RCwO8NugFApa/LuoUywITXgG5er8w
us0fLpYBvG+CN9YeRi+bw1tPNy2au5Jl1t4+w6gGXd5HLAPBOCen9oijANaqVoPP
kHxXd3X3Ug1ShUPd0ArvPHQ=
-----END PRIVATE KEY-----`,
        client_email: "vertex-ai-sa@legal-470516.iam.gserviceaccount.com",
        client_id: "101051516092906102411",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/vertex-ai-sa%40legal-470516.iam.gserviceaccount.com",
        universe_domain: "googleapis.com"
      };

      console.log('Google Cloud credentials initialized successfully');

    } catch (error) {
      console.error('Failed to initialize Google Cloud credentials:', error);
      throw new Error('Invalid Google Cloud credentials');
    }
  }

  public getAuth(): GoogleAuth {
    return this.auth;
  }

  public getCredentials() {
    return this.credentials;
  }

  public getProjectId(): string {
    return process.env.GOOGLE_CLOUD_PROJECT_ID || this.credentials.project_id;
  }

  public getLocation(): string {
    return process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
  }

  public async getAccessToken(): Promise<string> {
    try {
      const client = await this.auth.getClient();
      const accessToken = await client.getAccessToken();
      return accessToken.token || '';
    } catch (error) {
      console.error('Failed to get access token:', error);
      throw new Error('Unable to obtain access token');
    }
  }
}
