<script lang="ts">
	import {
		generateCalendarMonth,
		getMonthName,
		getDaysOfWeek,
		type DayOfWeek,
		type MonthNumber,
		type DailyHealthRecord
	} from '$lib/components/calendar/calendarHelper';
	import { formatISO } from 'date-fns';

	let {
		year = new Date().getFullYear(),
		month = new Date().getMonth() + 1, // Corrects the return value of getMonth() to the calendar month(1-12)
		startDayOfWeek = 1, // Setting the start of Monday
		healthData = [],
		dateSelect,
		yearMonthChange,
		resetSelector
	} = $props<{
		year?: number;
		month?: number;
		startDayOfWeek?: DayOfWeek;
		healthData?: DailyHealthRecord[];
		dateSelect?: (event: { date: string }) => void;
		yearMonthChange?: (event: { year: number; month: number }) => void;
		resetSelector?: boolean;
	}>();

	let isYearMonthSelectorOpen = $state(false);

	// Back to initial state when resetSelector is true
	$effect(() => {
		if (resetSelector) {
			isYearMonthSelectorOpen = false;
		}
	});

	const weeks = $derived(generateCalendarMonth(year, month, startDayOfWeek));
	const daysOfWeek = getDaysOfWeek(startDayOfWeek);
	const monthName = $derived(getMonthName(month as MonthNumber));

	// Check if a date has health data
	function toggleYearMonthSelector() {
		isYearMonthSelectorOpen = !isYearMonthSelectorOpen;
	}

	// Handle year-month click event
	function changeYearMonth(yearDelta: number, monthDelta: number) {
		let newMonth = month + monthDelta;
		let newYear = year + yearDelta;

		if (newMonth > 12) {
			newMonth = 1;
			newYear++;
		} else if (newMonth < 1) {
			newMonth = 12;
			newYear--;
		}

		month = newMonth;
		year = newYear;

		// Notify parent component
		if (yearMonthChange) {
			yearMonthChange({ year: newYear, month: newMonth });
		}
	}

	// Check if a date has health data
	function hasHealthData(date: Date): boolean {
		const dateStr = formatISO(date, { representation: 'date' });
		return healthData.some((record: DailyHealthRecord) => record.date === dateStr);
	}

	// Handle day click event
	function handleDayClick(date: Date) {
		const formattedISO = formatISO(date, { representation: 'date' });
		dateSelect?.({ date: formattedISO });
	}
</script>

<div class="calendar-container">
	<div class="year-month-selector" role="group" aria-label="Year and month selection">
		{#if !isYearMonthSelectorOpen}
			<button onclick={() => changeYearMonth(0, -1)} aria-label="Previous month">
				<i class="left-arrow"></i>
			</button>
			<button onclick={() => toggleYearMonthSelector()} aria-expanded={isYearMonthSelectorOpen}>
				{monthName}
				{year}
			</button>
			<button onclick={() => changeYearMonth(0, 1)} aria-label="Next month">
				<i class="right-arrow"></i>
			</button>
		{:else}
			<button onclick={() => changeYearMonth(-1, 0)} aria-label="Previous year">
				<i class="left-arrow"></i>
			</button>
			<button onclick={() => toggleYearMonthSelector()} aria-expanded={isYearMonthSelectorOpen}>
				{year}
			</button>
			<button onclick={() => changeYearMonth(1, 0)} aria-label="Next year">
				<i class="right-arrow"></i>
			</button>
		{/if}
	</div>
	<div class="calendar" role="grid" aria-labelledby="current-month-year">
		<div class="days-of-week" role="row">
			{#each daysOfWeek as day, index (index)}
				<div class="day-header" role="columnheader">{day}</div>
			{/each}
		</div>
		{#each weeks as week, weekIndex (weekIndex)}
			<div class="week" role="row">
				{#each week as day (day.date.toISOString())}
					<div
						class="day"
						class:current-month={day.isCurrentMonth}
						class:today={day.isToday}
						class:has-health-data={hasHealthData(day.date)}
						role="gridcell"
						aria-label={`${day.date.getDate()} ${getMonthName(day.date.getMonth() + 1)}, ${day.date.getFullYear()}`}
						onclick={() => handleDayClick(day.date)}
						tabindex="0"
						onkeydown={(e) => e.key === 'Enter' && handleDayClick(day.date)}
					>
						{day.date.getDate()}
						{#if hasHealthData(day.date)}
							<span class="health-indicator"></span>
						{/if}
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	:root {
		--calendar-bg1: #fcfcfc;
		--calendar-bg2: #e0e0e0;
		--calendar-not-current: #f8f8f8;
		--hover: #ffcee3;
		--font-base: #333;
		--weight-base: 300;
		--weight-bold: 500;
	}

	.calendar-container {
		width: 100%;
		max-width: 480px;
		margin: 0 auto;
		font-family: SUSE, sans-serif;
		font-size: 1rem;
		font-weight: var(--weight-base);
		color: var(--font-base);
	}

	.year-month-selector {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		background-color: var(--calendar-bg1);
	}

	.year-month-selector button {
		padding: 0.75em;
		font-family: SUSE, sans-serif;
		font-size: 1.1em;
		font-weight: var(--weight-bold);
		color: var(--font-base);
		cursor: pointer;
		background: none;
		border: none;
		transition: background-color 0.3s ease;
	}

	.year-month-selector button:hover {
		background-color: var(--hover);
	}

	.calendar {
		display: grid;
		grid-template-rows: auto repeat(6, 1fr);
		row-gap: 1px;
		background-color: var(--calendar-bg2);
		border: 1px solid var(--calendar-bg2);
	}

	.days-of-week {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		background-color: var(--calendar-bg1);
	}

	.day-header {
		padding: 0.5em;
		font-size: 0.8em;
		text-align: center;
	}

	.week {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		column-gap: 1px;
	}

	.day {
		padding: 0.7em;
		text-align: center;
		background-color: white;
		transition: background-color 0.3s ease;
	}

	.day:not(.current-month) {
		color: #ccc;
		background-color: var(--calendar-not-current);
	}

	.day.today {
		font-weight: var(--weight-bold);
		color: #007bff;
		background-color: #e6f2ff;
	}

	.day:hover {
		cursor: pointer;
		background-color: var(--hover);
	}

	.has-health-data {
		position: relative;
	}

	.health-indicator {
		position: absolute;
		bottom: 3px;
		left: 50%;
		transform: translateX(-50%);
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background-color: #007bff;
	}

	i {
		display: inline-block;
		width: 0.75em;
		height: 0.75em;
		border-color: var(--font-base);
		border-style: solid;
		border-width: 0;
		border-right-width: 1px;
		border-bottom-width: 1px;
		transform-origin: center center;
	}

	.left-arrow {
		transform: translate(6px) rotate(135deg);
	}

	.right-arrow {
		transform: translate(-6px) rotate(-45deg);
	}
</style>
