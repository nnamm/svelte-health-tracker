import axios, { type AxiosInstance, AxiosError } from 'axios';
import type { ApiResponse } from '$lib/api/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const apiClient: AxiosInstance = axios.create({
	baseURL: API_BASE_URL,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json'
	}
});

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

export const formatDate = (date: string): string => date.replace(/-/g, '');
