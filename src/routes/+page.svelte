<script lang="ts">
	import Calendar from '$lib/components/calendar/CalendarGrid.svelte';
	import { api } from '$lib/api';
	import type { HealthRecord } from '$lib/types/HealthRecord';
	import { goto } from '$app/navigation';
	import type { DailyHealthRecord } from '$lib/components/calendar/calendarHelper';

	// Svelte store for managing state
	let currentYear = $state(new Date().getFullYear());
	let currentMonth = $state(new Date().getMonth() + 1);
	let healthData = $state<DailyHealthRecord[]>([]);

	// Handler for selecting a date
	function handleDateSelect(event: { date: string }) {
		goto(`health/${event.date}`);
	}

	// Load health data for the current month
	async function loadHealthData() {
		try {
			const response = await api.getHealthRecordsByYearMonth(currentYear, currentMonth);

			if (response.success && response.data) {
				healthData = response.data.map((record: HealthRecord) => ({
					date: record.date,
					hasHealthData: true
				}));
			} else {
				console.error('Failed to load health data:', response.error);
				healthData = [];
			}
		} catch (error) {
			console.error('Error loading health data:', error);
			healthData = [];
		}
	}

	$effect(() => {
		loadHealthData();
	});

	$effect(() => {
		if (currentYear && currentMonth) {
			loadHealthData();
		}
	});
</script>

<h1 class="page-title">Health Tracker</h1>

<Calendar year={currentYear} month={currentMonth} {healthData} dateSelect={handleDateSelect} />

<style>
	.page-title {
		text-align: center;
		margin: 1.5rem 0 2rem 0;
	}
</style>
