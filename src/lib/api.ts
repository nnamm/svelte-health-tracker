import axios, { type AxiosInstance, AxiosError } from 'axios';
import type { HealthRecord } from '$lib/types/HealthRecord';

interface ApiResponse<T> {
	success: boolean;
	data: T | null;
	error?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const ENDPOINT = import.meta.env.VITE_API_ENDPOINT || '/health/records';

const apiClient: AxiosInstance = axios.create({
	baseURL: API_BASE_URL,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json'
	}
});

const handleApiError = (error: unknown, message: string): ApiResponse<never> => {
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

const formatDate = (date: string): string => date.replace(/-/g, '');

export const api = {
	/**
	 * Creates a new health record in the system
	 * @param healthRecord - The health record data to create
	 * @returns The created health record or null if creation failed
	 */
	async createHealthRecord(
		healthRecord: Partial<HealthRecord>
	): Promise<ApiResponse<HealthRecord>> {
		try {
			const response = await apiClient.post(ENDPOINT, healthRecord);
			return {
				success: true,
				data: response.data.records[0]
			};
		} catch (error) {
			return handleApiError(error, 'Error creating health record');
		}
	},

	/**
	 * Retrieves a health record for a specific date
	 * @param date - The date in 'YYYYMMDD' format
	 * @returns The health record for the date or null if not found
	 */
	async getHealthRecordByDate(date: string): Promise<ApiResponse<HealthRecord>> {
		try {
			console.log(API_BASE_URL, ENDPOINT);

			const formattedDate = formatDate(date);
			const response = await apiClient.get(`${ENDPOINT}?date=${formattedDate}`);
			if (response.data.records && response.data.records.length > 0) {
				return {
					success: true,
					data: response.data.records[0]
				};
			}
			return {
				success: true,
				data: null
			};
		} catch (error) {
			return handleApiError(error, 'Error fetching health record');
		}
	},

	/**
	 * Gets all health records for a specific year
	 * @param year - The year (YYYY)
	 * @returns Array of health records for the year
	 */
	async getHealthRecordsByYear(year: number): Promise<ApiResponse<HealthRecord[]>> {
		try {
			const response = await apiClient.get(`${ENDPOINT}?year=${year}`);
			return {
				success: true,
				data: response.data.records || []
			};
		} catch (error) {
			return handleApiError(error, 'Error fetching year health records');
		}
	},

	/**
	 * Gets all health records for a specific year and month
	 * @param year - The year (YYYY)
	 * @param month - The month (01-12)
	 * @returns Array of health records for the year and month
	 */
	async getHealthRecordsByYearMonth(
		year: number,
		month: number
	): Promise<ApiResponse<HealthRecord[]>> {
		try {
			const paddedMonth = month.toString().padStart(2, '0');
			const response = await apiClient.get(`${ENDPOINT}?year=${year}&month=${paddedMonth}`);
			return {
				success: true,
				data: response.data.records || []
			};
		} catch (error) {
			return handleApiError(error, 'Error fetching year-month health records');
		}
	},

	/**
	 * Updates an existing health record
	 * @param healthRecord - The health record data to update
	 * @returns The updated health record or null if update failed
	 */
	async updateHealthRecord(
		healthRecord: Partial<HealthRecord>
	): Promise<ApiResponse<HealthRecord>> {
		try {
			const response = await apiClient.put(`${ENDPOINT}`, healthRecord);
			return {
				success: true,
				data: response.data.records[0]
			};
		} catch (error) {
			return handleApiError(error, 'Error updating health record');
		}
	},

	/**
	 * Deletes a health record for a specific date
	 * @param date - The date in 'YYYYMMDD' format
	 * @returns True if deletion was successful, false otherwise
	 */
	async deleteHealthRecord(date: string): Promise<ApiResponse<boolean>> {
		try {
			const formattedDate = formatDate(date);
			await apiClient.delete(`${ENDPOINT}?date=${formattedDate}`);
			return {
				success: true,
				data: true
			};
		} catch (error) {
			return handleApiError(error, 'Error deleting health record');
		}
	}
};
