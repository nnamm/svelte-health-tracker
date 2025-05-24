/**
 * Type definitions for health tracking data
 * @module types/HealthRecord
 */

/**
 * Represents a single health record entry containing step count data
 *
 * @interface HealthRecord
 * @property {number} id - Unique identifier for the health record
 * @property {string} date - The date of the record in ISO format (YYYY-MM-DD)
 * @property {number} step_count - Number of steps recorded for the day
 * @property {string} created_at - Timestamp when the record was created
 * @property {string} updated_at - Timestamp when the record was last updated
 */
export interface HealthRecord {
	id: number;
	date: string;
	step_count: number;
	created_at: string;
	updated_at: string;
}
