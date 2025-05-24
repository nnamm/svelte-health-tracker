export interface VisualizationSettings {
	quality: 'high' | 'medium' | 'low';
	maxVertices: number;
}

export default class PerformanceOptimizer {
	private static _cachedSettings: VisualizationSettings | null = null;

	static getOptimalSettings(): VisualizationSettings {
		if (this._cachedSettings) {
			return this._cachedSettings;
		}

		const canvas = document.createElement('canvas');
		const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

		if (!gl) {
			this._cachedSettings = { quality: 'low', maxVertices: 500 };
			return this._cachedSettings;
		}

		const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
		const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
		const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : '';

		const memoryInfo = (performance as any).memory;
		const memoryUsageRatio = memoryInfo
			? memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize
			: 0.5;

		let settings: VisualizationSettings;

		if (this.isHighPerformanceGPU(renderer, vendor)) {
			settings =
				memoryUsageRatio < 0.6
					? { quality: 'high', maxVertices: 5000 }
					: { quality: 'medium', maxVertices: 3000 };
		} else if (navigator.hardwareConcurrency >= 4) {
			settings =
				memoryUsageRatio < 0.7
					? { quality: 'medium', maxVertices: 2000 }
					: { quality: 'low', maxVertices: 1500 };
		} else {
			settings = { quality: 'low', maxVertices: 1000 };
		}

		this._cachedSettings = settings;
		return settings;
	}

	private static isHighPerformanceGPU(renderer: string, vendor: string): boolean {
		const highPerformanceKeywords = ['RTX', 'Apple M', 'Radeon RX', 'GTX', 'Quadro'];
		const hasHighPerformanceKeyword = highPerformanceKeywords.some((keyword) =>
			renderer.includes(keyword)
		);

		const isNvidiaHighEnd =
			vendor.includes('NVIDIA') && (renderer.includes('RTX') || renderer.includes('GTX'));
		const isAMDHighEnd = vendor.includes('AMD') && renderer.includes('Radeon RX');
		const isAppleSilicon = vendor.includes('Apple') && renderer.includes('Apple M');
		const isIntelArc = vendor.includes('Intel') && renderer.includes('Arc');

		return (
			hasHighPerformanceKeyword || isNvidiaHighEnd || isAMDHighEnd || isAppleSilicon || isIntelArc
		);
	}
}
