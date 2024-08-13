<script lang="ts">
  import { Datepicker } from 'svelte-calendar';
  import { goto } from '$app/navigation';

  let selected: Date;

  function handleSelect(event: CustomEvent<Date>) {
    const date = event.detail.toISOString().split('T')[0];
    goto(`/health/${date}`);
  }
</script>

<Datepicker bind:selected on:select={handleSelect} />/
