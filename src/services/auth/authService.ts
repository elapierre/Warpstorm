// authService.ts
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const authSettings = Constants.expoConfig?.extra?.authSettings;

const discovery = {
  authorizationEndpoint: authSettings.authorization_endpoint,
  tokenEndpoint: authSettings.token_endpoint,
  revocationEndpoint: authSettings.revocation_endpoint,
};

export interface AuthResult {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresIn?: number;
}

/**
 * Performs OAuth2 login using Duende server and PKCE.
 * Stores the token in secure storage.
 */
export const loginWithDuendeAsync = async (): Promise<AuthResult | null> => {
  try {
    const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

    const authRequest = new AuthSession.AuthRequest({
      clientId: authSettings.client_id,
      scopes: ['openid', 'profile', 'email', 'offline_access'],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
    });

    await authRequest.promptAsync(discovery);

    const result = await authRequest.exchangeCodeAsync(
      {
        code: authRequest.code!,
        clientId: authSettings.client_id,
        redirectUri,
      },
      discovery
    );

    if (!result.accessToken) return null;

    // Store tokens securely
    await SecureStore.setItemAsync('accessToken', result.accessToken);
    if (result.refreshToken) {
      await SecureStore.setItemAsync('refreshToken', result.refreshToken);
    }

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      idToken: result.idToken,
      expiresIn: result.expiresIn,
    };
  } catch (err) {
    console.error('Login failed', err);
    return null;
  }
};

/**
 * Retrieves access token from secure storage
 */
export const getToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync('accessToken');
};
