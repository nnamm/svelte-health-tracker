import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const { date } = params;

	// Validate date format (YYYY-MM-DD)
	const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
	if (!dateRegex.test(date)) {
		throw error(400, 'Invalid date format. Expected YYYY-MM-DD');
	}

	// Validate if date is a real date
	const parsedDate = new Date(date);
	if (isNaN(parsedDate.getTime())) {
		throw error(400, 'Invalid date provided');
	}

	// Preload visualization libraries in browser
	if (browser) {
		// Start preloading Three.js and other heavy libraries
		const preloadPromises = [
			import('three').catch((err) => {
				console.warn('Failed to preload Three.js: ', err);
				return null;
			})
			// Preload other heavy visualization libraries if needed
			// import('some-other-library').catch(() => null)
		];

		// Don't await these - let them load in background
		Promise.all(preloadPromises).then((results) => {
			console.log('Visualization libraries preloaded: ', results.filter(Boolean).length);
		});
	}

	return {
		date: date,
		meta: {
			title: `Health Data - ${parsedDate.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			})}`,
			description: `View health data visualization for ${date}`
		}
	};
}

