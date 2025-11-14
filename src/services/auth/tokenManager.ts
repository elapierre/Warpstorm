let accessToken: string | null = null;
let expiresAt: number | null = null;

/**
 * Sets the auth token and its expiration time.
 * @param token The auth token retrieved from the auth service.
 * @param expiresIn The number of seconds that the token is valid for.
 */
export const setToken = (token: string, expiresIn: number) => {
  accessToken = token;
  expiresAt = Date.now() + expiresIn * 1000;
};

/**
 * Gets the current auth token if it is not expired.
 * @returns The access token if present, null otherwise.
 */
export const getToken = (): string | null => {
  if (isTokenExpired()) {
    return null;
  }
  return accessToken;
};

/**
 * Clears the stored auth token and expiration time.
 */
export const clearToken = () => {
  accessToken = null;
  expiresAt = null;
};

/**
 * Checks if the current token is expired.
 * @returns True if the token is expired or not present, false otherwise.
 */
export const isTokenExpired = (): boolean => {
  return !accessToken || !expiresAt || Date.now() >= expiresAt;
};