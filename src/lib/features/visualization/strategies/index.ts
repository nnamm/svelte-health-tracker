/**
 * Visualization strategies module
 * Exports available visualization strategies and default strategy configuration
 */
import { fractalStrategy } from './fractalStrategy';
import type { VisualizationStrategy } from './types';

// Registry of all available visualization strategies
export const visualizationStrategies: Record<string, VisualizationStrategy> = {
	fractal: fractalStrategy
};

// Default strategy key to use when no strategy is selected
export const defaultStrategyKey = 'fractal';
