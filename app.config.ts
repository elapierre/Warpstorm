import 'dotenv/config';
import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "HubMobile",
  slug: "HubMobile",
  version: "3.0.0",
  plugins:[
    "expo-web-browser"
  ],
  extra: {
    apiBaseUrl: process.env.API_BASE_URL,
    oktaAuthUrl: process.env.OKTA_AUTH_URL,
    authSettings: {
      authUrl: process.env.DUENDE_AUTH_URL,
      clientId: process.env.DUENDE_CLIENT_ID,
      clientSecret: process.env.DUENDE_CLIENT_SECRET,
      grantType: process.env.DUENDE_GRANT_TYPE,
    },
    eas: {
        projectId: "d32bd8fe-7a0e-4310-89ed-c7d12b79ebfa"
      }
      
  },
  
});