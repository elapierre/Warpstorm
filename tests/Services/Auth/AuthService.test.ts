import { loginWithDuendeAsync } from "../../../src/Services/Auth/AuthService";
import axios from "axios";
import Constants from 'expo-constants';
import { AuthSetting } from "../../../src/Types/Auth/AuthSetting";

const mockedAuthSettings = (Constants as any).expoConfig.extra.authSettings as AuthSetting;

/** Auth Service Tests */
describe("AuthService", () => {
    
    // Tests for loginWithDuendeAsync
    describe("loginWithDuendeAsync", () => {

        // Test successful login
        it("Should return true", async () => {
            const axiosSuccessResponse = {
                status: 200,
                data: {
                    access_token: "fake_access_token",
                    expires_in: 3600,
                },
            };
            
            const axiosPostSpy = jest.spyOn(axios, "post").mockResolvedValue(axiosSuccessResponse);
            
            await expect(loginWithDuendeAsync()).resolves.toBe(true);
            expect(axiosPostSpy).toHaveBeenCalledWith(mockedAuthSettings.authUrl, {
                client_id: mockedAuthSettings.clientId,
                client_secret: mockedAuthSettings.clientSecret,
                grant_type: mockedAuthSettings.grantType,
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
        });

        // Test failed login
        it("Should return false", async () => {
            const axiosBadRequestError = {
                isAxiosError: true,
                response: {
                    status: 400,
                    data: { 
                    message: "Bad Request",
                    },
                }
            };
            
            const axiosPostSpy = jest.spyOn(axios, "post").mockRejectedValue(axiosBadRequestError);

            await expect(loginWithDuendeAsync()).resolves.toBe(false);
            expect(axiosPostSpy).toHaveBeenCalledWith(mockedAuthSettings.authUrl, {
                client_id: mockedAuthSettings.clientId,
                client_secret: mockedAuthSettings.clientSecret,
                grant_type: mockedAuthSettings.grantType,
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
        });
    });
});