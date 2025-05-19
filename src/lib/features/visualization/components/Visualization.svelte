<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { currentStrategy, visualizationOptions } from '../stores/visualizationStore';
	import type { VisualizationInstance } from '../strategies/types';
	import type { HealthRecord } from '$lib/types/HealthRecord';

	// Health data property
	const { healthRecord } = $props<{
		healthRecord: HealthRecord | null;
	}>();

	// Container and visualization instance state
	let container = $state<HTMLElement | null>(null);
	let visualization = $state<VisualizationInstance | null>(null);

	// Initializa or update visualization
	function initOrUpdateVisualization(): void {
		if (!container || !healthRecord) return;

		const stepCount = healthRecord.step_count;

		if (visualization) {
			// Update existing visualization
			visualization.update(stepCount);
		} else {
			// Create new visualization
			visualization = $currentStrategy.create(container, stepCount, $visualizationOptions);
		}
	}

	// Clearnup function
	function cleanupVisualization(): void {
		if (visualization) {
			visualization.destroy();
			visualization = null;
		}
	}

	// Reinitialize if strategy is changed
	$effect(() => {
		cleanupVisualization();
		initOrUpdateVisualization();
	});

	// Update when health data changes
	$effect(() => {
		if (healthRecord && visualization) {
			visualization.update(healthRecord.step_count);
		}
	});

	// Initialize when component is mounted
	onMount(() => {
		initOrUpdateVisualization();
	});

	// Cleanup when component is removed
	onDestroy(() => {
		cleanupVisualization();
	});
</script>

<div class="visualization-container" bind:this={container}>
	{#if !healthRecord}
		<div class="no-data-message">No data selected. Please select a date from calendar.</div>
	{/if}
</div>

<style>
	.visualization-container {
		width: 100%;
		height: 500px;
		position: relative;
		background: #f5f5f5;
		border-radius: 8px;
		overflow: hidden;
	}

	.no-data-message {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
		color: #888;
		font-style: italic;
	}
</style>
