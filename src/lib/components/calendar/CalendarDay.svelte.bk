<script lang="ts">
  export let date: Date;
  export let isCurrentMonth: boolean;
  export let isToday: boolean;

  const dayNumber = date.getDate();
</script>

<div class="calendar-day" class:current-month={isCurrentMonth} class:today={isToday}>
  {dayNumber}
</div>

<style>
  .calendar-day {
    padding: 0.5rem;
    text-align: center;
    cursor: pointer;
  }
  .current-month {
    color: black;
  }
  .today {
    font-weight: bold;
    background-color: #e0e0e0;
  }
</style>
