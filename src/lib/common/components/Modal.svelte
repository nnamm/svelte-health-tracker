<script lang="ts">
	/**
	 * Modal component that displays content in a centered overlay
	 *
	 * @component
	 * @example
	 * ```svelte
	 * <Modal isOpen={showModal} onClose={() => showModal = false}>
	 *   {() => (
	 *     <div>
	 *       <h2>Modal Title</h2>
	 *       <p>Modal content here</p>
	 *     </div>
	 *   )}
	 * </Modal>
	 * ```
	 */
	import type { Snippet } from 'svelte';

	/**
	 * Component props
	 * @property {boolean} isOpen - Whether the modal is currently visible
	 * @property {Function} [onClose] - Callback function to execute when modal is closed
	 * @property {Snippet} [children] - Content to render inside the modal
	 */

	/**
	 * Modal props with default values
	 */
	let {
		isOpen = false,
		onClose,
		children = undefined
	} = $props<{
		isOpen: boolean;
		onClose?: () => void;
		children?: Snippet;
	}>();

	/** Reference to the modal content DOM element for focus management */
	let modalContent = $state<HTMLElement | null>(null);

	/**
	 * Handles the modal close action and invokes the onClose callback if provided
	 */
	function handleClose(): void {
		onClose?.();
	}

	/**
	 * Handles keyboard events for accessibility
	 * Closes the modal when the Escape key is pressed
	 * @param {KeyboardEvent} event - The keyboard event
	 */
	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape' && isOpen) {
			handleClose();
			event.preventDefault();
			event.stopPropagation();
		}
	}

	/**
	 * Effect to manage modal behavior when opened or closed
	 * - Prevents background scrolling when modal is open
	 * - Adds/removes keyboard event listeners
	 * - Manages focus for accessibility
	 * - Cleans up when component is unmounted
	 */
	$effect(() => {
		if (isOpen) {
			// Prevent scrolling when modal is open
			document.body.style.overflow = 'hidden';
			// Add event listener for keydown
			window.addEventListener('keydown', handleKeydown);
			// Focus on the modal content
			if (modalContent) {
				setTimeout(() => {
					modalContent?.focus();
				}, 50);
			}
		} else {
			// Allow scrolling when modal is closed
			document.body.style.overflow = '';
			// Remove event listener for keydown
			window.removeEventListener('keydown', handleKeydown);
		}

		// Cleanup when component is unmounted
		return () => {
			document.body.style.overflow = '';
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

{#if isOpen}
	<div class="modal-overlay" onclick={handleClose} onkeydown={handleKeydown} role="presentation">
		<div
			class="modal-content"
			bind:this={modalContent}
			onclick={(e) => e.stopPropagation()}
			onkeydown={() => {}}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<button type="button" class="close-button" onclick={handleClose} aria-label="Close modal">
				&times;
			</button>
			{@render children?.()}
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgb(0 0 0 / 50%);
		animation: fadeIn 0.2s ease;
	}

	.modal-content {
		position: relative;
		z-index: 1001;
		width: 500px;
		max-width: 90%;
		max-height: 90vh;
		padding: 2rem;
		overflow-y: auto;
		background-color: white;
		border-radius: 8px;
		box-shadow: 0 4px 20px rgb(0 0 0 / 15%);
		animation: slideIn 0.3s ease;
	}

	.close-button {
		position: absolute;
		top: 0.75rem;
		right: 1rem;
		font-size: 1.5rem;
		color: #666;
		cursor: pointer;
		background: none;
		border: none;
		transition: color 0.2s;
	}

	.close-button:hover {
		color: #000;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}

		to {
			opacity: 1;
		}
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-20px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
