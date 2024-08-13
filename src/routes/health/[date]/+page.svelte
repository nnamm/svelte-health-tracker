<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { api } from '$lib/api';
  import HealthRecordForm from '$lib/components/HealthRecordForm.svelte';
  import type { HealthRecord } from '$lib/types/HealthRecord';

  let healthRecord: Partial<HealthRecord> = {};
  let date: string;

  onMount(async () => {
    date = $page.params.date;
    try {
      healthRecord = await api.getHealthRecord(date);
    } catch (error) {
      console.error('Error fetching health record', error);
    }
  });

  async function handleSave(event: CustomEvent<HealthRecord>) {
    try {
      if (healthRecord.id) {
        await api.updateHealthRecord(event.detail);
      } else {
        await api.createHealthRecord(event.detail);
      }
      alert('Health record saved successfully!');
    } catch (error) {
      console.error('Error saving health record', error);
      alert('Failed to save health record');
    }
  }

  async function handleDelete() {
    if (confirm('Are you sure you want to delete this health record?')) {
      try {
        await api.deleteHealthRecord(date);
        healthRecord = {};
        alert('Health record deleted successfully!');
      } catch (error) {
        console.error('Error deleting health record', error);
        alert('Failed to delete health record');
      }
    }
  }
</script>

<h1>Health Record fo {date}</h1>
<HealthRecordForm {healthRecord} {date} on:save={handleSave} on:delete={handleDelete} />
<a href="/">Back to Calendar</a>
