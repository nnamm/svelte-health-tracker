import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// required for svelte5 + jsdom as jsdom does not support matchMedia
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	enumerable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn()
	}))
});

// Svelte 5のアニメーション関連のエラーを回避するためのスタブ
if (typeof Element !== 'undefined' && !Element.prototype.animate) {
	// @ts-expect-error - 型エラーを無視して最小限のモックを提供
	Element.prototype.animate = () => ({
		cancel: vi.fn(),
		finished: Promise.resolve({})
	});
}

// add more mocks here if you need them
