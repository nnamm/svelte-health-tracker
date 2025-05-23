import type { VisualizationStrategy, VisualizationOptions, VisualizationInstance } from './types';

export const canvas2DStrategy: VisualizationStrategy = {
	name: 'Simple 2D Patterns',
	description: 'Lightwight 2D patterns that respond to step count cahnges.',

	create(container, stepCount, options: VisualizationOptions = {}): VisualizationInstance {
		// Create canvas element
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		if (!ctx) {
			throw new Error('Could not get 2D context');
		}

		// Set initial size
		const width = options.width || container.clientWidth;
		const height = options.height || container.clientHeight;
		canvas.width = width;
		canvas.height = height;

		// Add to container
		container.appendChild(canvas);

		// Pattern generation state
		const state = {
			stepCount,
			animationFrame: 0,
			isAnimating: false,
			time: 0
		};

		// Draw the pattern based on step count
		function drawPattern() {
			if (!ctx) return;

			const { width, height } = canvas;

			// Clear canvas
			ctx.clearRect(0, 0, width, height);

			// Base pattern complexity on step count (1000 steps = baseline)
			const complexity = Math.min(Math.max(stepCount / 1000, 0.1), 4);
			const numShapes = Math.floor(complexity * 10) + 5;

			// Background
			// ctx.fillStyle = options.backgroundColor || '#f4f4f8';
			ctx.fillStyle = '#000';
			ctx.fillRect(0, 0, width, height);

			// Generate pattern based on step count
			const hue = ((stepCount % 10000) / 10000) * 360;

			for (let i = 0; i < numShapes; i++) {
				const t = state.time * 0.001;
				const radius =
					Math.min(width, height) * 0.4 * (0.2 + 0.8 * Math.sin((i / numShapes) * Math.PI));
				const x = width / 2 + Math.cos(t + (i * Math.PI * 2) / numShapes) * radius;
				const y = height / 2 + Math.sin(t + (i * Math.PI * 2) / numShapes) * radius;

				ctx.beginPath();
				ctx.arc(x, y, 5 + complexity * 8, 0, Math.PI * 2);
				ctx.fillStyle = `hsla(${hue + (i * 360) / numShapes}, 70%, 60%, 0.7)`;
				ctx.fill();

				if (i % 2 === 0 && complexity > 1) {
					ctx.beginPath();
					ctx.arc(x, y, 10 + complexity * 6, 0, Math.PI * 2);
					ctx.strokeStyle = `hsla(${hue + (i * 360) / numShapes}, 80%, 40%, 0.5)`;
					ctx.lineWidth = 2;
					ctx.stroke();
				}
			}

			// Connect shapes with lines
			if (complexity > 0.5) {
				ctx.beginPath();
				for (let i = 0; i < numShapes; i++) {
					const t = state.time * 0.001;
					const radius =
						Math.min(width, height) * 0.4 * (0.2 + 0.8 * Math.sin((i / numShapes) * Math.PI));
					const x = width / 2 + Math.cos(t + (i * Math.PI * 2) / numShapes) * radius;
					const y = height / 2 + Math.sin(t + (i * Math.PI * 2) / numShapes) * radius;

					if (i === 0) {
						ctx.moveTo(x, y);
					} else {
						ctx.lineTo(x, y);
					}
				}
				ctx.closePath();
				ctx.strokeStyle = `hsla(${hue}, 70%, 50%, 0.3)`;
				ctx.lineWidth = 1 + complexity;
				ctx.stroke();
			}
		}

		// Animation loop
		function animate() {
			state.time += 16; // Approximately 60fps
			drawPattern();
			if (state.isAnimating) {
				state.animationFrame = requestAnimationFrame(animate);
			}
		}

		// handle resieze
		function handleResize() {
			if (!container) return;

			canvas.width = container.clientWidth;
			canvas.height = container.clientHeight;
			drawPattern();
		}

		// Start listening for resize
		window.addEventListener('resize', handleResize);

		// Initial draw
		drawPattern();

		// Start animation ife autoPlay is true or not specified
		if (options.autoPlay !== false) {
			state.isAnimating = true;
			animate();
		}

		// Return the visualization instance
		return {
			render: () => {
				drawPattern();
			},
			destroy: () => {
				cancelAnimationFrame(state.animationFrame);
				window.removeEventListener('resize', handleResize);
				if (container.contains(canvas)) {
					container.removeChild(canvas);
				}
			}
			// start: () => {
			// 	if (!state.isAnimating) {
			// 		state.isAnimating = true;
			// 		animate();
			// 	}
			// },
			// stop: () => {
			// 	if (state.isAnimating) {
			// 		state.isAnimating = false;
			// 		cancelAnimationFrame(state.animationFrame);
			// 	}
			// },
			// isAnimating: () => state.isAnimating,
			// resize: (width: number, height: number) => {
			// 	canvas.width = width;
			// 	canvas.height = height;
			// 	drawPattern();
			// }
		};
	}
};
