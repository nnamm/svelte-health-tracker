import {
	addDays,
	startOfWeek,
	endOfWeek,
	startOfMonth,
	endOfMonth,
	isSameMonth,
	isSameDay
} from 'date-fns';

export interface CalendarDay {
	date: Date;
	isCurrentMonth: boolean;
	isToday: boolean;
}

export type Week = CalendarDay[];
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function generateCalendarMonth(
	year: number,
	month: number,
	startDayOfWeek: DayOfWeek = 0
): Week[] {
	const weeks: Week[] = [];
	const firstDayOfMonth = startOfMonth(new Date(year, month - 1));
	const lastDayOfMonth = endOfMonth(firstDayOfMonth);
	const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: startDayOfWeek });
	const endDate = endOfWeek(lastDayOfMonth, { weekStartsOn: startDayOfWeek });
	const today = new Date();

	let currentDate = startDate;

	while (currentDate <= endDate) {
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

export function getDaysOfWeek(startDayOfWeek: DayOfWeek): string[] {
	const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	return [...dayOfWeek.slice(startDayOfWeek), ...dayOfWeek.slice(0, startDayOfWeek)];
}
