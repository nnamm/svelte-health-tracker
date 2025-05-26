import { describe, it, expect } from 'vitest';
import { DateUtils } from './dateUtils';

describe('DateUtils', () => {
	describe('formatForAPI', () => {
		it('should remove hyphens from date string', () => {
			// Arrange
			const input = '2023-12-25';
			const expected = '20231225';

			// Act
			const result = DateUtils.formatForAPI(input);

			// Assert
			expect(result).toBe(expected);
		});

		// Table-driven test for multiple cases
		it.each([
			['2023-01-01', '20230101'],
			['2023-12-31', '20231231'],
			['2024-02-29', '20240229'], // Leap year
			['1999-05-15', '19990515'],
			['2025-07-04', '20250704']
		])('should format %s to %s', (input, expected) => {
			expect(DateUtils.formatForAPI(input)).toBe(expected);
		});

		it('should handle empty string', () => {
			expect(DateUtils.formatForAPI('')).toBe('');
		});

		it('should handle string without hyphens', () => {
			const input = '20231225';
			expect(DateUtils.formatForAPI(input)).toBe('20231225');
		});

		it('should handle string with multiple hyphens', () => {
			const input = '2023-12-25-extra';
			const expected = '20231225extra';
			expect(DateUtils.formatForAPI(input)).toBe(expected);
		});
	});

	describe('formatForDisplay', () => {
		it('should format date string for display in English', () => {
			// Arrange
			const input = '2023-12-25';
			const expected = 'December 25, 2023';

			// Act
			const result = DateUtils.formatForDisplay(input);

			// Assert
			expect(result).toBe(expected);
		});

		// Table-driven test for various dates
		it.each([
			['2023-01-01', 'January 1, 2023'],
			['2023-02-14', 'February 14, 2023'],
			['2023-03-15', 'March 15, 2023'],
			['2023-04-30', 'April 30, 2023'],
			['2023-05-01', 'May 1, 2023'],
			['2023-06-15', 'June 15, 2023'],
			['2023-07-04', 'July 4, 2023'],
			['2023-08-20', 'August 20, 2023'],
			['2023-09-10', 'September 10, 2023'],
			['2023-10-31', 'October 31, 2023'],
			['2023-11-25', 'November 25, 2023'],
			['2023-12-31', 'December 31, 2023']
		])('should format %s to %s', (input, expected) => {
			expect(DateUtils.formatForDisplay(input)).toBe(expected);
		});

		it('should handle leap year date', () => {
			const input = '2024-02-29';
			const expected = 'February 29, 2024';
			expect(DateUtils.formatForDisplay(input)).toBe(expected);
		});

		it('should handle edge case dates', () => {
			// Test century boundary
			expect(DateUtils.formatForDisplay('2000-01-01')).toBe('January 1, 2000');
			expect(DateUtils.formatForDisplay('1999-12-31')).toBe('December 31, 1999');
		});
	});

	describe('isValidDate', () => {
		describe('valid dates', () => {
			it.each([
				'2023-01-01',
				'2023-12-31',
				'2024-02-29', // Leap year
				'2000-02-29', // Century leap year
				'1999-05-15',
				'2025-07-04'
			])('should return true for valid date: %s', (dateString) => {
				expect(DateUtils.isValidDate(dateString)).toBe(true);
			});
		});

		describe('invalid format', () => {
			it.each([
				'2023/01/01', // Wrong separator
				'01-01-2023', // Wrong order
				'2023-1-1',   // Missing leading zeros
				'23-01-01',   // Two-digit year
				'2023-13-01', // Invalid month
				'2023-01-32', // Invalid day
				'2023-01',    // Missing day
				'2023',       // Only year
				'',           // Empty string
				'invalid',    // Non-date string
				'2023-01-01T00:00:00', // ISO format with time
				'2023-01-01 12:00:00'  // Date with time
			])('should return false for invalid format: %s', (dateString) => {
				expect(DateUtils.isValidDate(dateString)).toBe(false);
			});
		});

		describe('invalid dates', () => {
			it.each([
				'2023-02-29', // Not a leap year
				'2023-04-31', // April has only 30 days
				'2023-06-31', // June has only 30 days
				'2023-09-31', // September has only 30 days
				'2023-11-31', // November has only 30 days
				'1900-02-29', // Not a leap year (century rule)
				'2023-00-01', // Month 0
				'2023-01-00'  // Day 0
			])('should return false for invalid date: %s', (dateString) => {
				expect(DateUtils.isValidDate(dateString)).toBe(false);
			});
		});

		describe('edge cases', () => {
			it('should handle leap year correctly', () => {
				// Leap years
				expect(DateUtils.isValidDate('2024-02-29')).toBe(true);
				expect(DateUtils.isValidDate('2000-02-29')).toBe(true);
				
				// Non-leap years
				expect(DateUtils.isValidDate('2023-02-29')).toBe(false);
				expect(DateUtils.isValidDate('1900-02-29')).toBe(false);
			});

			it('should handle month boundaries correctly', () => {
				// 31-day months
				expect(DateUtils.isValidDate('2023-01-31')).toBe(true);
				expect(DateUtils.isValidDate('2023-03-31')).toBe(true);
				expect(DateUtils.isValidDate('2023-05-31')).toBe(true);
				expect(DateUtils.isValidDate('2023-07-31')).toBe(true);
				expect(DateUtils.isValidDate('2023-08-31')).toBe(true);
				expect(DateUtils.isValidDate('2023-10-31')).toBe(true);
				expect(DateUtils.isValidDate('2023-12-31')).toBe(true);

				// 30-day months
				expect(DateUtils.isValidDate('2023-04-30')).toBe(true);
				expect(DateUtils.isValidDate('2023-06-30')).toBe(true);
				expect(DateUtils.isValidDate('2023-09-30')).toBe(true);
				expect(DateUtils.isValidDate('2023-11-30')).toBe(true);

				// February in non-leap year
				expect(DateUtils.isValidDate('2023-02-28')).toBe(true);
			});
		});
	});
}); 