<script lang="ts">
	import {
		generateCalendarMonth,
		getMonthName,
		getDaysOfWeek,
		type DayOfWeek,
		type MonthNumber
	} from '$lib/components/calendar/calendarHelper';

	export let year: number = new Date().getFullYear();
	export let month: number = new Date().getMonth() + 1;
	export let startDayOfWeek: DayOfWeek = 1; // Monday start

	$: weeks = generateCalendarMonth(year, month, startDayOfWeek);
	$: daysOfWeek = getDaysOfWeek(startDayOfWeek);
	$: monthName = getMonthName(month as MonthNumber);

	function changeMonth(delta: number) {
		let newMonth = month + delta;
		let newYear = year;

		if (newMonth > 12) {
			newMonth = 1;
			newYear++;
		} else if (newMonth < 1) {
			newMonth = 12;
			newYear--;
		}

		month = newMonth;
		year = newYear;
	}
</script>

<div class="calendar-container">
	<div class="yearmonth">
		<button on:click={() => changeMonth(-1)}>&lt;</button>
		<span>{monthName} {year}</span>
		<button on:click={() => changeMonth(1)}>&gt;</button>
	</div>
	<div class="calendar">
		<div class="days-of-week">
			{#each daysOfWeek as day}
				<div class="day-header">{day}</div>
			{/each}
		</div>
		{#each weeks as week}
			<div class="week">
				{#each week as day}
					<div class="day" class:current-month={day.isCurrentMonth} class:today={day.isToday}>
						{day.date.getDate()}
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.calendar-container {
		width: 100%;
		max-width: 600px;
		margin: 0 auto;
	}
	.yearmonth {
		display: flex;
		justify-content: space-between;
		align-items: center;
		text-align: center;
		font-weight: bold;
		padding: 0.75rem;
		background-color: #fcfcfc;
	}
	.yearmonth button {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
	}
	.calendar {
		display: grid;
		grid-template-rows: auto repeat(6, 1fr);
		gap: 1px;
		background-color: #f0f0f0;
	}
	.days-of-week {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
	}
	.day-header {
		text-align: center;
		font-weight: normal;
		font-size: 0.8rem;
		padding: 0.5rem;
		background-color: #f0f0f0;
	}
	.week {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
	}
	.day {
		padding: 0.5rem;
		text-align: center;
	}
	.day:not(.current-month) {
		opacity: 0.6;
		color: #999;
	}
	.current-month {
		background-color: white;
	}
	.today {
		font-weight: bold;
		color: red;
	}
</style>
