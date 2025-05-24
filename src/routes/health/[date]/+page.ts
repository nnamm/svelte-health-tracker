import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';
import { DateUtils } from '$lib/utils/dateUtils';

export async function load({ params }) {
	const { date } = params;

	// Validate date format (YYYY-MM-DD)
	if (!DateUtils.isValidDate(date)) throw error(400, 'Invalid date format. Expected YYYY-MM-DD');
	const titleDate = DateUtils.formatForDisplay(date);

	// Preload visualization libraries in browser
	if (browser) {
		// Start preloading graphics libraries
		const preloadTasks = [
			() =>
				import('three').catch((err) => {
					console.warn('Three.js preload failed: ', err);
					return null;
				}),

			() =>
				import('p5').catch((err) => {
					console.warn('p5.js preload failed: ', err);
					return null;
				})
		];

		// Async preload execution
		Promise.allSettled(preloadTasks.map((task) => task())).then((results) => {
			const loaded = results.filter((result) => result.status == 'fulfilled' && result.value);
			console.log(`Preloaded ${loaded.length} visualization libraries`);
		});
	}

	return {
		date: date,
		meta: {
			title: `Health Data - ${titleDate}`,
			description: `View health data visualization for ${date}`
		}
	};
}
