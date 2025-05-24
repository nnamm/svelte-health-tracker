import * as THREE from 'three';
import type { VisualizationStrategy, VisualizationOptions, VisualizationInstance } from './types';
import PerformanceOptimizer from '$lib/utils/performanceUtils';

export const fractalStrategy: VisualizationStrategy = {
	name: 'Fractal',
	description: 'Fractal patterns with complexity that changes based on step count.',
	// thumbnail: '';

	create(container, stepCount, options: VisualizationOptions = {}): VisualizationInstance {
		// Pattern generation state
		const state = {
			stepCount,
			isAnimating: false
		};

		// Initialize the scene
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(
			75,
			container.clientWidth / container.clientHeight,
			0.1,
			1000
		);
		const renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: options.backgroundColor === 'transparent'
		});

		//renderer.setSize(container.clientWidth, container.clientHeight);
		// Apply options if provided
		const width = options.width || container.clientWidth;
		const height = options.height || container.clientHeight;

		renderer.setSize(width, height);
		if (options.backgroundColor && options.backgroundColor !== 'transparent') {
			scene.background = new THREE.Color(options.backgroundColor);
		}
		container.appendChild(renderer.domElement);
		camera.position.z = 5;

		// Generate fractal based on step count
		let geometry = new THREE.BufferGeometry();
		let mesh: THREE.Mesh;

		function generateFractalGeometory(steps: number) {
			// Set complexity based on device perfomance
			const settings = PerformanceOptimizer.getOptimalSettings();

			// Set polygon count limit using logarithmic scale
			const complexity = Math.log10(Math.max(steps, 1)) * 300;
			const vertexCount = Math.min(complexity, settings.maxVertices);

			// Generate fractal geometry
			const vertices: number[] = [];
			const indices: number[] = [];

			// Use step count as seed value for the fractal
			const fractalDepth = Math.min(Math.floor(Math.log10(steps)), 4);
			const scale = 2.0;

			// Basic triangle vertices
			const baseVertices = [
				new THREE.Vector3(0, 1, 0),
				new THREE.Vector3(-0.866, -0.5, 0),
				new THREE.Vector3(0.866, -0.5, 0)
			];

			// Generate fractal recursively
			function generateFractal(
				v1: THREE.Vector3,
				v2: THREE.Vector3,
				v3: THREE.Vector3,
				depth: number
			) {
				if (depth <= 0 || vertices.length / 3 >= vertexCount) {
					// Add current triangle to vertex array
					const baseIndex = vertices.length / 3;
					vertices.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z);
					indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
					return;
				}

				// Calculate midpoints of each edge
				const v12 = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
				const v23 = new THREE.Vector3().addVectors(v2, v3).multiplyScalar(0.5);
				const v31 = new THREE.Vector3().addVectors(v3, v1).multiplyScalar(0.5);

				// Displace midpoints based on step count and depth
				const seed = (steps % 100) / 100;
				const displacement = 0.1 * seed * Math.pow(0.5, depth);

				v12.z += displacement;
				v23.z += displacement * 0.8;
				v31.z += displacement * 1.2;

				// Recursively generate for new triangles
				generateFractal(v1, v12, v31, depth - 1);
				generateFractal(v12, v2, v23, depth - 1);
				generateFractal(v31, v23, v3, depth - 1);
				generateFractal(v12, v23, v31, depth - 1);
			}

			// Start fractal generation
			generateFractal(
				baseVertices[0].clone().multiplyScalar(scale),
				baseVertices[1].clone().multiplyScalar(scale),
				baseVertices[2].clone().multiplyScalar(scale),
				fractalDepth
			);

			// Update geometry
			geometry.dispose();
			geometry = new THREE.BufferGeometry();

			const veticesArray = new Float32Array(vertices);
			geometry.setAttribute('position', new THREE.BufferAttribute(veticesArray, 3));
			geometry.setIndex(indices);
			geometry.computeVertexNormals();

			// Create/update material and mesh
			const hue = (steps % 10000) / 10000;
			const material = new THREE.MeshPhongMaterial({
				color: new THREE.Color().setHSL(hue, 0.8, 0.5),
				shininess: 30,
				flatShading: true
			});

			if (mesh) {
				scene.add(mesh);
			}

			mesh = new THREE.Mesh(geometry, material);
			scene.add(mesh);

			// Add lights
			if (scene.children.length <= 1) {
				const light = new THREE.DirectionalLight(0xffffff, 1);
				light.position.set(1, 1, 2);
				scene.add(light);

				const ambientLight = new THREE.AmbientLight(0x404040, 1);
				scene.add(ambientLight);
			}

			// Use requestIdleCallback for progressive rendering if available
			if ('requestIdleCallback' in window) {
				window.requestIdleCallback(() => {
					geometry.computeVertexNormals();
				});
			} else {
				geometry.computeVertexNormals();
			}
		}

		// Generate initial fractal
		generateFractalGeometory(state.stepCount);

		// Set up animation
		let animationId: number;
		const animationSpeed = options.animationSpeed || 1;

		function animate() {
			animationId = requestAnimationFrame(animate);

			if (mesh) {
				mesh.rotation.x += 0.01 * animationSpeed;
				mesh.rotation.y += 0.005 * animationSpeed;
			}

			renderer.render(scene, camera);
		}

		// Handle resize events
		function handleResize() {
			if (!container) return;

			camera.aspect = container.clientWidth / container.clientHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(container.clientWidth, container.clientHeight);
		}

		window.addEventListener('resize', handleResize);

		// Start animation if autoPlay is true or not specified
		if (options.autoPlay !== false) {
			state.isAnimating = true;
			animate();
		}

		// Return instance
		return {
			render: () => {
				renderer.render(scene, camera);
			},
			destroy: () => {
				cancelAnimationFrame(animationId);
				if (scene) {
					scene.traverse((object) => {
						if (object instanceof THREE.Mesh) {
							if (object.geometry) object.geometry.dispose();
							if (object.material) {
								if (Array.isArray(object.material)) {
									object.material.forEach((material) => material.dispose());
								} else {
									object.material.dispose();
								}
							}
						}
					});
				}
				if (renderer) renderer.dispose();
				window.removeEventListener('resize', handleResize);
				if (mesh) scene.remove(mesh);
				geometry.dispose();
				if (container.contains(renderer.domElement)) {
					container.removeChild(renderer.domElement);
				}
			}
			// start: () => {
			// 	if (!isAnimating) {
			// 		animate();
			// 		isAnimating = true;
			// 	}
			// },
			// stop: () => {
			// 	if (isAnimating) {
			// 		cancelAnimationFrame(animationId);
			// 		isAnimating = false;
			// 	}
			// },
			// isAnimating: () => isAnimating,
			// resize: (width: number, height: number) => {
			// 	camera.aspect = width / height;
			// 	camera.updateProjectionMatrix();
			// 	renderer.setSize(width, height);
			// }
		};
	}
};
