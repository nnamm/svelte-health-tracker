import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosError } from 'axios';
import {
	createHealthRecord,
	getHealthRecordByDate,
	getHealthRecordsByYear,
	getHealthRecordsByYearMonth,
	updateHealthRecord,
	deleteHealthRecord
} from './healthDataService';
import { apiClient, handleApiError } from '$lib/api/client';
import { DateUtils } from '$lib/utils/dateUtils';
import type { HealthRecord } from '$lib/types/HealthRecord';
import type { ApiResponse } from '$lib/api/types';

// Mock external dependencies
vi.mock('$lib/api/client');
vi.mock('$lib/utils/dateUtils');

// Type the mocked modules for better TypeScript support
const mockedApiClient = vi.mocked(apiClient);
const mockedHandleApiError = vi.mocked(handleApiError);
const mockedDateUtils = vi.mocked(DateUtils);

describe('healthDataService', () => {
	// Test data fixtures
	const mockHealthRecord: HealthRecord = {
		id: 1,
		date: '2023-05-15',
		step_count: 8500,
		created_at: '2023-05-15T10:00:00Z',
		updated_at: '2023-05-15T10:00:00Z'
	};

	const mockApiResponse = {
		data: {
			records: [mockHealthRecord]
		}
	};

	const mockApiResponseMultiple = {
		data: {
			records: [
				mockHealthRecord,
				{ ...mockHealthRecord, id: 2, date: '2023-05-16', step_count: 9000 }
			]
		}
	};

	const mockApiResponseEmpty = {
		data: {
			records: []
		}
	};

	beforeEach(() => {
		// Clear all mocks before each test
		vi.clearAllMocks();
		
		// Setup default mock implementations
		mockedDateUtils.formatForAPI.mockImplementation((date: string) => date.replace(/-/g, ''));
	});

	describe('createHealthRecord', () => {
		it('should create a health record successfully', async () => {
			// Arrange
			const newRecord: Partial<HealthRecord> = {
				date: '2023-05-15',
				step_count: 8500
			};
			mockedApiClient.post = vi.fn().mockResolvedValue(mockApiResponse);

			// Act
			const result = await createHealthRecord(newRecord);

			// Assert
			expect(mockedApiClient.post).toHaveBeenCalledWith('/health/records', newRecord);
			expect(result).toEqual({
				success: true,
				data: mockHealthRecord
			});
		});

		it('should handle API error when creating health record', async () => {
			// Arrange
			const newRecord: Partial<HealthRecord> = {
				date: '2023-05-15',
				step_count: 8500
			};
			const mockError = new AxiosError('Network Error');
			const mockErrorResponse: ApiResponse<never> = {
				success: false,
				data: null,
				error: 'Error creating health record'
			};

			mockedApiClient.post = vi.fn().mockRejectedValue(mockError);
			mockedHandleApiError.mockReturnValue(mockErrorResponse);

			// Act
			const result = await createHealthRecord(newRecord);

			// Assert
			expect(mockedApiClient.post).toHaveBeenCalledWith('/health/records', newRecord);
			expect(mockedHandleApiError).toHaveBeenCalledWith(mockError, 'Error creating health record');
			expect(result).toEqual(mockErrorResponse);
		});

		// Table-driven test for different record types
		it.each([
			[{ date: '2023-01-01', step_count: 5000 }],
			[{ date: '2023-12-31', step_count: 15000 }],
			[{ date: '2023-06-15', step_count: 0 }]
		])('should create health record with data: %o', async (recordData) => {
			// Arrange
			const expectedResponse = {
				data: { records: [{ ...mockHealthRecord, ...recordData }] }
			};
			mockedApiClient.post = vi.fn().mockResolvedValue(expectedResponse);

			// Act
			const result = await createHealthRecord(recordData);

			// Assert
			expect(result.success).toBe(true);
			expect(result.data).toEqual({ ...mockHealthRecord, ...recordData });
		});
	});

	describe('getHealthRecordByDate', () => {
		it('should get health record by date successfully', async () => {
			// Arrange
			const date = '2023-05-15';
			const formattedDate = '20230515';
			
			mockedDateUtils.formatForAPI.mockReturnValue(formattedDate);
			mockedApiClient.get = vi.fn().mockResolvedValue(mockApiResponse);

			// Act
			const result = await getHealthRecordByDate(date);

			// Assert
			expect(mockedDateUtils.formatForAPI).toHaveBeenCalledWith(date);
			expect(mockedApiClient.get).toHaveBeenCalledWith(`/health/records?date=${formattedDate}`);
			expect(result).toEqual({
				success: true,
				data: mockHealthRecord
			});
		});

		it('should return null when no record found for date', async () => {
			// Arrange
			const date = '2023-05-15';
			const formattedDate = '20230515';
			
			mockedDateUtils.formatForAPI.mockReturnValue(formattedDate);
			mockedApiClient.get = vi.fn().mockResolvedValue(mockApiResponseEmpty);

			// Act
			const result = await getHealthRecordByDate(date);

			// Assert
			expect(result).toEqual({
				success: true,
				data: null
			});
		});

		it('should handle API error when getting health record by date', async () => {
			// Arrange
			const date = '2023-05-15';
			const mockError = new AxiosError('Network Error');
			const mockErrorResponse: ApiResponse<never> = {
				success: false,
				data: null,
				error: 'Error fetching health record'
			};

			mockedDateUtils.formatForAPI.mockReturnValue('20230515');
			mockedApiClient.get = vi.fn().mockRejectedValue(mockError);
			mockedHandleApiError.mockReturnValue(mockErrorResponse);

			// Act
			const result = await getHealthRecordByDate(date);

			// Assert
			expect(mockedHandleApiError).toHaveBeenCalledWith(mockError, 'Error fetching health record');
			expect(result).toEqual(mockErrorResponse);
		});
	});

	describe('getHealthRecordsByYear', () => {
		it('should get health records by year successfully', async () => {
			// Arrange
			const year = 2023;
			mockedApiClient.get = vi.fn().mockResolvedValue(mockApiResponseMultiple);

			// Act
			const result = await getHealthRecordsByYear(year);

			// Assert
			expect(mockedApiClient.get).toHaveBeenCalledWith(`/health/records?year=${year}`);
			expect(result).toEqual({
				success: true,
				data: mockApiResponseMultiple.data.records
			});
		});

		it('should return empty array when no records found for year', async () => {
			// Arrange
			const year = 2023;
			mockedApiClient.get = vi.fn().mockResolvedValue(mockApiResponseEmpty);

			// Act
			const result = await getHealthRecordsByYear(year);

			// Assert
			expect(result).toEqual({
				success: true,
				data: []
			});
		});

		it('should handle API error when getting health records by year', async () => {
			// Arrange
			const year = 2023;
			const mockError = new AxiosError('Network Error');
			const mockErrorResponse: ApiResponse<never> = {
				success: false,
				data: null,
				error: 'Error fetching year health records'
			};

			mockedApiClient.get = vi.fn().mockRejectedValue(mockError);
			mockedHandleApiError.mockReturnValue(mockErrorResponse);

			// Act
			const result = await getHealthRecordsByYear(year);

			// Assert
			expect(mockedHandleApiError).toHaveBeenCalledWith(mockError, 'Error fetching year health records');
			expect(result).toEqual(mockErrorResponse);
		});

		// Table-driven test for different years
		it.each([
			[2020],
			[2023],
			[2025]
		])('should fetch records for year: %i', async (year) => {
			// Arrange
			mockedApiClient.get = vi.fn().mockResolvedValue(mockApiResponseEmpty);

			// Act
			await getHealthRecordsByYear(year);

			// Assert
			expect(mockedApiClient.get).toHaveBeenCalledWith(`/health/records?year=${year}`);
		});
	});

	describe('getHealthRecordsByYearMonth', () => {
		it('should get health records by year and month successfully', async () => {
			// Arrange
			const year = 2023;
			const month = 5;
			mockedApiClient.get = vi.fn().mockResolvedValue(mockApiResponseMultiple);

			// Act
			const result = await getHealthRecordsByYearMonth(year, month);

			// Assert
			expect(mockedApiClient.get).toHaveBeenCalledWith(`/health/records?year=${year}&month=05`);
			expect(result).toEqual({
				success: true,
				data: mockApiResponseMultiple.data.records
			});
		});

		it('should pad single digit months with zero', async () => {
			// Arrange
			const year = 2023;
			const month = 3;
			mockedApiClient.get = vi.fn().mockResolvedValue(mockApiResponseEmpty);

			// Act
			await getHealthRecordsByYearMonth(year, month);

			// Assert
			expect(mockedApiClient.get).toHaveBeenCalledWith(`/health/records?year=${year}&month=03`);
		});

		it('should handle double digit months correctly', async () => {
			// Arrange
			const year = 2023;
			const month = 12;
			mockedApiClient.get = vi.fn().mockResolvedValue(mockApiResponseEmpty);

			// Act
			await getHealthRecordsByYearMonth(year, month);

			// Assert
			expect(mockedApiClient.get).toHaveBeenCalledWith(`/health/records?year=${year}&month=12`);
		});

		it('should handle API error when getting health records by year and month', async () => {
			// Arrange
			const year = 2023;
			const month = 5;
			const mockError = new AxiosError('Network Error');
			const mockErrorResponse: ApiResponse<never> = {
				success: false,
				data: null,
				error: 'Error fetching year-month health records'
			};

			mockedApiClient.get = vi.fn().mockRejectedValue(mockError);
			mockedHandleApiError.mockReturnValue(mockErrorResponse);

			// Act
			const result = await getHealthRecordsByYearMonth(year, month);

			// Assert
			expect(mockedHandleApiError).toHaveBeenCalledWith(mockError, 'Error fetching year-month health records');
			expect(result).toEqual(mockErrorResponse);
		});

		// Table-driven test for month padding
		it.each([
			[1, '01'],
			[5, '05'],
			[10, '10'],
			[12, '12']
		])('should pad month %i to %s', async (month, expectedPadded) => {
			// Arrange
			const year = 2023;
			mockedApiClient.get = vi.fn().mockResolvedValue(mockApiResponseEmpty);

			// Act
			await getHealthRecordsByYearMonth(year, month);

			// Assert
			expect(mockedApiClient.get).toHaveBeenCalledWith(`/health/records?year=${year}&month=${expectedPadded}`);
		});
	});

	describe('updateHealthRecord', () => {
		it('should update health record successfully', async () => {
			// Arrange
			const updateData: Partial<HealthRecord> = {
				id: 1,
				step_count: 10000
			};
			mockedApiClient.put = vi.fn().mockResolvedValue(mockApiResponse);

			// Act
			const result = await updateHealthRecord(updateData);

			// Assert
			expect(mockedApiClient.put).toHaveBeenCalledWith('/health/records', updateData);
			expect(result).toEqual({
				success: true,
				data: mockHealthRecord
			});
		});

		it('should handle API error when updating health record', async () => {
			// Arrange
			const updateData: Partial<HealthRecord> = {
				id: 1,
				step_count: 10000
			};
			const mockError = new AxiosError('Network Error');
			const mockErrorResponse: ApiResponse<never> = {
				success: false,
				data: null,
				error: 'Error updating health record'
			};

			mockedApiClient.put = vi.fn().mockRejectedValue(mockError);
			mockedHandleApiError.mockReturnValue(mockErrorResponse);

			// Act
			const result = await updateHealthRecord(updateData);

			// Assert
			expect(mockedHandleApiError).toHaveBeenCalledWith(mockError, 'Error updating health record');
			expect(result).toEqual(mockErrorResponse);
		});

		// Table-driven test for different update scenarios
		it.each([
			[{ id: 1, step_count: 5000 }],
			[{ date: '2023-05-15', step_count: 12000 }],
			[{ id: 1, date: '2023-05-15', step_count: 8000 }]
		])('should update health record with data: %o', async (updateData) => {
			// Arrange
			const expectedResponse = {
				data: { records: [{ ...mockHealthRecord, ...updateData }] }
			};
			mockedApiClient.put = vi.fn().mockResolvedValue(expectedResponse);

			// Act
			const result = await updateHealthRecord(updateData);

			// Assert
			expect(mockedApiClient.put).toHaveBeenCalledWith('/health/records', updateData);
			expect(result.success).toBe(true);
		});
	});

	describe('deleteHealthRecord', () => {
		it('should delete health record successfully', async () => {
			// Arrange
			const date = '2023-05-15';
			const formattedDate = '20230515';
			
			mockedDateUtils.formatForAPI.mockReturnValue(formattedDate);
			mockedApiClient.delete = vi.fn().mockResolvedValue({});

			// Act
			const result = await deleteHealthRecord(date);

			// Assert
			expect(mockedDateUtils.formatForAPI).toHaveBeenCalledWith(date);
			expect(mockedApiClient.delete).toHaveBeenCalledWith(`/health/records?date=${formattedDate}`);
			expect(result).toEqual({
				success: true,
				data: true
			});
		});

		it('should handle API error when deleting health record', async () => {
			// Arrange
			const date = '2023-05-15';
			const mockError = new AxiosError('Network Error');
			const mockErrorResponse: ApiResponse<never> = {
				success: false,
				data: null,
				error: 'Error deleting health record'
			};

			mockedDateUtils.formatForAPI.mockReturnValue('20230515');
			mockedApiClient.delete = vi.fn().mockRejectedValue(mockError);
			mockedHandleApiError.mockReturnValue(mockErrorResponse);

			// Act
			const result = await deleteHealthRecord(date);

			// Assert
			expect(mockedHandleApiError).toHaveBeenCalledWith(mockError, 'Error deleting health record');
			expect(result).toEqual(mockErrorResponse);
		});

		// Table-driven test for different date formats
		it.each([
			['2023-01-01', '20230101'],
			['2023-12-31', '20231231'],
			['2023-06-15', '20230615']
		])('should delete record for date %s (formatted as %s)', async (date, expectedFormatted) => {
			// Arrange
			mockedDateUtils.formatForAPI.mockReturnValue(expectedFormatted);
			mockedApiClient.delete = vi.fn().mockResolvedValue({});

			// Act
			await deleteHealthRecord(date);

			// Assert
			expect(mockedDateUtils.formatForAPI).toHaveBeenCalledWith(date);
			expect(mockedApiClient.delete).toHaveBeenCalledWith(`/health/records?date=${expectedFormatted}`);
		});
	});

	describe('Environment variable handling', () => {
		it('should use correct endpoint from environment variable', async () => {
			// Arrange
			// Note: This test verifies the endpoint constant is used correctly
			// In a real scenario, you might want to test with different env values
			mockedApiClient.post = vi.fn().mockResolvedValue(mockApiResponse);

			// Act
			await createHealthRecord({ date: '2023-05-15', step_count: 8500 });

			// Assert
			expect(mockedApiClient.post).toHaveBeenCalledWith('/health/records', expect.any(Object));
		});
	});

	describe('Edge cases and error scenarios', () => {
		it('should handle malformed API response gracefully', async () => {
			// Arrange
			const malformedResponse = { data: {} }; // Missing records array
			mockedApiClient.get = vi.fn().mockResolvedValue(malformedResponse);

			// Act
			const result = await getHealthRecordByDate('2023-05-15');

			// Assert
			expect(result).toEqual({
				success: true,
				data: null
			});
		});

		it('should handle null/undefined records array', async () => {
			// Arrange
			const nullRecordsResponse = { data: { records: null } };
			mockedApiClient.get = vi.fn().mockResolvedValue(nullRecordsResponse);

			// Act
			const result = await getHealthRecordsByYear(2023);

			// Assert
			expect(result).toEqual({
				success: true,
				data: []
			});
		});

		it('should handle network timeout errors', async () => {
			// Arrange
			const timeoutError = new AxiosError('timeout of 10000ms exceeded');
			timeoutError.code = 'ECONNABORTED';
			const mockErrorResponse: ApiResponse<never> = {
				success: false,
				data: null,
				error: 'Error creating health record'
			};

			mockedApiClient.post = vi.fn().mockRejectedValue(timeoutError);
			mockedHandleApiError.mockReturnValue(mockErrorResponse);

			// Act
			const result = await createHealthRecord({ date: '2023-05-15', step_count: 8500 });

			// Assert
			expect(result.success).toBe(false);
			expect(mockedHandleApiError).toHaveBeenCalledWith(timeoutError, 'Error creating health record');
		});
	});
}); 