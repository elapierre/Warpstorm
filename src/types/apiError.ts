/**
 * Represents an error returned from the API.
 */
export interface ApiError {
    /** The HTTP status code of the error. */
    statusCode: number;
    /** The error message. */
    message: string;
    /** Optional additional details about the error. */
    details?: any;
}
