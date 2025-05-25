import p5 from 'p5';
import type { VisualizationStrategy, VisualizationOptions, VisualizationInstance } from './types';

export const p5CircleStrategy: VisualizationStrategy = {
	name: 'Cirle Geometory',
	description: 'Points arranged in a circle with geometric line connections based on step count.',

	create(container, stepCount, options: VisualizationOptions = {}): VisualizationInstance {
		let p5Instance: p5 | null = null;

		// Pattern generation state
		const state = {
			stepCount,
			pointCount: 0,
			animationFrame: 0,
			isAnimating: false,
			time: 0,
			rotationAngle: 0
		};

		// Create the p5.js sketch function using instance mode
		const sketch = (p: p5) => {
			// Canvas dimensions
			let canvasWidth: number;
			let canvasHeight: number;

			// Circle properties
			let centerX: number;
			let centerY: number;
			let radius: number;

			// Helper function to calculate the canvas size and circle properties
			const calculateDimensions = () => {
				canvasWidth = Math.max(options.width || container.clientWidth);
				canvasHeight = Math.max(options.height || container.clientHeight);
				centerX = canvasWidth / 2;
				centerY = canvasHeight / 2;
				radius = Math.min(canvasWidth, canvasHeight) * 0.35;
			};

			// Setup function - runs once when sketch starts
			p.setup = () => {
				calculateDimensions();

				// Create canvas and add it to the container
				const canvas = p.createCanvas(canvasWidth, canvasHeight);
				canvas.parent(container);

				// Set initial drawing properties
				p.background(0);
				p.stroke(255);
				p.strokeWeight(1);
				p.noFill();

				console.log('P5 setup completed: ', {
					canvasWidth,
					canvasHeight,
					stepCount: state.stepCount
				});
			};

			// Draw function - runs continuously for Animation
			p.draw = () => {
				// Clear the background
				p.background(0);

				// Update time and rotation for Animation
				state.time += 16; // Approximately 60fps
				state.rotationAngle += 0.01;

				// Calculate number of points based on step count
				const pointCount = Math.max(5, Math.floor(state.stepCount / 100));
				const maxPoint = 256; // Perfomance limit
				const actualPoints = Math.min(pointCount, maxPoint);

				// Draw a reference circle
				p.stroke(50);
				p.strokeWeight(1);
				p.noFill();
				p.circle(centerX, centerY, radius * 2);

				// Calculate and draw points on the circle
				const points: { x: number; y: number }[] = [];

				for (let i = 0; i < actualPoints; i++) {
					// Calculate angle for each point
					const angle = (i / actualPoints) * p.TWO_PI + state.rotationAngle;

					// Calculate point coordinates
					const x = centerX + radius * p.cos(angle);
					const y = centerY + radius * p.sin(angle);

					points.push({ x, y });

					// Draw the point
					p.stroke(255, 200);
					p.strokeWeight(4);
					p.point(x, y);
				}

				// Draw connections between points
				drawConnections(p, points, state.stepCount, radius);
			};

			// Handle window resize
			p.windowResized = () => {
				calculateDimensions();
				p.resizeCanvas(canvasWidth, canvasHeight);
			};
		};

		const drawConnections = (p: p5, points: { x: number; y: number }[], stepCount: number, radius: number) => {
			if (stepCount < 2000) {
				drawSimpleConnections(p, points);
			} else if (stepCount < 10000) {
				drawPatternedConnections(p, points, stepCount, radius);
			} else {
				drawComplexConnections(p, points, stepCount);
			}
		};

		// Function to draw simple connection pattern
		// Connects each point to its adjacent points
		const drawSimpleConnections = (p: p5, points: { x: number; y: number }[]) => {
			p.stroke(100, 150, 255, 150);
			p.strokeWeight(1);

			// Connect each point to the next point
			for (let i = 0; i < points.length; i++) {
				const nextIndex = (i + 1) % points.length;
				p.line(points[i].x, points[i].y, points[nextIndex].x, points[nextIndex].y);
			}
		};

		// Function to draw geometric pattern connections
		// Combines multiple connection patterns based on step count to create beautiful geometric designs
		const drawPatternedConnections = (
			p: p5,
			points: { x: number; y: number }[],
			stepCount: number,
			radius: number
		) => {
			// Calculate multiple connection steps based on step count
			// This generates multiple connection patterns, creating more complex geometric designs
			const baseStep = Math.max(2, Math.floor(stepCount / 1000));
			const goldenRatio = 1.618;
			
			// Define multiple different connection patterns
			const connectionSteps = [
				baseStep,
				Math.floor(baseStep * goldenRatio) % points.length,
				Math.floor(points.length / baseStep)
			];
			
			// Vary the hue based on step count
			const hue = ((stepCount % 5000) / 5000) * 180;
			
			// Draw each pattern
			connectionSteps.forEach((step, index) => {
				if (step < 1) return; // Skip invalid steps
				
				// Set different color and transparency for each pattern
				const saturation = 70 + index * 10;
				const brightness = 80 + index * 5;
				const alpha = 100 - index * 20;
				
				p.stroke(
					(hue + index * 60) % 360,
					saturation,
					brightness,
					alpha
				);
				p.strokeWeight(1.5 - index * 0.2);
				
				// Add wave-like effect based on time
				const waveEffect = Math.sin(state.time / 1000 + index) * 0.5 + 0.5;
				
				for (let i = 0; i < points.length; i++) {
					// Select connection points based on wave effect
					const modStep = Math.floor(step + i * waveEffect) % points.length;
					if (modStep === 0) continue; // Avoid self-connections
					
					const targetIndex = (i + modStep) % points.length;
					
					// Adjust line transparency based on distance
					const dx = points[i].x - points[targetIndex].x;
					const dy = points[i].y - points[targetIndex].y;
					const distance = Math.sqrt(dx * dx + dy * dy);
					const distanceAlpha = Math.min(255, (distance / (radius * 2)) * 200);
					
					p.stroke(
						(hue + index * 60) % 360,
						saturation,
						brightness,
						alpha * (distanceAlpha / 255)
					);
					
					p.line(points[i].x, points[i].y, points[targetIndex].x, points[targetIndex].y);
				}
			});
		};

		// Function to draw complex connection patterns
		// Overlays multiple geometric patterns based on step count
		const drawComplexConnections = (
			p: p5,
			points: { x: number; y: number }[],
			stepCount: number
		) => {
			// Multiple connection patterns for complex visualization
			const patterns = [
				Math.floor(points.length / 3),
				Math.floor(points.length / 5),
				Math.floor(points.length / 7)
			];

			// Color variation based on step count
			const hue = ((stepCount % 10000) / 10000) * 360;

			patterns.forEach((pattern, index) => {
				const alpha = 80 - index * 20; // Decreasing opacity for layered effect
				p.stroke(hue + index * 30, 150 - index * 30, 100 + index * 50, alpha);
				p.strokeWeight(1);

				for (let i = 0; i < points.length; i++) {
					const targetIndex = (i + pattern) % points.length;
					p.line(points[i].x, points[i].y, points[targetIndex].x, points[targetIndex].y);
				}
			});
		};

		// External resize handler
		const handleResize = () => {
			if (p5Instance) {
				const newWidth = Math.max(options.width || container.clientWidth || 400, 400);
				const newHeight = Math.max(options.height || container.clientHeight || 400, 400);
				p5Instance.resizeCanvas(newWidth, newHeight);
			}
		};
		window.addEventListener('resize', handleResize);

		// Initialize the p5.js instance
		p5Instance = new p5(sketch);

		// Start animation if autoPlay is true or not specified
		if (options.autoPlay !== false) {
			state.isAnimating = true;
		}

		// Return the visualization instance with extended functionality
		return {
			render: () => {
				// Manual render not needed for p5.js as it handles its own draw loop
			},
			destroy: () => {
				window.removeEventListener('resize', handleResize);
				state.isAnimating = false;

				if (p5Instance) {
					p5Instance.remove();
					p5Instance = null;
				}
			}
		};
	}
};
