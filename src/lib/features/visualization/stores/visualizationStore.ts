/**
 * Store for managing visualization strategy and options
 * Provides state management and persistence for visualization settings
 */
// import { defaultStrategyKey, visualizationStrategies } from '../strategies';
// import type { VisualizationOptions } from '../strategies/types';
//
// // State that manages the selection of visualization strategy
// export let selectedStrategyKey = $state<string>(
// 	localStorage.getItem('selectedVisualizationStrategy') || defaultStrategyKey
// );
//
// // State that maneges additional configuration options
// export let visualizationOptions = $state<VisualizationOptions>(
// 	JSON.parse(localStorage.getItem('visualizationOptions') || '{}')
// );
//
// /**
//  * Updates the selected visualization strategy
//  * @param {string} key - The key of the strategy to select
//  */
// export function selectStrategy(key: string): void {
// 	if (visualizationStrategies[key]) {
// 		selectedStrategyKey = key;
// 		localStorage.setItem('selectedVisualizationStrategy', key);
// 	}
// }
//
// /**
//  * Updates visualization options by merging with existing options
//  * @param {Partial<VisualizationOptions>} options - The options to update
//  */
// export function updateOptions(options: Partial<VisualizationOptions>): void {
// 	visualizationOptions = { ...visualizationOptions, ...options };
// 	localStorage.setItem('visualizationOptions', JSON.stringify(visualizationOptions));
// }
//
// // aDerived state to get the currently selected strategy
// export const currentStrategy = $derived(
// 	visualizationStrategies[selectedStrategyKey] || visualizationStrategies[defaultStrategyKey]
// );

import { writable, derived } from 'svelte/store';
import { defaultStrategyKey, visualizationStrategies } from '../strategies';
import type { VisualizationOptions } from '../strategies/types';

// ブラウザ環境でのみ localStorage にアクセス
const getLocalStorage = <T>(key: string, defaultValue: T): T => {
	if (typeof window === 'undefined') return defaultValue;
	const stored = localStorage.getItem(key);
	return stored !== null ? (key.includes('Options') ? JSON.parse(stored) as T : stored as T) : defaultValue;
};

// writable ストアを作成
export const selectedStrategyKey = writable<string>(
	getLocalStorage('selectedVisualizationStrategy', defaultStrategyKey)
);

export const visualizationOptions = writable<VisualizationOptions>(
	getLocalStorage('visualizationOptions', {}) as VisualizationOptions
);

// 選択されたストラテジーを更新する関数
export function selectStrategy(key: string): void {
	if (visualizationStrategies[key]) {
		selectedStrategyKey.set(key);
		if (typeof window !== 'undefined') {
			localStorage.setItem('selectedVisualizationStrategy', key);
		}
	}
}

// オプションを更新する関数
export function updateOptions(options: Partial<VisualizationOptions>): void {
	visualizationOptions.update((current) => {
		const updated = { ...current, ...options };
		if (typeof window !== 'undefined') {
			localStorage.setItem('visualizationOptions', JSON.stringify(updated));
		}
		return updated;
	});
}

// derived ストアで現在のストラテジーを取得
export const currentStrategy = derived(
	selectedStrategyKey,
	($key) => visualizationStrategies[$key] || visualizationStrategies[defaultStrategyKey]
);
