<script lang="ts">
	import Calendar from '$lib/components/calendar/CalendarGrid.svelte';
	import HealthDataModal from '$lib/components/health/HealthDataModal.svelte';
	import { api } from '$lib/api';
	import type { HealthRecord } from '$lib/types/HealthRecord';
	import type { DailyHealthRecord } from '$lib/components/calendar/calendarHelper';

	// Manage state
	let currentYear = $state(new Date().getFullYear());
	let currentMonth = $state(new Date().getMonth() + 1);
	let healthData = $state<DailyHealthRecord[]>([]);

	// Modal state
	let isModalOpen = $state(false);
	let selectedDate = $state('');

	// Handler for selecting a date
	function handleDateSelect(event: { date: string }) {
		selectedDate = event.date;
		isModalOpen = true;
	}

	// Haddler for data updated
	function handleDataUpdated(record: HealthRecord | null) {
		loadHealthData();
	}

	// Close modal
	function closeModal() {
		isModalOpen = false;
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

	// Initiale load
	$effect(() => {
		loadHealthData();
	});

	// Load health data when year or month changes
	$effect(() => {
		if (currentYear && currentMonth) {
			loadHealthData();
		}
	});
</script>

<h1 class="page-title">Health Tracker</h1>

<Calendar year={currentYear} month={currentMonth} {healthData} dateSelect={handleDateSelect} />

<HealthDataModal
	isOpen={isModalOpen}
	date={selectedDate}
	dailyHealthRecord={healthData.find((record) => record.date === selectedDate) || {
		date: selectedDate,
		hasHealthData: false
	}}
	onClose={closeModal}
	onDataUpdated={handleDataUpdated}
/>

<style>
	.page-title {
		text-align: center;
		margin: 1.5rem 0 2rem 0;
	}
</style>
