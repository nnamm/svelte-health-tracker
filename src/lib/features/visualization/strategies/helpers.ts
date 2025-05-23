/**
 * Helper functions for detecting WebGL performance level
 */

/**
 * Detects the device's performance level
 * @returns 'high' | 'medium' | 'low' performance level
 */
export function detectPerformanceLevel(): 'high' | 'medium' | 'low' {
	const canvas = document.createElement('canvas');
	const gl =
		canvas.getContext('webgl') ||
		(canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
	if (!gl) return 'low';

	// Using RENDERER instead of deprecated WEBGL_debug_renderer_info
	const renderer = gl.getParameter(gl.RENDERER) || '';

	// Consider GPU information
	if (
		renderer.toLowerCase().includes('nvidia') ||
		renderer.toLowerCase().includes('amd') ||
		renderer.toLowerCase().includes('apple m1')
	) {
		return 'high';
	}

	const cores = navigator.hardwareConcurrency || 2;
	if (cores >= 6) return 'medium';
	return 'low';
}

/**
 * Gets the maximum vertex count based on performance level
 * @param level Performance level
 * @returns Maximum vertex count
 */
export function getMaxVertexCountForPerformance(level: 'high' | 'medium' | 'low'): number {
	switch (level) {
		case 'high':
			return 2000;
		case 'medium':
			return 1000;
		case 'low':
			return 500;
		default:
			return 500;
	}
}
