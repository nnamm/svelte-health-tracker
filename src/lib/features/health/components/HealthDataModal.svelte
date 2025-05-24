<script lang="ts">
	/**
	 * Modal component for creating, viewing, editing, and deleting health records
	 *
	 * @component
	 * @example
	 * ```svelte
	 * <HealthDataModal
	 *   isOpen={showModal}
	 *   date="2025-05-15"
	 *   dailyHealthRecord={selectedDayRecord}
	 *   onClose={() => showModal = false}
	 *   onDataUpdated={(record) => handleDataUpdated(record)}
	 * />
	 * ```
	 */
	import { goto } from '$app/navigation';
	import Modal from '$lib/common/components/Modal.svelte';
	import {
		createHealthRecord,
		getHealthRecordByDate,
		updateHealthRecord,
		deleteHealthRecord
	} from '$lib/features/health/services/healthDataService';
	import { DateUtils } from '$lib/utils/dateUtils';
	import type { HealthRecord } from '$lib/types/HealthRecord';
	import type { DailyHealthRecord } from '$lib/features/calendar/types';

	/**
	 * Properties for the HealthDataModal component
	 * @interface HealthDataModalProps
	 */
	interface HealthDataModalProps {
		/** Whether the modal is currently visible */
		isOpen: boolean;
		/** The date string in 'YYYY-MM-DD' format */
		date: string;
		/** Calendar day info with hasHealthData flag */
		dailyHealthRecord: DailyHealthRecord | null;
		/** Callback function when modal is closed */
		onClose?: () => void;
		/** Callback function when health record is updated/created/deleted */
		onDataUpdated?: (record: HealthRecord | null) => void;
	}

	let {
		isOpen = false,
		date = '',
		dailyHealthRecord = null,
		onClose,
		onDataUpdated
	}: HealthDataModalProps = $props();

	// Safe version of dailyHealthRecord with default values if null
	const safeHealthRecord = $derived(dailyHealthRecord || { date: date, hasHealthData: false });

	// Current health record data being edited
	let healthRecord = $state<Partial<HealthRecord>>({ step_count: 0 });

	// Loading state indicator
	let isLoading = $state(true);

	// Error message if any operation fails
	let error = $state<string | null>(null);

	// Human-readable formatted date for display
	let formattedDate = $state('');

	// Element reference for step count input
	let stepCountInput = $state<HTMLInputElement | null>(null);

	/**
	 * Loads health data for the selected date
	 * If data exists, it fetches from the API
	 * If no data exists, it initializes with default values
	 *
	 * @async
	 * @returns {Promise<void>}
	 */
	async function loadHealthData(): Promise<void> {
		if (!date) return;

		isLoading = true;
		error = null;
		formattedDate = DateUtils.formatForDisplay(date);

		try {
			if (!safeHealthRecord.hasHealthData) {
				// No existing health data, set empty data
				healthRecord = { date: date, step_count: 0 };
			} else {
				// Existing health data, fetch it
				const response = await getHealthRecordByDate(date);

				if (response.success) {
					healthRecord = response.data || { date: date, step_count: 0 };
				} else {
					error = response.error || 'Failed to load health data';
					healthRecord = { date: date, step_count: 0 };
				}
			}
		} catch (err) {
			error = 'An unexpected error occured';
			console.error(err);
		} finally {
			isLoading = false;
		}
	}

	/**
	 * Move to the vizualization page
	 **/
	function navigateToVisualization(): void {
		if (healthRecord?.date) {
			closeModal();
			goto(`/health/${healthRecord.date}`);
		}
	}

	/**
	 * Saves health record data (creates new or updates existing)
	 *
	 * @async
	 * @param {Event} event - Form submission event
	 * @returns {Promise<void>}
	 */
	async function saveHealthData(event: Event): Promise<void> {
		event.preventDefault();

		if (!healthRecord) return;

		isLoading = true;
		error = null;

		try {
			const isNew = !healthRecord.id;
			const response = isNew
				? await createHealthRecord(healthRecord)
				: await updateHealthRecord(healthRecord);

			if (response.success) {
				healthRecord = response.data ?? {};
				onDataUpdated?.(response.data);
				closeModal();
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

	/**
	 * Deletes the current health record
	 *
	 * @async
	 * @returns {Promise<void>}
	 */
	async function deleteHealthData(): Promise<void> {
		if (!healthRecord?.date) return;

		isLoading = true;
		error = null;

		try {
			const response = await deleteHealthRecord(healthRecord.date);

			if (response.success) {
				onDataUpdated?.(null);
				closeModal();
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

	/**
	 * Closes the modal and triggers the onClose callback
	 */
	function closeModal(): void {
		onClose?.();
	}

	/**
	 * Effect to load health data when modal is opened
	 * Resets error state when modal is closed
	 */
	$effect(() => {
		if (isOpen && date) {
			loadHealthData();

			setTimeout(() => {
				stepCountInput?.focus();
			}, 200);
		} else {
			error = null;
			isLoading = false;
		}
	});
</script>

<Modal {isOpen} onClose={closeModal}>
	<div class="health-data-modal">
		{#if isLoading}
			<div class="loading">Loading...</div>
		{:else}
			<header>
				<h2>Health Data: {formattedDate}</h2>
			</header>

			{#if error}
				<div class="error-message">{error}</div>
			{/if}

			<form onsubmit={saveHealthData} class="health-form">
				<div class="form-group">
					<label for="step-count">Step count</label>
					<input
						id="step-count"
						type="number"
						min="0"
						max="100000"
						bind:value={healthRecord.step_count}
						bind:this={stepCountInput}
						required
					/>
				</div>

				<div class="button-group">
					{#if healthRecord?.id}
						<button
							type="button"
							class="visualization-button"
							onclick={() => navigateToVisualization()}>View</button
						>
					{/if}

					<button type="submit" class="primary-button">
						{healthRecord?.id ? 'Update' : 'Save'}
					</button>

					{#if healthRecord?.id}
						<button type="button" class="delete-button" onclick={deleteHealthData}> Delete </button>
					{/if}

					<button type="button" class="cancel-button" onclick={closeModal}> Cancel </button>
				</div>
			</form>
		{/if}
	</div>
</Modal>

<style>
	.health-data-modal {
		width: 100%;
	}

	header {
		margin-bottom: 1.5rem;
	}

	h2 {
		margin: 0;
		font-size: 1.5rem;
	}

	.health-form {
		width: 100%;
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
		font-size: 1rem;
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	.button-group {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
	}

	button {
		padding: 0.75rem 1.25rem;
		font-size: 1rem;
		cursor: pointer;
		border: none;
		border-radius: 4px;
		transition: background 0.2s ease;
	}

	.visualization-button {
		color: white;
		background: #aa336a;
	}

	.visualization-button:hover {
		background: #9f2560;
	}

	@media (width <= 480px) {
		.button-group {
			flex-wrap: wrap;
			justify-content: center;
		}

		.button-group button {
			flex: 1;
			min-width: 80px;
		}
	}

	.primary-button {
		color: white;
		background: #007bff;
	}

	.primary-button:hover {
		background: #0069d9;
	}

	.delete-button {
		color: white;
		background: #dc3545;
	}

	.delete-button:hover {
		background: #c82333;
	}

	.cancel-button {
		color: white;
		background: #6c757d;
	}

	.cancel-button:hover {
		background: #5a6268;
	}

	.error-message {
		padding: 0.75rem;
		margin-bottom: 1rem;
		color: #721c24;
		background: #f8d7da;
		border-radius: 4px;
	}

	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 200px;
		font-style: italic;
		color: #6c757d;
	}
</style>
