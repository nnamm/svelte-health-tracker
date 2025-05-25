/**
 * Visualization strategies module
 * Exports available visualization strategies and default strategy configuration
 */
import { p5CircleStrategy } from './p5CircleStrategy';
import { canvas2DStrategy } from './canvas2DStrategy';
import { fractalStrategy } from './fractalStrategy';
import type { VisualizationStrategy } from './types';

// Registry of all available visualization strategies
export const visualizationStrategies: Record<string, VisualizationStrategy> = {
	p5Circle: p5CircleStrategy,
	canvas2D: canvas2DStrategy,
	fractal: fractalStrategy
};

// Default strategy key to use when no strategy is selected
export const defaultStrategyKey = 'p5Circle';
