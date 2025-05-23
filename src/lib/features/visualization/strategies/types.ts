/**
 * Interface for a visualization strategy
 * Defines the structure for creating and managing different visualization types
 */
export interface VisualizationStrategy {
	// Display name of the visualization strategy
	name: string;
	// Description of what the visualization does and how it works
	description: string;
	// Optional URL or path to a thumbnail image representing this visualization
	thumbnail?: string;
	/**
	 * Factory method to create a new visualization instance
	 * @param {HTMLElement} container - DOM element where the visualization will be rendered
	 * @param {number} stepCount - Number of steps/iterations to visualize
	 * @param {VisualizationOptions} option - Optional configuration for the visualization
	 * @returns {VisualizationInstance} A new visualization instance
	 */
	create: (
		container: HTMLElement,
		stepCount: number,
		option?: VisualizationOptions
	) => VisualizationInstance;
}

/**
 * Configuration options for visualizations
 * Controls appearance, behavior and performance of visualizations
 */
export interface VisualizationOptions {
	// Display options
	// Width of the visualization in pixels
	width?: number;
	// Height of the visualization in pixels
	height?: number;
	// Background color as CSS color string or 'transparent'
	backgroundColor?: string;

	// Animation options
	// Speed multiplier for animations (1.0 is normal speed)
	animationSpeed?: number;
	// Whether animation should start automatically
	autoPlay?: boolean;

	// Rendering options
	// Quality level for rendering, affects performance vs. visual fidelity
	quality?: 'low' | 'medium' | 'high';

	// Other custom options
	// [key: string]: any;
}

/**
 * Interface for a visualization instance
 * Provides methods to control and interact with a created visualization
 */
export interface VisualizationInstance {
	// Basic functions
	// Renders a single frame of the visualization
	render: () => void;
	//Cleans up and removes the visualization from the DOM
	destroy: () => void;

	// // Animation contorol
	// // Starts or resumes the animation
	// start?: () => void;
	// // Pauses the animation
	// stop?: () => void;

	// // Utility functions
	// /**
	//  * Resizes the visualization to new dimensions
	//  * @param {number} width - New width in pixels
	//  * @param {number} height - New height in pixels
	//  */
	// resize?: (width: number, height: number) => void;
	// /**
	//  * Checks if the visualization is currently animating
	//  * @returns {boolean} True if animation is running, false otherwise
	//  */
	// isAnimating?: () => boolean;
}
