<script lang="ts">
	import { visualizationStrategies } from '../strategies';
	import { getSelectedStrategyKey, selectStrategy } from '../stores/visualizationStore.svelte';

	// Get an array of available strategies
	const strategies = Object.entries(visualizationStrategies).map(([key, strategy]) => ({
		key,
		...strategy
	}));
</script>

<div class="visualization-selector">
	<h3>Select a visualization method</h3>

	<div class="strategy-cards">
		{#each strategies as strategy (strategy.key)}
			<button
				class="strategy-card"
				class:selected={getSelectedStrategyKey() === strategy.key}
				onclick={() => selectStrategy(strategy.key)}
			>
				{#if strategy.thumbnail}
					<img src={strategy.thumbnail} alt={strategy.name} class="thumbnail" />
				{:else}
					<div class="placeholder-thumbnail"></div>
				{/if}

				<div class="strategy-info">
					<h4>{strategy.name}</h4>
					<p>{strategy.description}</p>
				</div>
			</button>
		{/each}
	</div>
</div>

<style>
	.visualization-selector {
		margin: 2rem 1.5rem;
		padding: 1rem;
	}

	h3 {
		font-weight: 400;
	}

	.strategy-cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
		margin-top: 1rem;
	}

	.strategy-card {
		display: flex;
		flex-direction: column;
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid #e0e0e0;
		background: white;
		cursor: pointer;
		transition: all 0.3s ease;
		text-align: left;
	}

	.strategy-card.selected {
		border-color: #007bff;
		box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
	}

	.strategy-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
	}

	.thumbnail,
	.placeholder-thumbnail {
		width: 100%;
		height: 120px;
		border-radius: 4px;
		margin-bottom: 0.5rem;
		background: #f0f0f0;
		object-fit: cover;
	}

	.strategy-info h4 {
		margin: 0 0 0.5rem;
		font-size: 1.1rem;
		font-weight: 600;
	}

	.strategy-info p {
		margin: 0;
		font-size: 0.9rem;
		color: #666;
	}
</style>
