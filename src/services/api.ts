import axios, { AxiosError, AxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import { getToken, isTokenExpired, clearToken } from "./Auth/tokenManager";
import { ApiError } from "../Types/apiError";

/** The base URL for the Holman Upfit API. */
const baseURL : string = Constants.expoConfig?.extra?.apiBaseUrl as string; 

/** Axios instance for API calls. */
const Api = axios.create({
  baseURL: baseURL,
  timeout: 10000,
    headers: {
    "Content-Type": "application/json",
  },
});

/** 
 * Adds the authorization token to the request headers if available and not expired. 
 */
Api.interceptors.request.use(config => {
    const token = getToken();
    
    if(token && !isTokenExpired()) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  }
);

// Response interceptor to handle errors
Api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
            // TODO: Need to figure out the Okta flow and reconsider this part 
            // await loginWithDuendeAsync();
            // const newToken = getToken();

            // if (newToken){
            //     originalRequest.headers = {
            //         ...originalRequest.headers,
            //         Authorization: `Bearer ${newToken}`,
            //     };

            //     return api(originalRequest);
            // }

        } catch (authError) {
            clearToken();
            return Promise.reject(authError);
        }
    }

    return Promise.reject(error);
  }
);

/**
 * Formats an error into the ApiError structure.
 * @param error The error that occurred.
 * @returns The error in the ApiError format.
 */
const formatApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    return {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || error.message || "An unexpected error occurred",
      details: error.response?.data || null,
    };
  }

  return {
    statusCode: 500,
    message: "Unable to determine the error that occurred.",
  };
}

/**
 * Gets data from the API.
 * @param url The path to the resource to retrieve.
 * @param config Optional configuration settings.
 * @returns The data from the API response.
 */
export async function GetAsync<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  try {

    const response = await Api.get<T>(url, config);
    return response.data;

  } catch (error) {
    throw formatApiError(error);
  }
}

/**
 * Creates a new resource in the API.
 * @param url The path to the resource to be created.
 * @param data The payload to be used to create the resource.
 * @param config Optional configuration settings.
 * @returns The data from the API response.
 */
export async function PostAsync<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  try {

    const response = await Api.post<T>(url, data, config);
    return response.data;

  } catch (error) {
    throw formatApiError(error);
  }
}

/**
 * Updates an existing resource in the API.
 * @param url The path of the resource to be updated.
 * @param data The payload to be used to update the resources.
 * @param config Optional configuration settings.
 * @returns The data from the API response.
 */
export async function PutAsync<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  try {

    const response = await Api.put<T>(url, data, config);
    return response.data;

  } catch (error) {
    throw formatApiError(error);
  }
}

/**
 * Deletes a resource from the API.
 * @param url The path of the resource to be deleted.
 * @param config Optional configuration settings.
 * @returns The data from the API response.
 */
export async function DeleteAsync<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  try {

    const response = await Api.delete<T>(url, config);
    return response.data;

  } catch (error) {
    throw formatApiError(error);
  }
}

export default Api;