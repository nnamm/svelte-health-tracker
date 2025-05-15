/**
 * Type definitions for API-related data structures
 * @module api/types
 */

/**
 * Standard API response structure for consistent response handling
 * @template T The type of data returned in a successful response
 * @property {boolean} success Indicates whether the API request was successful
 * @property {T | null} data The data returned by the API (null if request failed)
 * @property {string} [error] Error message if the request failed
 */
export interface ApiResponse<T> {
	success: boolean;
	data: T | null;
	error?: string;
}
