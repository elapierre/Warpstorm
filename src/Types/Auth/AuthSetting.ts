/**
 * Interface representing authentication settings.
 */
export interface AuthSetting {
    /** The URL of the authentication service. */
    authUrl: string;
    /** The client ID for authentication. */
    clientId: string;
    /** The client secret for authentication. */
    clientSecret: string;
    /** The grant type for authentication. */
    grantType: string;
}