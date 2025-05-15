/**
 * Health data service module
 * @module features/health/services/healthDataService
 * @description Provides functions for CRUD operations on health records
 */

import { apiClient, handleApiError, formatDate } from '$lib/api/client';
import type { ApiResponse } from '$lib/api/types';
import type { HealthRecord } from '$lib/types/HealthRecord';

/** API endpoint for health records */
const ENDPOINT = import.meta.env.VITE_API_ENDPOINT || '/health/records';

/**
 * Creates a new health record in the system
 * 
 * @async
 * @function createHealthRecord
 * @param {Partial<HealthRecord>} healthRecord - The health record data to create
 * @returns {Promise<ApiResponse<HealthRecord>>} The created health record or null if creation failed
 * @throws {Error} When API request fails
 * 
 * @example
 * ```typescript
 * const result = await createHealthRecord({
 *   date: '2023-05-15',
 *   step_count: 8500
 * });
 * 
 * if (result.success && result.data) {
 *   console.log('Created record ID:', result.data.id);
 * }
 * ```
 */
export async function createHealthRecord(
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
}

/**
 * Retrieves a health record for a specific date
 * 
 * @async
 * @function getHealthRecordByDate
 * @param {string} date - The date in 'YYYY-MM-DD' format
 * @returns {Promise<ApiResponse<HealthRecord>>} The health record for the date or null if not found
 * @throws {Error} When API request fails
 * 
 * @example
 * ```typescript
 * const result = await getHealthRecordByDate('2023-05-15');
 * 
 * if (result.success && result.data) {
 *   console.log('Steps:', result.data.step_count);
 * } else {
 *   console.log('No record found for this date');
 * }
 * ```
 */
export async function getHealthRecordByDate(date: string): Promise<ApiResponse<HealthRecord>> {
	try {
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
}

/**
 * Gets all health records for a specific year
 * 
 * @async
 * @function getHealthRecordsByYear
 * @param {number} year - The year (YYYY)
 * @returns {Promise<ApiResponse<HealthRecord[]>>} Array of health records for the year
 * @throws {Error} When API request fails
 * 
 * @example
 * ```typescript
 * const result = await getHealthRecordsByYear(2023);
 * 
 * if (result.success) {
 *   console.log(`Found ${result.data.length} records for 2023`);
 * }
 * ```
 */
export async function getHealthRecordsByYear(year: number): Promise<ApiResponse<HealthRecord[]>> {
	try {
		const response = await apiClient.get(`${ENDPOINT}?year=${year}`);
		return {
			success: true,
			data: response.data.records || []
		};
	} catch (error) {
		return handleApiError(error, 'Error fetching year health records');
	}
}

/**
 * Gets all health records for a specific year and month
 * 
 * @async
 * @function getHealthRecordsByYearMonth
 * @param {number} year - The year (YYYY)
 * @param {number} month - The month (1-12)
 * @returns {Promise<ApiResponse<HealthRecord[]>>} Array of health records for the year and month
 * @throws {Error} When API request fails
 * 
 * @example
 * ```typescript
 * const result = await getHealthRecordsByYearMonth(2023, 5);
 * 
 * if (result.success) {
 *   console.log(`Found ${result.data.length} records for May 2023`);
 * }
 * ```
 */
export async function getHealthRecordsByYearMonth(
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
}

/**
 * Updates an existing health record
 * 
 * @async
 * @function updateHealthRecord
 * @param {Partial<HealthRecord>} healthRecord - The health record data to update (must include id or date)
 * @returns {Promise<ApiResponse<HealthRecord>>} The updated health record or null if update failed
 * @throws {Error} When API request fails
 * 
 * @example
 * ```typescript
 * const result = await updateHealthRecord({
 *   id: 123,
 *   step_count: 10000
 * });
 * 
 * if (result.success) {
 *   console.log('Record updated successfully');
 * }
 * ```
 */
export async function updateHealthRecord(
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
}

/**
 * Deletes a health record for a specific date
 * 
 * @async
 * @function deleteHealthRecord
 * @param {string} date - The date in 'YYYY-MM-DD' format
 * @returns {Promise<ApiResponse<boolean>>} True if deletion was successful, false otherwise
 * @throws {Error} When API request fails
 * 
 * @example
 * ```typescript
 * const result = await deleteHealthRecord('2023-05-15');
 * 
 * if (result.success && result.data) {
 *   console.log('Record deleted successfully');
 * }
 * ```
 */
export async function deleteHealthRecord(date: string): Promise<ApiResponse<boolean>> {
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
