/**
 * Calendar helper functions
 * @module features/calendar/helpers/calendarHelper
 * @description Utility functions for generating and manipulating calendar data
 */

import { addDays, startOfWeek, startOfMonth, isSameMonth, isSameDay } from 'date-fns';
import type { Week, DayOfWeek } from '$lib/features/calendar/types';

/**
 * Internal implementation to generate calendar data for a specific month
 * Creates a 6-week calendar grid starting from the first day of the month
 *
 * @param {number} year - The year (e.g., 2025)
 * @param {number} realMonth - The month (1-12, not zero-indexed)
 * @param {DayOfWeek} startDayOfWeek - First day of the week (0 = Sunday, 1 = Monday, etc.)
 * @returns {Week[]} Array of weeks containing calendar day information
 * @private
 */
function generateCalendarMonthImpl(
	year: number,
	realMonth: number,
	startDayOfWeek: DayOfWeek = 0
): Week[] {
	const weeks: Week[] = [];
	const firstDayOfMonth = startOfMonth(new Date(year, realMonth - 1));
	const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: startDayOfWeek });
	const today = new Date();

	let currentDate = startDate;

	// Always generate 6 weeks
	for (let weekIndex = 0; weekIndex < 6; weekIndex++) {
		const week: Week = [];
		for (let i = 0; i < 7; i++) {
			week.push({
				date: currentDate,
				isCurrentMonth: isSameMonth(currentDate, firstDayOfMonth),
				isToday: isSameDay(currentDate, today)
			});
			currentDate = addDays(currentDate, 1);
		}
		weeks.push(week);
	}

	return weeks;
}

/**
 * Generates calendar data for a specific month with caching for performance
 * This is the main function that should be used by components
 *
 * @function generateCalendarMonth
 * @param {number} year - The year (e.g., 2025)
 * @param {number} realMonth - The month (1-12, not zero-indexed)
 * @param {DayOfWeek} startDayOfWeek - First day of the week (0 = Sunday, 1 = Monday, etc.)
 * @returns {Week[]} Array of weeks containing calendar day information
 *
 * @example
 * ```typescript
 * // Generate calendar for May 2025 starting with Sunday
 * const calendar = generateCalendarMonth(2025, 5, 0);
 *
 * // Generate calendar for June 2025 starting with Monday
 * const calendar = generateCalendarMonth(2025, 6, 1);
 * ```
 */
export const generateCalendarMonth = (() => {
	const cache = new Map<string, Week[]>();
	return (year: number, realMonth: number, startDayOfWeek: DayOfWeek = 0): Week[] => {
		const key = `${year}-${realMonth}-${startDayOfWeek}`;
		if (!cache.has(key)) {
			cache.set(key, generateCalendarMonthImpl(year, realMonth, startDayOfWeek));
		}
		return cache.get(key)!;
	};
})();

/**
 * Gets the month name from a month number
 *
 * @function getMonthName
 * @param {number} realMonth - The month number (1-12)
 * @returns {string} The month name (e.g., "January", "February")
 *
 * @example
 * ```typescript
 * const monthName = getMonthName(5); // Returns "May"
 * ```
 */
export function getMonthName(realMonth: number): string {
	const monthNames = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];
	return monthNames[(realMonth - 1) % 12];
}

/**
 * Gets an array of day names starting from the specified day of week
 *
 * @function getDaysOfWeek
 * @param {DayOfWeek} startDayOfWeek - First day of the week (0 = Sunday, 1 = Monday, etc.)
 * @returns {string[]} Array of day names in the correct order
 *
 * @example
 * ```typescript
 * // Get days starting from Sunday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
 * const days = getDaysOfWeek(0);
 *
 * // Get days starting from Monday: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
 * const days = getDaysOfWeek(1);
 * ```
 */
export function getDaysOfWeek(startDayOfWeek: DayOfWeek): string[] {
	const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	return [...dayOfWeek.slice(startDayOfWeek), ...dayOfWeek.slice(0, startDayOfWeek)];
}
