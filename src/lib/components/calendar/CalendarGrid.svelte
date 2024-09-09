<script lang="ts">
	import {
		generateCalendarMonth,
		getDaysOfWeek,
		type DayOfWeek
	} from '$lib/components/calendar/calendarHelper';

	export let year: number = new Date().getFullYear();
	export let month: number = new Date().getMonth() + 1;
	export let startDayOfWeek: DayOfWeek = 1;

	$: weeks = generateCalendarMonth(year, month, startDayOfWeek);
	$: daysOfWeek = getDaysOfWeek(startDayOfWeek);
</script>

<div class="yearmonth">{month} {year}</div>
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

<style>
	.yearmonth {
		text-align: center;
		font-weight: bold;
		padding: 0.75rem;
		background-color: #fcfcfc;
	}
	.calendar {
		display: grid;
		grid-template-rows: auto repeat(6, 1fr);
		gap: 1px;
		background-color: #e0e0e0;
	}
	.days-of-week {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
	}
	.day-header {
		text-align: center;
		font-weight: bold;
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
	.current-month {
		background-color: white;
	}
	.today {
		font-weight: bold;
		color: red;
	}
</style>
