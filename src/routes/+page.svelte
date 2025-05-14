<script lang="ts">
	import Calendar from '$lib/features/calendar/components/CalendarGrid.svelte';
	import HealthDataModal from '$lib/features/health/components/HealthDataModal.svelte';
	import { getHealthRecordsByYearMonth } from '$lib/features/health/services/healthDataService';
	import type { HealthRecord } from '$lib/types/HealthRecord';
	import type { DailyHealthRecord } from '$lib/features/calendar/types';

	// Manage state
	let currentYear = $state(new Date().getFullYear());
	let currentMonth = $state(new Date().getMonth() + 1);
	let healthData = $state<DailyHealthRecord[]>([]);
	let selectedDailyHealthRecord = $state<DailyHealthRecord | null>(null);
	let isFlashing = $state(false);

	// Modal state
	let isModalOpen = $state(false);
	let selectedDate = $state('');

	// Handler for selecting a date
	function handleDateSelect(event: { date: string }) {
		selectedDate = event.date;
		selectedDailyHealthRecord = healthData.find((record) => record.date == event.date) || {
			date: event.date,
			hasHealthData: false
		};
		isModalOpen = true;
	}

	// Handler for changing year and month
	function handleYearMonthChange(event: { year: number; month: number }) {
		currentYear = event.year;
		currentMonth = event.month;
	}

	// Close modal
	function closeModal() {
		isModalOpen = false;
	}

	// Haddler for data updated
	function handleDataUpdated() {
		loadHealthData();
	}

	// Load health data for the current month
	async function loadHealthData() {
		try {
			const response = await getHealthRecordsByYearMonth(currentYear, currentMonth);

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

	function resetToCurrentDate() {
		const today = new Date();
		currentYear = today.getFullYear();
		currentMonth = today.getMonth() + 1;

		isFlashing = true;
		setTimeout(() => {
			isFlashing = false;
		}, 300);
	}

	// Load health data when year or month changes
	$effect(() => {
		if (currentYear && currentMonth) {
			loadHealthData();
		}
	});
</script>

<button class="page-title-button" onclick={resetToCurrentDate}>
	<span class="page-title" class:title-flash={isFlashing}>Health Tracker</span>
</button>

<Calendar
	year={currentYear}
	month={currentMonth}
	{healthData}
	onDateSelect={handleDateSelect}
	onYearMonthChange={handleYearMonthChange}
	resetSelector={isFlashing}
/>

<HealthDataModal
	isOpen={isModalOpen}
	date={selectedDate}
	dailyHealthRecord={selectedDailyHealthRecord}
	onClose={closeModal}
	onDataUpdated={handleDataUpdated}
/>

<style>
	.page-title-button {
		display: block;
		width: fit-content;
		margin: 1.5rem auto;
		padding: 0.5rem 1rem;
		cursor: pointer;
		transition:
			color 0.2s ease,
			background-color 0.2s ease;
		user-select: none;
		border-radius: 4px;
		background: none;
		border: none;
		font-size: inherit;
		font-weight: bold;
		font-family: inherit;
		color: inherit;
	}

	.page-title-button:hover {
		color: #007bff;
		background-color: rgba(0, 123, 255, 0.05);
	}

	.page-title {
		font-size: 2rem;
		font-weight: bold;
	}

	.title-flash {
		animation: flash 0.3s;
	}

	@keyframes flash {
		0% {
			color: inherit;
			background-color: rgba(0, 123, 255, 0);
		}
		50% {
			color: #007bff;
			background-color: rgba(0, 123, 255, 0.1);
		}
		100% {
			color: inherit;
			background-color: rgba(0, 123, 255, 0);
		}
	}
</style>
