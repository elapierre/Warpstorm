import 'dotenv/config';
import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const isLocal = process.env.LOCAL_BUILD === '1'; // Set this for local builds

  return {
    ...config,
    name: "HubMobile",
    slug: "HubMobile",
    version: "3.0.0",
    orientation: "portrait",
    icon: "./assets/upfit_icon_225.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/upfit_icon_225.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    android: {
      ...config.android,
      package: "com.ericlapierre.HubMobile",
      versionCode: 2,
      adaptiveIcon: {
        foregroundImage: "./assets/upfit_icon_225.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      // Only include for local builds
      ...(isLocal
    ? { googleServicesFile: "./android/app/google-services.json" }
    : { googleServicesFile: process.env.GOOGLE_SERVICES_JSON }),
    },
    ios: {
      supportsTablet: true,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-web-browser",
      "expo-sqlite",
      "expo-localization"
    ],
    extra: {
      apiBaseUrl: process.env.API_BASE_URL,
      oktaAuthUrl: process.env.OKTA_AUTH_URL,
      authSettings: {
        authUrl: process.env.DUENDE_AUTH_URL,
        clientId: process.env.DUENDE_CLIENT_ID,
        grantType: "authorization_code", // PKCE uses authorization_code
    },
      eas: {
        projectId: "d32bd8fe-7a0e-4310-89ed-c7d12b79ebfa",
      },
    },
  };
};
