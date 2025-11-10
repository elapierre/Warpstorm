import 'dotenv/config';
import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "HubMobile",
  slug: "hub-mobile",
  version: "1.0.0",
  extra: {
    apiBaseUrl: process.env.API_BASE_URL,
    oktaAuthUrl: process.env.OKTA_AUTH_URL,
    authSettings: {
      authUrl: process.env.DUENDE_AUTH_URL,
      clientId: process.env.DUENDE_CLIENT_ID,
      clientSecret: process.env.DUENDE_CLIENT_SECRET,
      grantType: process.env.DUENDE_GRANT_TYPE,
    },
  },
});