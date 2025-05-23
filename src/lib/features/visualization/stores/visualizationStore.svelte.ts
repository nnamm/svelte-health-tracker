import { defaultStrategyKey, visualizationStrategies } from '../strategies/';
import type { VisualizationOptions, VisualizationStrategy } from '../strategies/types';

/**
 * Selected visualization strategy key, initialized from sessionStorage or default key
 */
let selectedStrategyKey: string = $state(
	typeof sessionStorage !== 'undefined'
		? sessionStorage.getItem('selectedVisualizationStrategy') || defaultStrategyKey
		: defaultStrategyKey
);

/**
 * Visualization options for the current strategy, loaded from sessionStorage
 */
let visualizationOptions = $state<VisualizationOptions>(
	typeof sessionStorage !== 'undefined'
		? JSON.parse(sessionStorage.getItem('visualizationOptions') || '{}')
		: {}
);

/**
 * Sets the loading state for visualization operations
 * @param loading - The new loading state
 */

/**
 * Selects a new visualization strategy by key
 * @param key - The key of the visualization strategy to select
 */
export function selectStrategy(key: string): void {
	if (visualizationStrategies[key]) {
		selectedStrategyKey = key;
		if (typeof sessionStorage !== 'undefined') {
			sessionStorage.setItem('selectedVisualizationStrategy', key);
		}
	}
}

/**
 * Updates the visualization options and saves to sessionStorage
 * @param options - New options to merge with existing ones
 */
export function updateOptions(options: Partial<VisualizationOptions>): void {
	visualizationOptions = { ...visualizationOptions, ...options };
	if (typeof sessionStorage !== 'undefined') {
		sessionStorage.setItem('visualizationOptions', JSON.stringify(visualizationOptions));
	}
}

/**
 * Derived value for the current strategy based on selectedStrategyKey
 */
const currentStrategy = $derived(
	visualizationStrategies[selectedStrategyKey] || visualizationStrategies[defaultStrategyKey]
);

// Getters for accessing reactive state
export function getSelectedStrategyKey(): string {
	return selectedStrategyKey;
}
export function getVisualizationOptions(): VisualizationOptions {
	return visualizationOptions;
}
export function getCurrentStrategy(): VisualizationStrategy {
	return currentStrategy;
}
