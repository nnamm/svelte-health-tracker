import { addDays, startOfWeek, startOfMonth, isSameMonth, isSameDay, type Month } from 'date-fns';

export interface CalendarDay {
	date: Date;
	isCurrentMonth: boolean;
	isToday: boolean;
}

export type Week = CalendarDay[];
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type MonthNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

function generateCalendarMonthImpl(
	year: number,
	month: number,
	startDayOfWeek: DayOfWeek = 0
): Week[] {
	const weeks: Week[] = [];
	const firstDayOfMonth = startOfMonth(new Date(year, month - 1));
	const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: startDayOfWeek });
	const today = new Date();

	let currentDate = startDate;

	// Always generete 6 weeks
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

export const generateCalendarMonth = (() => {
	const cache = new Map<string, Week[]>();
	return (year: number, month: number, startDayOfWeek: DayOfWeek = 0): Week[] => {
		const key = `${year}-${month}-${startDayOfWeek}`;
		if (!cache.has(key)) {
			cache.set(key, generateCalendarMonthImpl(year, month, startDayOfWeek));
		}
		return cache.get(key)!;
	};
})();

export function getMonthName(month: MonthNumber): string {
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
	return monthNames[month - 1];
}

export function getDaysOfWeek(startDayOfWeek: DayOfWeek): string[] {
	const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	return [...dayOfWeek.slice(startDayOfWeek), ...dayOfWeek.slice(0, startDayOfWeek)];
}
