<script lang="ts">
	import { onMount } from 'svelte';
	import { getHealthRecordByDate } from '$lib/features/health/services/healthDataService';
	import Visualization from '$lib/features/visualization/components/Visualization.svelte';
	import VisualizationSelector from '$lib/features/visualization/components/VisualizationSelector.svelte';
	import type { HealthRecord } from '$lib/types/HealthRecord';

	// Get date from page parameters
	let { data } = $props<{ date: string }>();
	const date = $derived(data.date);

	// Define states
	let healthRecord = $state<HealthRecord | null>(null);
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	// Load health data
	async function loadHealthData() {
		if (!date) return;

		isLoading = true;
		error = null;

		try {
			const response = await getHealthRecordByDate(date);

			if (response.success && response.data) {
				healthRecord = response.data;
			} else {
				error = response.error || 'Health data not found';
				healthRecord = null;
			}
		} catch (err) {
			console.error('Error retrieving health data: ', err);
			error = 'An error occurred while loading health data';
			healthRecord = null;
		} finally {
			isLoading = false;
		}
	}

	// Reload when date changes
	$effect(() => {
		if (date) {
			loadHealthData();
		}
	});

	// Initial load on component mount
	onMount(() => {
		loadHealthData();
	});
</script>

<svelte:head>
	<title>Health Data Visualization - {date || 'Loading...'}</title>
</svelte:head>

<div class="health-visualization-page">
  <header>
    <h1>Health Data Visualization</h1>
    <p class="date">{date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</p>
  </header>
  
  {#if isLoading}
    <div class="loading-indicator">Loading data...</div>
  {:else if error}
    <div class="error-message">{error}</div>
  {:else}
    <div class="visualization-section">
      <Visualization {healthRecord} />
      
      {#if healthRecord}
        <div class="data-summary">
					<h2>Health Data</h2>
					<p class="step-count">
						<span class="label">Step count: </span>
						<span class="value">{healthRecord.step_count.toLocaleString()}</span> steps
					</p>
					<p class="recorded-at">
						<span class="label">Date recorded: </span>
						<span class="value">{new Date(healthRecord.created_at).toLocaleString('ja-JP')}</span>
					</p>
				</div>
      {/if}
    </div>
    
    <VisualizationSelector />
  {/if}
</div>

<style>
	.health-visualization-page {
		max-width: 1000px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	header {
		margin-bottom: 2rem;
		text-align: center;
	}

	h1 {
		margin: 0 0 0.5rem;
	}

	.date {
		color: #666;
		font-size: 1.2rem;
		margin: 0;
	}

	.loading-indicator,
	.error-message {
		text-align: center;
		padding: 2rem;
		background: #f9f9f9;
		border-radius: 8px;
	}

	.error-message {
		color: #d32f2f;
		background: #ffebee;
	}

	.visualization-section {
		margin-bottom: 2rem;
	}

	.data-summary {
		margin-top: 1.5rem;
		padding: 1rem 1.5rem;
		background: #f5f5f5;
		border-radius: 8px;
	}

	.data-summary h2 {
		margin-top: 0;
		font-size: 1.4rem;
	}

	.label {
		font-weight: bold;
		color: #555;
	}

	.value {
		font-size: 1.1rem;
	}

	.step-count .value {
		color: #007bff;
		font-weight: bold;
		font-size: 1.4rem;
	}
</style>
