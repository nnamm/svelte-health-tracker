import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			fallback: 'index.html' // Specify the fallback file for SPA routing
		}),
		prerender: {
			entries: ['/'] // Only the root (index.html)
		}
	}
};

export default config;
