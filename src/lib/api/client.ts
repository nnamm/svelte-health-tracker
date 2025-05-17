/**
 * API client configuration and utilities for making HTTP requests
 * @module api/client
 */

import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type { ApiResponse } from '$lib/api/types';

/** Base URL for API requests */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Preconfigured axios instance for making API requests
 * @constant
 */
export const apiClient: AxiosInstance = axios.create({
	baseURL: API_BASE_URL,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json'
	}
});

/**
 * Handles API errors in a consistent way
 * @param {unknown} error - The error object from the API call
 * @param {string} message - A descriptive error message
 * @returns {ApiResponse<never>} Standardized API response with error information
 */
export const handleApiError = (error: unknown, message: string): ApiResponse<never> => {
	if (axios.isAxiosError(error)) {
		const axiosError = error as AxiosError;
		console.error(`${message}:`, {
			status: axiosError.response?.status,
			statusText: axiosError.response?.statusText,
			data: axiosError.response?.data
		});
	} else {
		console.error(`${message}:`, error);
	}

	return {
		success: false,
		data: null,
		error: message
	};
};

/**
 * Formats date string by removing hyphens
 * @param {string} date - Date string in format YYYY-MM-DD
 * @returns {string} Date formatted as YYYYMMDD
 */
export const formatDate = (date: string): string => date.replace(/-/g, '');
