/**
 * Calendar type definitions
 * @module features/calendar/types
 * @description Contains all type definitions for the calendar feature
 */

/**
 * Represents a single day in the calendar grid
 *
 * @interface CalendarDay
 * @property {Date} date - JavaScript Date object for this calendar day
 * @property {boolean} isCurrentMonth - Whether this day belongs to the currently displayed month
 * @property {boolean} isToday - Whether this day is the current day
 */
export interface CalendarDay {
	date: Date;
	isCurrentMonth: boolean;
	isToday: boolean;
}

/**
 * Represents health data status for a specific day
 * Used to track which days have health records
 *
 * @interface DailyHealthRecord
 * @property {string} date - Date string in YYYY-MM-DD format
 * @property {boolean} hasHealthData - Whether health data exists for this day
 */
export interface DailyHealthRecord {
	date: string;
	stepCount: number;
	hasHealthData: boolean;
}

/**
 * Represents a week in the calendar (array of 7 calendar days)
 */
export type Week = CalendarDay[];

/**
 * Day of week as a number
 * 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Month number (1-12)
 * @description Real calendar months (not zero-indexed like JavaScript's Date.getMonth())
 */
export type MonthNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12; // Real calendar month
