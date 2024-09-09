<script lang="ts">
  import CalendarDay from './CalendarDay.svelte';

  export let year: number;
  export let month: number;
  export let startDayOfWeek: number = 0; // 0: Sunday, 1: Monday, etc.

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  $: sortedDayOfWeek = [...daysOfWeek.slice(startDayOfWeek), ...daysOfWeek.slice(0, startDayOfWeek)];

  function generateCalendarDays(year: number, month: number): Date[] {
    const firstDay = 1;
    const lastDay = new Date(year, month, 0);
    const days: Date[] = [];

    for (let d = firstDay; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month - 1));
    }

    return days;
  }

  $: calendarDays = generateCalendarDays(year, month);
  $: today = new Date();
</script>

<div class="calendar-grid">
  {#each sortedDayOfWeek as day}
    <div class="day-header">{day}</div>
  {/each}
  {#each calendarDays as day}
    <CalendarDay date={day} isCurrentMonth={true} isToday={day.toDateString() === today.toDateString()} />
  {/each}
</div>

<style>
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    background-color: #e0e0e0;
  }
  .day-header {
    padding: 0.5rem;
    text-align: center;
    font-weight: bold;
    background-color: #f0f0f0;
  }
</style>
