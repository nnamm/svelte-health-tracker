import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import HealthDataModal from './HealthDataModal.svelte';
import * as healthDataService from '../services/healthDataService';
import * as navigation from '$app/navigation';
import type { HealthRecord } from '$lib/types/HealthRecord';
import type { DailyHealthRecord } from '$lib/features/calendar/types';

// Mock external dependencies
vi.mock('../services/healthDataService');
vi.mock('$app/navigation');

// Type the mocked modules
const mockedHealthDataService = vi.mocked(healthDataService);
const mockedNavigation = vi.mocked(navigation);

describe('HealthDataModal Integration Tests', () => {
	// Test data fixtures
	const mockHealthRecord: HealthRecord = {
		id: 1,
		date: '2023-05-15',
		step_count: 8500,
		created_at: '2023-05-15T10:00:00Z',
		updated_at: '2023-05-15T10:00:00Z'
	};

	const mockDailyHealthRecord: DailyHealthRecord = {
		date: '2023-05-15',
		stepCount: 8500,
		hasHealthData: true
	};

	const mockDailyHealthRecordEmpty: DailyHealthRecord = {
		date: '2023-05-15',
		stepCount: 0,
		hasHealthData: false
	};

	// Mock callbacks
	const mockOnClose = vi.fn();
	const mockOnDataUpdated = vi.fn();

	// User event setup
	let user: ReturnType<typeof userEvent.setup>;

	beforeEach(() => {
		// Clear all mocks before each test
		vi.clearAllMocks();
		
		// Setup user event
		user = userEvent.setup();

		// Setup default mock implementations
		mockedHealthDataService.getHealthRecordByDate.mockResolvedValue({
			success: true,
			data: mockHealthRecord
		});

		mockedHealthDataService.createHealthRecord.mockResolvedValue({
			success: true,
			data: mockHealthRecord
		});

		mockedHealthDataService.updateHealthRecord.mockResolvedValue({
			success: true,
			data: { ...mockHealthRecord, step_count: 10000 }
		});

		mockedHealthDataService.deleteHealthRecord.mockResolvedValue({
			success: true,
			data: true
		});

		mockedNavigation.goto.mockImplementation(() => Promise.resolve());
	});

	afterEach(() => {
		// Clean up any remaining DOM elements
		document.body.innerHTML = '';
	});

	describe('Modal Integration with Existing Data', () => {
		it('should load and display existing health data when modal opens', async () => {
			// Arrange
			render(HealthDataModal, {
				props: {
					isOpen: true,
					date: '2023-05-15',
					dailyHealthRecord: mockDailyHealthRecord,
					onClose: mockOnClose,
					onDataUpdated: mockOnDataUpdated
				}
			});

			// Act & Assert
			// Check that the modal is rendered
			expect(screen.getByRole('dialog')).toBeInTheDocument();
			
			// Wait for data to load
			await waitFor(() => {
				expect(mockedHealthDataService.getHealthRecordByDate).toHaveBeenCalledWith('2023-05-15');
			});

			// Check that the step count input shows the loaded data
			await waitFor(() => {
				const stepInput = screen.getByLabelText(/step count/i) as HTMLInputElement;
				expect(stepInput.value).toBe('8500');
			});

			// Check that the formatted date is displayed
			expect(screen.getByText(/May 15, 2023/i)).toBeInTheDocument();
		});

		it('should handle user interaction flow: edit and save data', async () => {
			// Arrange
			render(HealthDataModal, {
				props: {
					isOpen: true,
					date: '2023-05-15',
					dailyHealthRecord: mockDailyHealthRecord,
					onClose: mockOnClose,
					onDataUpdated: mockOnDataUpdated
				}
			});

			// Wait for initial data load
			await waitFor(() => {
				expect(screen.getByLabelText(/step count/i)).toBeInTheDocument();
			});

			// Act - Edit the step count
			const stepInput = screen.getByLabelText(/step count/i);
			await user.clear(stepInput);
			await user.type(stepInput, '10000');

			// Act - Save the data
			const saveButton = screen.getByRole('button', { name: /update/i });
			await user.click(saveButton);

			// Assert
			await waitFor(() => {
				expect(mockedHealthDataService.updateHealthRecord).toHaveBeenCalledWith(
					expect.objectContaining({
						id: 1,
						date: '2023-05-15',
						step_count: 10000
					})
				);
			});

			// Check that callbacks are called
			expect(mockOnDataUpdated).toHaveBeenCalledWith(
				expect.objectContaining({ step_count: 10000 })
			);
			expect(mockOnClose).toHaveBeenCalled();
		});

		it('should handle delete operation with confirmation', async () => {
			// Arrange
			render(HealthDataModal, {
				props: {
					isOpen: true,
					date: '2023-05-15',
					dailyHealthRecord: mockDailyHealthRecord,
					onClose: mockOnClose,
					onDataUpdated: mockOnDataUpdated
				}
			});

			// Wait for data to load
			await waitFor(() => {
				expect(screen.getByLabelText(/step count/i)).toBeInTheDocument();
			});

			// Act - Click delete button
			const deleteButton = screen.getByRole('button', { name: /delete/i });
			await user.click(deleteButton);

			// Assert - Check that delete service is called
			await waitFor(() => {
				expect(mockedHealthDataService.deleteHealthRecord).toHaveBeenCalledWith('2023-05-15');
			});

			// Check that callbacks are called
			expect(mockOnDataUpdated).toHaveBeenCalledWith(null);
			expect(mockOnClose).toHaveBeenCalled();
		});
	});

	describe('Modal Integration with New Data', () => {
		it('should create new health record when no existing data', async () => {
			// Arrange
			render(HealthDataModal, {
				props: {
					isOpen: true,
					date: '2023-05-16',
					dailyHealthRecord: mockDailyHealthRecordEmpty,
					onClose: mockOnClose,
					onDataUpdated: mockOnDataUpdated
				}
			});

			// Wait for modal to initialize
			await waitFor(() => {
				expect(screen.getByLabelText(/step count/i)).toBeInTheDocument();
			});

			// Act - Enter new data
			const stepInput = screen.getByLabelText(/step count/i);
			await user.clear(stepInput);
			await user.type(stepInput, '7500');

					// Act - Save the data
		const saveButton = screen.getByRole('button', { name: /save/i });
		await user.click(saveButton);

		// Assert
		await waitFor(() => {
			expect(mockedHealthDataService.createHealthRecord).toHaveBeenCalledWith(
				expect.objectContaining({
					date: '2023-05-16',
					step_count: 7500
				})
			);
		});

			expect(mockOnDataUpdated).toHaveBeenCalled();
			expect(mockOnClose).toHaveBeenCalled();
		});
	});

	describe('Navigation Integration', () => {
		it('should navigate to visualization page when visualization button is clicked', async () => {
			// Arrange
			render(HealthDataModal, {
				props: {
					isOpen: true,
					date: '2023-05-15',
					dailyHealthRecord: mockDailyHealthRecord,
					onClose: mockOnClose,
					onDataUpdated: mockOnDataUpdated
				}
			});

			// Wait for data to load
			await waitFor(() => {
				expect(screen.getByLabelText(/step count/i)).toBeInTheDocument();
			});

					// Act - Click visualization button
		const visualizationButton = screen.getByRole('button', { name: /view/i });
		await user.click(visualizationButton);

			// Assert
			expect(mockedNavigation.goto).toHaveBeenCalledWith('/health/2023-05-15');
			expect(mockOnClose).toHaveBeenCalled();
		});
	});

	describe('Error Handling Integration', () => {
		it('should display error message when API call fails', async () => {
			// Arrange - Mock API failure
			mockedHealthDataService.getHealthRecordByDate.mockResolvedValue({
				success: false,
				data: null,
				error: 'Network error occurred'
			});

			render(HealthDataModal, {
				props: {
					isOpen: true,
					date: '2023-05-15',
					dailyHealthRecord: mockDailyHealthRecord,
					onClose: mockOnClose,
					onDataUpdated: mockOnDataUpdated
				}
			});

			// Assert - Check that error message is displayed
			await waitFor(() => {
				expect(screen.getByText(/network error occurred/i)).toBeInTheDocument();
			});
		});

		it('should handle save operation failure gracefully', async () => {
			// Arrange
			mockedHealthDataService.updateHealthRecord.mockResolvedValue({
				success: false,
				data: null,
				error: 'Failed to save data'
			});

			render(HealthDataModal, {
				props: {
					isOpen: true,
					date: '2023-05-15',
					dailyHealthRecord: mockDailyHealthRecord,
					onClose: mockOnClose,
					onDataUpdated: mockOnDataUpdated
				}
			});

			// Wait for data to load
			await waitFor(() => {
				expect(screen.getByLabelText(/step count/i)).toBeInTheDocument();
			});

					// Act - Try to save
		const saveButton = screen.getByRole('button', { name: /update/i });
		await user.click(saveButton);

			// Assert - Check that error is displayed and callbacks are not called
			await waitFor(() => {
				expect(screen.getByText(/failed to save data/i)).toBeInTheDocument();
			});

			expect(mockOnDataUpdated).not.toHaveBeenCalled();
			expect(mockOnClose).not.toHaveBeenCalled();
		});
	});

	describe('Modal State Management Integration', () => {
		it('should reset state when modal is closed and reopened', async () => {
			// Arrange - Render with modal closed
			const { rerender } = render(HealthDataModal, {
				props: {
					isOpen: false,
					date: '2023-05-15',
					dailyHealthRecord: mockDailyHealthRecord,
					onClose: mockOnClose,
					onDataUpdated: mockOnDataUpdated
				}
			});

			// Act - Open modal
			await rerender({
				isOpen: true,
				date: '2023-05-15',
				dailyHealthRecord: mockDailyHealthRecord,
				onClose: mockOnClose,
				onDataUpdated: mockOnDataUpdated
			});

			// Wait for data to load
			await waitFor(() => {
				expect(screen.getByLabelText(/step count/i)).toBeInTheDocument();
			});

			// Act - Close modal
			await rerender({
				isOpen: false,
				date: '2023-05-15',
				dailyHealthRecord: mockDailyHealthRecord,
				onClose: mockOnClose,
				onDataUpdated: mockOnDataUpdated
			});

			// Act - Reopen modal with different date
			await rerender({
				isOpen: true,
				date: '2023-05-16',
				dailyHealthRecord: mockDailyHealthRecordEmpty,
				onClose: mockOnClose,
				onDataUpdated: mockOnDataUpdated
			});

			// Assert - Check that new date is loaded
			await waitFor(() => {
				expect(screen.getByText(/May 16, 2023/i)).toBeInTheDocument();
			});
		});
	});

	describe('Accessibility Integration', () => {
		it('should maintain proper focus management', async () => {
			// Arrange
			render(HealthDataModal, {
				props: {
					isOpen: true,
					date: '2023-05-15',
					dailyHealthRecord: mockDailyHealthRecord,
					onClose: mockOnClose,
					onDataUpdated: mockOnDataUpdated
				}
			});

			// Wait for modal to load
			await waitFor(() => {
				expect(screen.getByRole('dialog')).toBeInTheDocument();
			});

			// Assert - Check that modal has proper ARIA attributes
			const modal = screen.getByRole('dialog');
			expect(modal).toHaveAttribute('aria-modal', 'true');

			// Check that step input is focusable
			const stepInput = screen.getByLabelText(/step count/i);
			expect(stepInput).toBeInTheDocument();
			
			// Focus should be manageable
			stepInput.focus();
			expect(document.activeElement).toBe(stepInput);
		});

		it('should handle keyboard navigation properly', async () => {
			// Arrange
			render(HealthDataModal, {
				props: {
					isOpen: true,
					date: '2023-05-15',
					dailyHealthRecord: mockDailyHealthRecord,
					onClose: mockOnClose,
					onDataUpdated: mockOnDataUpdated
				}
			});

			// Wait for modal to load
			await waitFor(() => {
				expect(screen.getByLabelText(/step count/i)).toBeInTheDocument();
			});

			// Act - Use keyboard to navigate and submit
			const stepInput = screen.getByLabelText(/step count/i);
			await user.click(stepInput);
			await user.keyboard('{Control>}a{/Control}');
			await user.keyboard('9000');
			await user.keyboard('{Enter}');

			// Assert - Check that form submission works via keyboard
			await waitFor(() => {
				expect(mockedHealthDataService.updateHealthRecord).toHaveBeenCalledWith(
					expect.objectContaining({
						step_count: 9000
					})
				);
			});
		});
	});

	describe('Performance Integration', () => {
		it('should only call API when form is submitted, not during typing', async () => {
			// Arrange
			render(HealthDataModal, {
				props: {
					isOpen: true,
					date: '2023-05-15',
					dailyHealthRecord: mockDailyHealthRecord,
					onClose: mockOnClose,
					onDataUpdated: mockOnDataUpdated
				}
			});

			// Wait for initial render
			await waitFor(() => {
				expect(screen.getByLabelText(/step count/i)).toBeInTheDocument();
			});

			// Act - Type in input field
			const stepInput = screen.getByLabelText(/step count/i);
			await user.clear(stepInput);
			await user.type(stepInput, '9000');

			// Assert - Check that API is not called during typing
			expect(mockedHealthDataService.updateHealthRecord).not.toHaveBeenCalled();
			
			// Only when save is clicked should API be called
			const saveButton = screen.getByRole('button', { name: /update/i });
			await user.click(saveButton);

			await waitFor(() => {
				expect(mockedHealthDataService.updateHealthRecord).toHaveBeenCalledWith(
					expect.objectContaining({
						step_count: 9000
					})
				);
			});
		});
	});
}); 