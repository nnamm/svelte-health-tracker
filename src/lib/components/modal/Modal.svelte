<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		isOpen = false,
		close,
		children
	} = $props<{
		isOpen: boolean;
		close?: () => void;
		children?: Snippet;
	}>();

	let modalContent = $state<HTMLElement | null>(null);

	function closeModal() {
		close?.();
	}

	// Close modal by ESC key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen) {
			closeModal();
			event.preventDefault();
			event.stopPropagation();
		}
	}

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
	<div class="modal-overlay" onclick={closeModal} onkeydown={handleKeydown} role="presentation">
		<div
			class="modal-content"
			bind:this={modalContent}
			onclick={(e) => e.stopPropagation()}
			onkeydown={() => {}}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<button type="button" class="close-button" onclick={closeModal} aria-label="Close modal">
				&times;
			</button>
			{@render children?.()}
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
		animation: fadeIn 0.2s ease;
	}

	.modal-content {
		position: relative;
		background-color: white;
		padding: 2rem;
		border-radius: 8px;
		max-width: 90%;
		max-height: 90vh;
		width: 500px;
		overflow-y: auto;
		z-index: 1001;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
		animation: slideIn 0.3s ease;
	}

	.close-button {
		position: absolute;
		top: 0.75rem;
		right: 1rem;
		font-size: 1.5rem;
		background: none;
		border: none;
		cursor: pointer;
		color: #666;
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
			transform: translateY(-20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
</style>
