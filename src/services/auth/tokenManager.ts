import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'accessToken';
const EXPIRES_AT_KEY = 'expiresAt';

/**
 * Stores the access token and its expiration time securely.
 * @param token Access token from auth service
 * @param expiresIn Seconds until token expires
 */
export const setToken = async (token: string, expiresIn: number) => {
  const expiresAt = Date.now() + expiresIn * 1000;
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(EXPIRES_AT_KEY, expiresAt.toString());
};

/**
 * Retrieves the current token if not expired, null otherwise.
 */
export const getToken = async (): Promise<string | null> => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  const expiresAtStr = await SecureStore.getItemAsync(EXPIRES_AT_KEY);
  if (!token || !expiresAtStr) return null;

  const expiresAt = parseInt(expiresAtStr, 10);
  if (Date.now() >= expiresAt) {
    await clearToken();
    return null;
  }

  return token;
};

/**
 * Clears the stored token and expiration time.
 */
export const clearToken = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(EXPIRES_AT_KEY);
};

/**
 * Checks whether the token is expired or missing.
 */
export const isTokenExpired = async (): Promise<boolean> => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  const expiresAtStr = await SecureStore.getItemAsync(EXPIRES_AT_KEY);
  if (!token || !expiresAtStr) return true;
  return Date.now() >= parseInt(expiresAtStr, 10);
};
