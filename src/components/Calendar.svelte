<script>
  import { Calendar } from 'svelte-calendar';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let selected;

  function handleSelect(event) {
    selected = event.detail.date;
    dispatch('dateSelect', { date: selected });
  }
</script>

<div>
  <Calendar
    bind:selected
    on:select={handleSelect}
    />
</div>

<style>
  div {
      width: 300px;
  }
</style>