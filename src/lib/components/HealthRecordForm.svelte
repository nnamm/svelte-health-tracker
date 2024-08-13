<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { HealthRecord } from '$lib/types/HealthRecord';

  export let healthRecord: Partial<HealthRecord> = {};
  export let date: string;

  const dispatch = createEventDispatcher();

  function handleSubmit() {
    dispatch('save', { ...healthRecord, date });
  }

  function handleDelete() {
    dispatch('delete', date);
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <label>
    Step Count:
    <input type="number" bind:value={healthRecord.step_count} required />
  </label>
  <button type="submit">Save</button>
  {#if healthRecord.id}
    <button type="button" on:click={handleDelete}>Delete</button>
  {/if}
</form>
