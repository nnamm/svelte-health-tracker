<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		getCurrentStrategy,
		getVisualizationOptions,
		getSelectedStrategyKey
	} from '../stores/visualizationStore.svelte';
	import type { VisualizationInstance } from '../strategies/types';
	import type { HealthRecord } from '$lib/types/HealthRecord';

	// Health data property
	const { healthRecord } = $props<{
		healthRecord: HealthRecord | null;
	}>();

	// Container and visualization instance state
	let container = $state<HTMLElement | null>(null);
	let visualization = $state<VisualizationInstance | null>(null);
	// let isLibraryLoaded = $state(false);
	let currentStrategyKey = $state<string | null>(getSelectedStrategyKey());

	// Initializa visualization
	async function initVisualization(): Promise<void> {
		if (!container || !healthRecord) return;

		// Load health data
		const stepCount = healthRecord.step_count;

		// Create new visualization
		cleanupVisualization();
		visualization = getCurrentStrategy().create(container, stepCount, getVisualizationOptions());
		// }
	}

	// Clearnup function
	function cleanupVisualization(): void {
		if (visualization) {
			visualization.destroy();
			visualization = null;
		}
	}

	$effect(() => {
		const newStrategyKey = getSelectedStrategyKey();

		if (currentStrategyKey !== newStrategyKey) {
			console.log('Strategy changed, reinitializing visualization');
			currentStrategyKey = newStrategyKey;

			if (container && healthRecord) {
				cleanupVisualization();
				visualization = getCurrentStrategy().create(
					container,
					healthRecord.step_count,
					getVisualizationOptions()
				);
			}
		}
	});

	onMount(() => {
		initVisualization();
	});

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
		height: 600px;
		position: relative;
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
