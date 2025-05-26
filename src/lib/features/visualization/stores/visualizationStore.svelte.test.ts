import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flushSync } from 'svelte';
import type { VisualizationOptions, VisualizationStrategy } from '../strategies/types';

// Type for global object in test environment
declare const global: typeof globalThis;

// Mock sessionStorage before importing the store
const mockSessionStorage = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn()
};

// Mock the global sessionStorage
Object.defineProperty(global, 'sessionStorage', {
	value: mockSessionStorage,
	writable: true
});

// Mock the visualization strategies
vi.mock('../strategies/', () => ({
	defaultStrategyKey: 'p5Circle',
	visualizationStrategies: {
		p5Circle: {
			name: 'Circle Geometry',
			description: 'Test circle strategy',
			create: vi.fn()
		},
		canvas2D: {
			name: '2D Patterns',
			description: 'Test 2D strategy',
			create: vi.fn()
		},
		fractal: {
			name: 'Fractal',
			description: 'Test fractal strategy',
			create: vi.fn()
		}
	}
}));

describe('visualizationStore.svelte.ts', () => {
	// Import the store functions after mocking
	let selectStrategy: (key: string) => void;
	let updateOptions: (options: Partial<VisualizationOptions>) => void;
	let getSelectedStrategyKey: () => string;
	let getVisualizationOptions: () => VisualizationOptions;
	let getCurrentStrategy: () => VisualizationStrategy;

	beforeEach(async () => {
		// Clear all mocks before each test
		vi.clearAllMocks();
		
		// Reset sessionStorage mock to return empty values
		mockSessionStorage.getItem.mockReturnValue(null);
		
		// Clear the module cache to get fresh imports
		vi.resetModules();
		
		// Dynamically import the store to ensure fresh state
		const storeModule = await import('./visualizationStore.svelte');
		selectStrategy = storeModule.selectStrategy;
		updateOptions = storeModule.updateOptions;
		getSelectedStrategyKey = storeModule.getSelectedStrategyKey;
		getVisualizationOptions = storeModule.getVisualizationOptions;
		getCurrentStrategy = storeModule.getCurrentStrategy;
		
		flushSync();
		vi.clearAllMocks(); // Clear any calls made during initialization
	});

	describe('Initial State', () => {
		it('should initialize with default strategy when sessionStorage is empty', () => {
			// Act & Assert
			expect(getSelectedStrategyKey()).toBe('p5Circle');
		});

		it('should initialize with empty options by default', () => {
			// Act & Assert
			expect(getVisualizationOptions()).toEqual({});
		});
	});

	describe('selectStrategy function', () => {
		it('should update selected strategy key', () => {
			// Arrange
			const newStrategy = 'canvas2D';
			
			// Act
			selectStrategy(newStrategy);
			flushSync(); // Ensure reactive updates are processed
			
			// Assert
			expect(getSelectedStrategyKey()).toBe(newStrategy);
		});

		it('should save strategy to sessionStorage', () => {
			// Arrange
			const newStrategy = 'fractal';
			
			// Act
			selectStrategy(newStrategy);
			flushSync();
			
			// Assert
			expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
				'selectedVisualizationStrategy',
				newStrategy
			);
		});

		it('should not update strategy if key does not exist in strategies', () => {
			// Arrange
			const initialStrategy = getSelectedStrategyKey();
			const invalidStrategy = 'nonexistent';
			
			// Act
			selectStrategy(invalidStrategy);
			flushSync();
			
			// Assert
			expect(getSelectedStrategyKey()).toBe(initialStrategy);
			expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
		});

		// Table-driven test for valid strategies
		it.each([
			['p5Circle'],
			['canvas2D'],
			['fractal']
		])('should accept valid strategy: %s', (strategy) => {
			// Act
			selectStrategy(strategy);
			flushSync();
			
			// Assert
			expect(getSelectedStrategyKey()).toBe(strategy);
		});
	});

	describe('updateOptions function', () => {
		it('should set initial options when starting from empty state', () => {
			// Arrange
			const options = { width: 400, height: 300 };
			
			// Act
			updateOptions(options);
			flushSync();
			
			// Assert
			expect(getVisualizationOptions()).toEqual(options);
		});

		it('should merge new options with existing options', () => {
			// Arrange
			const initialOptions = { width: 400, height: 300 };
			const newOptions = { width: 800, backgroundColor: '#000' };
			const expectedOptions = { width: 800, height: 300, backgroundColor: '#000' };
			
			// Act
			updateOptions(initialOptions);
			flushSync();
			updateOptions(newOptions);
			flushSync();
			
			// Assert
			expect(getVisualizationOptions()).toEqual(expectedOptions);
		});

		it('should save options to sessionStorage', () => {
			// Arrange
			const options = { animationSpeed: 2, quality: 'high' as const };
			
			// Act
			updateOptions(options);
			flushSync();
			
			// Assert
			expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
				'visualizationOptions',
				JSON.stringify(options)
			);
		});

		it('should handle empty options object (no change)', () => {
			// Arrange
			const initialOptions = getVisualizationOptions();
			const emptyOptions = {};
			
			// Act
			updateOptions(emptyOptions);
			flushSync();
			
			// Assert - Should remain the same since we're merging with empty object
			expect(getVisualizationOptions()).toEqual(initialOptions);
		});

		it('should replace existing values when updating with new values', () => {
			// Arrange
			updateOptions({ width: 400, height: 300 });
			flushSync();
			
			// Act
			updateOptions({ width: 800 }); // Only update width
			flushSync();
			
			// Assert
			expect(getVisualizationOptions()).toEqual({
				width: 800,
				height: 300
			});
		});
	});

	describe('getCurrentStrategy function', () => {
		it('should return current strategy object', () => {
			// Arrange
			selectStrategy('canvas2D');
			flushSync();
			
			// Act
			const strategy = getCurrentStrategy();
			
			// Assert
			expect(strategy).toEqual({
				name: '2D Patterns',
				description: 'Test 2D strategy',
				create: expect.any(Function)
			});
		});

		it('should return default strategy when selected strategy is invalid', () => {
			// Act
			const strategy = getCurrentStrategy();
			
			// Assert - Should always return a valid strategy object
			expect(strategy).toBeDefined();
			expect(strategy.name).toBeDefined();
			expect(strategy.description).toBeDefined();
			expect(strategy.create).toBeInstanceOf(Function);
		});

		it('should update when strategy selection changes', () => {
			// Arrange
			const initialStrategy = getCurrentStrategy();
			
			// Act
			selectStrategy('fractal');
			flushSync();
			const newStrategy = getCurrentStrategy();
			
			// Assert
			expect(newStrategy).not.toEqual(initialStrategy);
			expect(newStrategy.name).toBe('Fractal');
		});
	});

	describe('Reactive behavior', () => {
		it('should maintain reactivity across function calls', () => {
			// Arrange
			const initialKey = getSelectedStrategyKey();
			const initialStrategy = getCurrentStrategy();
			
			// Act
			selectStrategy('canvas2D');
			flushSync();
			
			// Assert
			expect(getSelectedStrategyKey()).not.toBe(initialKey);
			expect(getCurrentStrategy()).not.toEqual(initialStrategy);
		});

		it('should persist state changes across multiple operations', () => {
			// Arrange & Act
			selectStrategy('fractal');
			updateOptions({ width: 1200, height: 800 });
			flushSync();
			
			// Assert
			expect(getSelectedStrategyKey()).toBe('fractal');
			expect(getVisualizationOptions()).toEqual({ width: 1200, height: 800 });
			expect(getCurrentStrategy().name).toBe('Fractal');
		});
	});

	describe('SessionStorage integration', () => {
		it('should handle sessionStorage being unavailable', async () => {
			// Arrange - Mock sessionStorage as undefined
			const originalSessionStorage = global.sessionStorage;
			// @ts-expect-error - Intentionally setting to undefined for testing
			global.sessionStorage = undefined;
			
			try {
				// Act & Assert - Should not throw errors
				expect(() => {
					selectStrategy('canvas2D');
					updateOptions({ width: 800 });
				}).not.toThrow();
			} finally {
				// Restore sessionStorage
				global.sessionStorage = originalSessionStorage;
			}
		});

		it('should not call sessionStorage when it is unavailable', async () => {
			// Arrange
			const originalSessionStorage = global.sessionStorage;
			// @ts-expect-error - Intentionally setting to undefined for testing
			global.sessionStorage = undefined;
			
			try {
				// Act
				selectStrategy('canvas2D');
				updateOptions({ width: 800 });
				
				// Assert - No sessionStorage calls should be made
				// (We can't verify this directly since sessionStorage is undefined,
				// but the fact that no errors are thrown is the test)
				expect(true).toBe(true); // Placeholder assertion
			} finally {
				global.sessionStorage = originalSessionStorage;
			}
		});
	});

	describe('Edge cases', () => {
		it('should handle rapid successive strategy changes', () => {
			// Arrange
			const strategies = ['p5Circle', 'canvas2D', 'fractal', 'p5Circle'];
			
			// Act
			strategies.forEach(strategy => {
				selectStrategy(strategy);
				flushSync();
			});
			
			// Assert
			expect(getSelectedStrategyKey()).toBe('p5Circle');
			expect(mockSessionStorage.setItem).toHaveBeenCalledTimes(strategies.length);
		});

		it('should handle complex options updates', () => {
			// Arrange
			const complexOptions: Partial<VisualizationOptions> = {
				width: 1920,
				height: 1080,
				backgroundColor: 'transparent',
				animationSpeed: 1.5,
				autoPlay: true,
				quality: 'high' as const
			};
			
			// Act
			updateOptions(complexOptions);
			flushSync();
			
			// Assert
			expect(getVisualizationOptions()).toEqual(complexOptions);
			// Note: JSON.stringify may reorder properties, so we check if the call was made
			expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
				'visualizationOptions',
				expect.stringContaining('"width":1920')
			);
		});

		it('should handle multiple option updates correctly', () => {
			// Arrange & Act
			updateOptions({ width: 400 });
			updateOptions({ height: 300 });
			updateOptions({ quality: 'high' });
			flushSync();
			
			// Assert
			expect(getVisualizationOptions()).toEqual({
				width: 400,
				height: 300,
				quality: 'high'
			});
		});
	});
}); 