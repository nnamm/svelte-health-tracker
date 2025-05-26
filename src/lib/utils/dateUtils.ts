export class DateUtils {
	static formatForAPI(date: string): string {
		return date.replace(/-/g, '');
	}

	static formatForDisplay(date: string): string {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	static isValidDate(dateString: string): boolean {
		// First check format with regex
		const regex = /^\d{4}-\d{2}-\d{2}$/;
		if (!regex.test(dateString)) {
			return false;
		}

		// Parse the date parts
		const [year, month, day] = dateString.split('-').map(Number);

		// Create a date object and check if it matches the input
		const date = new Date(year, month - 1, day); // month is 0-indexed in Date constructor
		
		// Check if the date object represents the same date as the input
		return (
			date.getFullYear() === year &&
			date.getMonth() === month - 1 &&
			date.getDate() === day
		);
	}
}
