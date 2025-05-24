<script lang="ts">
	import { onMount } from 'svelte';
	import { getHealthRecordByDate } from '$lib/features/health/services/healthDataService';
	import Visualization from '$lib/features/visualization/components/Visualization.svelte';
	import VisualizationSelector from '$lib/features/visualization/components/VisualizationSelector.svelte';
	import { DateUtils } from '$lib/utils/dateUtils';
	import type { HealthRecord } from '$lib/types/HealthRecord';

	// Correct way to recieve data from load function
	let { data } = $props<{
		data: {
			date: string;
			meta: {
				title: string;
				description: string;
			};
		};
	}>();

	// Extract date from the data object returned by load function
	const date = $derived(data.date);
	const pageTitle = $derived(data.meta.title);
	const pageDiscription = $derived(data.meta.description);

	// Define states
	let healthRecord = $state<HealthRecord | null>(null);
	let isLoading = $state(false);
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
				// Differentiate between "no data" and actual errors
				if (response.error?.includes('not found')) {
					healthRecord = null; // No data exists for this date
				} else {
					error = response.error || 'Failed to load health data';
					healthRecord = null;
				}
			}
		} catch (err) {
			console.error('Error retrieving health data: ', err);
			error = 'An unexpected error occurred while loading health data';
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
	<title>{pageTitle}</title>
	<meta name="description" content={pageDiscription} />
</svelte:head>

<div class="health-visualization-page">
	<header>
		<h1>Health Data Visualization</h1>
		<p class="date">
			{date ? DateUtils.formatForDisplay(date) : ''}
		</p>
	</header>

	{#if isLoading}
		<div class="loading-indicator">
			<div class="spinner"></div>
			<p>Loading health data...</p>
		</div>
	{:else if error}
		<div class="error-message">
			<h3>Error</h3>
			<p>{error}</p>
			<button onclick={() => loadHealthData()} class="retry-button"> Retry </button>
		</div>
	{:else}
		<div class="visualization-section">
			<Visualization {healthRecord} />

			{#if healthRecord}
				<div class="data-summary">
					<p class="step-count">
						<span class="label">Step count: </span>
						<span class="value">{healthRecord.step_count.toLocaleString()}</span>
					</p>
					<p class="recorded-at">
						<span class="label">Date recorded: </span>
						<span class="value">{new Date(healthRecord.created_at).toLocaleString('ja-JP')}</span>
					</p>
				</div>
			{:else}
				<div class="no-data-message">
					<h3>No health data found</h3>
					<p>No health data has been recorded for {date}. Would you like to add some data?</p>
					<a href="/#" class="back-link">← Back to Calendar</a>
				</div>
			{/if}
		</div>

		<VisualizationSelector />
	{/if}
</div>

<style>
	.health-visualization-page {
		width: 100%;
		padding: 2rem 0;
		margin: 0 auto;
	}

	header {
		margin-bottom: 2rem;
		text-align: center;
	}

	h1 {
		margin-bottom: 0.75rem;
		font-size: 2rem;
		font-weight: 500;
	}

	h3 {
		font-weight: 400;
	}

	.date {
		margin: 0;
		font-size: 1.2rem;
		color: #666;
	}

	.loading-indicator,
	.error-message,
	.no-data-message {
		padding: 2rem;
		margin-bottom: 2rem;
		text-align: center;
		background: #f9f9f9;
		border-radius: 8px;
	}

	.error-message {
		color: #d32f2f;
		background: #ffebee;
	}

	.no-data-message {
		background: #e3f2fd;
	}

	.spinner {
		display: inline-block;
		width: 40px;
		height: 40px;
		margin: 0 auto 1rem;
		border: 4px solid rgb(0 123 255 / 20%);
		border-top-color: #007bff;
		border-radius: 50%;
		animation: spin 1s ease-in-out infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.retry-button,
	.back-link {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		margin-top: 1rem;
		color: white;
		text-decoration: none;
		cursor: pointer;
		background: #007bff;
		border: none;
		border-radius: 4px;
		transition: background 0.2s ease;
	}

	.retry-button:hover,
	.back-link:hover {
		background: #0056b3;
	}

	.visualization-section {
		position: relative;
	}

	.data-summary {
		padding: 1rem 1.5rem;
		margin: 2rem;
		background: #f5f5f5;
		border-radius: 8px;
	}

	.recorded-at {
		margin-top: 1rem;
	}

	.label {
		font-weight: 400;
		color: #555;
	}

	.value {
		font-size: 1.1rem;
		font-weight: 200;
	}

	.step-count .value {
		font-size: 1.2rem;
		font-weight: 500;
		color: #007bff;
	}
</style>
