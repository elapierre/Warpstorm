import axios from "axios";
import Constants from "expo-constants";
import { setToken } from "./TokenManager";
import { AuthSetting } from "../../Types/Auth/AuthSetting";


/**
 * Logs in using Duende authentication and stores the token.
*/
export const loginWithDuendeAsync = async () : Promise<boolean> => {
    try {
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

    if(response.status == 200) {
        const { access_token, expires_in } = response.data;
        const token = access_token;
        const expiresIn = expires_in;
        setToken(token, expiresIn);
        return true;
    }
    else {
        throw new Error("Unsuccessful duende response", { cause: response });
    }
    } catch (error) {
        // Log the error
        console.log(error);
        return false;
    }
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