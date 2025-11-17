import Api, { GetAsync, DeleteAsync, PostAsync, PutAsync } from "../../src/services/api";
import * as tokenManager from "../../src/services/auth/tokenManager";
import { ApiError } from "../../src/types/apiError";

/** Api Service Tests */
describe("Api Service", () => {

    const testUrl = "/test-endpoint";
    const mockData = { message: "success" };
    const mockConfig = { };

    const mockApiNotFoundError : ApiError = {
      statusCode: 404,
      message: "Not Found",
      details: { message : "Not Found" }
    };

    const mockApiBadRequestError : ApiError = {
      statusCode: 400,
      message: "Bad Request",
      details: { message : "Bad Request" }
    };

    const axiosNotFoundError = {
      isAxiosError: true,
      response: {
        status: 404,
        data: {
          message: "Not Found",
        },
      }
    };

    const axiosBadRequestError = {
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          message: "Bad Request",
        },
      }
    };

    const body = { id: null, firstname: "John", lastname: "Doe" };

    // Clear all mocks before each test
    beforeEach(() => {
      jest.clearAllMocks();
    });

    // Request Interceptor Tests
    describe("Request Interceptor", () => {
      // Interceptor should add Authorization header when token is available
      it("Should include Authorization header when token is available", async () => {
          const validToken = "valid-token";
          jest.spyOn(tokenManager, "getToken").mockReturnValue(validToken);
          jest.spyOn(tokenManager, "isTokenExpired").mockReturnValue(false);
        
          const config = { headers: {} };
          const result = (Api.interceptors.request as any).handlers[0].fulfilled(config);

          expect(result.headers.Authorization).toBe(`Bearer ${validToken}`);
      });

      // Interceptor should not add Authorization header when token is not available
      it("Should not include Authorization header when token is not available", async () => {
          jest.spyOn(tokenManager, "getToken").mockReturnValue(null);
          jest.spyOn(tokenManager, "isTokenExpired").mockReturnValue(true);
        
          const config = { headers: {} };
          const result = (Api.interceptors.request as any).handlers[0].fulfilled(config);

          expect(result.headers.Authorization).toBeUndefined();
      });
  });

  // GetAsync Tests
  describe("GetAsync", () => {
    // Should successfully fetch data
    it("Should fetch data successfully", async () => {
      const getSpy = jest.spyOn(Api, "get").mockResolvedValue({ data: mockData });

      const data = await GetAsync<typeof mockData>(testUrl, mockConfig);

      expect(data).toEqual(mockData);
      expect(getSpy).toHaveBeenCalledWith(testUrl, mockConfig);
    });

    // Should throw Not Found error
    it("Should throw Not Found error", async () => {
      const getSpy = jest.spyOn(Api, "get").mockRejectedValue(axiosNotFoundError);

      await expect(GetAsync<typeof mockData>(testUrl, mockConfig)).rejects.toEqual(mockApiNotFoundError);
      expect(getSpy).toHaveBeenCalledWith(testUrl, mockConfig);
      });
    });

  // PostAsync Tests
  describe("PostAsync", () => {
    
    // Should successfully send data
    it("Should send data successfully", async () => {
      const postSpy = jest.spyOn(Api, "post").mockResolvedValue({ data: mockData });
      const data = await PostAsync<typeof mockData>(testUrl, body, mockConfig);

      expect(data).toEqual(mockData);
      expect(postSpy).toHaveBeenCalledWith(testUrl, body, mockConfig);
    });

    // Should throw Bad Request error
    it("Should throw Bad Request error", async () => {
      const postSpy = jest.spyOn(Api, "post").mockRejectedValue(axiosBadRequestError);

      await expect(PostAsync<typeof mockData>(testUrl, body, mockConfig)).rejects.toEqual(mockApiBadRequestError);
      expect(postSpy).toHaveBeenCalledWith(testUrl, body, mockConfig);
      });
    });

  // PutAsync Tests
  describe("PutAsync", () => {

    // Should successfully send data
    it("Should send data successfully", async () => {
      const putSpy = jest.spyOn(Api, "put").mockResolvedValue({ data: mockData });

      const data = await PutAsync<typeof mockData>(testUrl, body, mockConfig);
      expect(data).toEqual(mockData);
      expect(putSpy).toHaveBeenCalledWith(testUrl, body, mockConfig);
    });

    // Should throw Bad Request error
    it("Should throw Bad Request error", async () => {
      const putSpy = jest.spyOn(Api, "put").mockRejectedValue(axiosBadRequestError);

      await expect(PutAsync<typeof mockData>(testUrl, body, mockConfig)).rejects.toEqual(mockApiBadRequestError);
      expect(putSpy).toHaveBeenCalledWith(testUrl, body, mockConfig);
    });

    // Should throw Not Found error
    it("Should throw Not Found error", async () => {
      const putSpy = jest.spyOn(Api, "put").mockRejectedValue(axiosNotFoundError);

      await expect(PutAsync<typeof mockData>(testUrl, body, mockConfig)).rejects.toEqual(mockApiNotFoundError);
      expect(putSpy).toHaveBeenCalledWith(testUrl, body, mockConfig);
      });
    });

    // DeleteAsync Tests
    describe("DeleteAsync", () => {
      // Should successfully delete data
      it("Should return successful response", async () => {
        const deleteSpy = jest.spyOn(Api, "delete").mockResolvedValue({ data: mockData });

        const data = await DeleteAsync<typeof mockData>(testUrl, mockConfig);
        expect(data).toEqual(mockData);
        expect(deleteSpy).toHaveBeenCalledWith(testUrl, mockConfig);
      });

      // Should throw Not Found error
      it("Should throw Not Found error", async () => {
        const deleteSpy = jest.spyOn(Api, "delete").mockRejectedValue(axiosNotFoundError);

        await expect(DeleteAsync<typeof mockData>(testUrl, mockConfig)).rejects.toEqual(mockApiNotFoundError);
        expect(deleteSpy).toHaveBeenCalledWith(testUrl, mockConfig);
        });
    });
});