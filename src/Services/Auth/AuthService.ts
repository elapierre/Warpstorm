import axios from "axios";
import { setToken } from "./TokenManager";
import Constants from "expo-constants";
import { AuthSetting } from "../../Types/Auth/AuthSetting";


/**
 * Logs in using Duende authentication and stores the token.
*/
export const loginWithDuendeAsync = async () : Promise<void> => {
    const authSetting: AuthSetting = Constants.expoConfig?.extra?.authSettings as AuthSetting;
    const response = await axios.post(authSetting.authUrl, {
        client_id: authSetting.clientId,
        client_secret: authSetting.clientSecret,
        grant_type: authSetting.grantType,
    }, {
        headers: {
            "Content-Type": "application/json",
        },
    });
    const { access_token, expires_in } = response.data;
    const token = access_token;
    const expiresIn = expires_in;
    setToken(token, expiresIn);
};


export const loginWithOktaAsync = async (username: string, password: string) : Promise<void> => {
    const oktaAuthUrl: string = Constants.expoConfig?.extra?.oktaAuthUrl as string;
    const response = await axios.post(oktaAuthUrl, {
        username,
        password,
    }, {
        headers: {
            "Content-Type": "application/json",
        },
    });
    const { token, expiresIn } = response.data;
    setToken(token, expiresIn);
};