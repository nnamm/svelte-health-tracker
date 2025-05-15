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
	import Modal from '$lib/common/components/Modal.svelte';
	import {
		createHealthRecord,
		getHealthRecordByDate,
		updateHealthRecord,
		deleteHealthRecord
	} from '$lib/features/health/services/healthDataService';
	import type { HealthRecord } from '$lib/types/HealthRecord';
	import type { DailyHealthRecord } from '$lib/features/calendar/types';

	/**
	 * Component props
	 * @property {boolean} isOpen - Whether the modal is currently visible
	 * @property {string} date - The date string in 'YYYY-MM-DD' format
	 * @property {DailyHealthRecord | null} dailyHealthRecord - Calendar day info with hasHealthData flag
	 * @property {Function} [onClose] - Callback function when modal is closed
	 * @property {Function} [onDataUpdated] - Callback function when health record is updated/created/deleted
	 */
	let {
		isOpen = false,
		date = '',
		// dailyHealthRecord = { date: '', hasHealthData: false },
		dailyHealthRecord = null,
		onClose,
		onDataUpdated
	} = $props<{
		isOpen: boolean;
		date: string;
		dailyHealthRecord: DailyHealthRecord | null;
		onClose?: () => void;
		onDataUpdated?: (record: HealthRecord | null) => void;
	}>();

	/** Safe version of dailyHealthRecord with default values if null */
	const safeHealthRecord = $derived(dailyHealthRecord || { date: date, hasHealthData: false });

	/** Current health record data being edited */
	let healthRecord = $state<Partial<HealthRecord>>({ step_count: 0 });
	
	/** Loading state indicator */
	let isLoading = $state(true);
	
	/** Error message if any operation fails */
	let error = $state<string | null>(null);
	
	/** Human-readable formatted date for display */
	let formattedDate = $state('');

	/**
	 * Formats a date string into a human-readable form
	 * Converts YYYY-MM-DD to "Month Day, Year" format
	 * 
	 * @param {string} dateString - Date in YYYY-MM-DD format
	 * @returns {string} Formatted date string (e.g., "May 15, 2025")
	 */
	function formatDisplayDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

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
		formattedDate = formatDisplayDate(date);

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
						required
					/>
				</div>

				<div class="button-group">
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
		font-size: 1.5rem;
		margin: 0;
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
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
	}

	.button-group {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
	}

	button {
		padding: 0.75rem 1.25rem;
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

	.cancel-button {
		background: #6c757d;
		color: white;
	}

	.cancel-button:hover {
		background: #5a6268;
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
