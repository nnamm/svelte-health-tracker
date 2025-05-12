<script lang="ts">
	import { page } from '$app/stores';
	import { api } from '$lib/api';
	import { goto } from '$app/navigation';
	import type { HealthRecord } from '$lib/types/HealthRecord';
	import type { DailyHealthRecord } from '$lib/components/calendar/calendarHelper';

	// Reactive variables
	let healthRecord = $state<Partial<HealthRecord>>({ step_count: 0 });
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let formattedDate = $state('');
	let healthData = $state<DailyHealthRecord[]>([]);

	// Function to format date for display (2025-05-01) -> May 1, 2025
	function formatDisplayDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	// Load health data for the selected date
	async function loadHealthData(): Promise<void> {
		isLoading = true;
		error = null;

		try {
			if (healthData) {
				const dateParam = $page.params.date;
				formattedDate = formatDisplayDate(dateParam);

				const response = await api.getHealthRecordByDate(dateParam);

				if (response.success) {
					healthRecord = response.data || { date: dateParam, step_count: 0 };
				} else if (response.data == null) {
					healthRecord = { date: dateParam, step_count: 0 };
				} else {
					error = response.error || 'Failed to load health data';
					healthRecord = { date: dateParam, step_count: 0 };
				}
			}
		} catch (err) {
			error = 'An unexpected error occured';
			console.error(err);
		} finally {
			isLoading = false;
		}
	}

	// Save health data
	async function saveHealthData(event: Event): Promise<void> {
		event.preventDefault();

		if (!healthRecord) return;

		isLoading = true;
		error = null;

		try {
			// determine if we're creating a new record or updating an existing one
			const isNew = !healthRecord.id;
			const response = isNew
				? await api.createHealthRecord(healthRecord)
				: await api.updateHealthRecord(healthRecord);

			if (response.success) {
				healthRecord = response.data ?? {};
			} else {
				error = response.error || 'Failed to save health data';
			}
		} catch (err) {
			error = 'An unexpected error occurred while saving';
			console.error(err);
		} finally {
			isLoading = false;
		}
	}

	// Delete health data
	async function deleteHealthData(): Promise<void> {
		if (!healthRecord?.date) return;

		isLoading = true;
		error = null;

		try {
			const response = await api.deleteHealthRecord(healthRecord.date);

			if (response.success) {
				goto('/');
			} else {
				error = response.error || 'Failed to delete health data';
			}
		} catch (err) {
			error = 'An unexpected error occurred while deleting';
			console.error(err);
		} finally {
			isLoading = false;
		}
	}

	$effect(() => {
		loadHealthData();
	});
</script>

<div class="health-detail-container">
	{#if isLoading}
		<div class="loading">Loading health data...</div>
	{:else}
		<header>
			<h1>Health Data for {formattedDate}</h1>
			<button class="back-button" onclick={() => goto('/')}>Back to Calendar</button>
		</header>

		{#if error}
			<div class="error-message">{error}</div>
		{/if}

		<!-- <form onsubmit|preventDefault={saveHealthData} class="health-form"> -->
		<form onsubmit={saveHealthData} class="health-form">
			<div class="form-group">
				<label for="step-count">Step Count</label>
				<input
					id="step-count"
					type="number"
					min="0"
					max="100000"
					bind:value={healthRecord.step_count}
				/>
			</div>

			<div class="button-group">
				<button type="submit" class="primary-button">
					{healthRecord?.id ? 'Update' : 'Save'}
				</button>

				{#if healthRecord?.id}
					<button type="button" class="delete-button" onclick={deleteHealthData}>Delete</button>
				{/if}
			</div>
		</form>
	{/if}
</div>

<style>
	.health-detail-container {
		max-width: 500px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	h1 {
		font-size: 1.5rem;
		margin: 0;
	}

	.health-form {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
	}

	input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
	}

	.button-group {
		display: flex;
		gap: 1rem;
	}

	button {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.primary-button {
		background: #007bff;
		color: white;
	}

	.primary-button:hover {
		background: #0069d9;
	}

	.delete-button {
		background: #dc3545;
		color: white;
	}

	.delete-button:hover {
		background: #c82333;
	}

	.back-button {
		background: #6c757d;
		color: white;
		font-size: 0.875rem;
	}

	.error-message {
		background: #f8d7da;
		color: #721c24;
		padding: 0.75rem;
		border-radius: 4px;
		margin-bottom: 1rem;
	}

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 200px;
		font-style: italic;
		color: #6c757d;
	}
</style>
