export interface CalendarDay {
	date: Date;
	isCurrentMonth: boolean;
	isToday: boolean;
}
export interface DailyHealthRecord {
	date: string;
	hasHealthData: boolean;
}

export type Week = CalendarDay[];
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type MonthNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12; // Real calendar month
