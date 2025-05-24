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
		const regex = /^\d{4}-\d{2}-\d{2}$/;
		return regex.test(dateString) && !isNaN(Date.parse(dateString));
	}
}
