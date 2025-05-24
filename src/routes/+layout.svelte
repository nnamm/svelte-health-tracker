<main>
	<slot />
</main>

<footer>
	<div class="footer-content">
		<div class="footer-text">
			<p class="description">A learning project exploring modern web technologies</p>
			<div class="tech-stack">
				<span>Built with </span>
				<a href="https://svelte.dev" target="_blank" rel="noopener noreferrer">Svelte</a>
				<span> / </span>
				<a href="https://kit.svelte.dev" target="_blank" rel="noopener noreferrer">SvelteKit</a>
				<span> / </span>
				<a href="https://golang.org" target="_blank" rel="noopener noreferrer">Go</a>
				<span> / </span>
				<span>WebGL Graphics Stack</span>
			</div>
		</div>
		<div class="footer-copyright">
			<p>
				&copy; 2025 <a
					href="https://github.com/nnamm"
					target="_blank"
					rel="noopener noreferrer"
					class="github-link"
				>
					nnamm
					<svg
						class="github-icon"
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="currentColor"
						aria-hidden="true"
					>
						<path
							d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
						/>
					</svg>
				</a>
			</p>
		</div>
	</div>
</footer>

<style>
	footer {
		padding: 1.5rem 1rem;
		margin-top: 4rem;
		color: #6b7280;
		background-color: #fafafa;
		border-top: 1px dotted #e5e7eb;
	}

	.footer-content {
		max-width: 480px;
		margin: 0 auto;
		text-align: center;
	}

	.footer-text {
		margin-bottom: 0.5rem;
	}

	.description {
		margin: 0 0 0.5rem;
		font-size: 0.875rem;
		font-weight: 300;
	}

	.tech-stack {
		font-size: 0.8125rem;
		line-height: 1.4;
	}

	.tech-stack a {
		font-weight: 400;
		color: #007bff;
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.tech-stack a:hover {
		color: #374151;
		text-decoration: underline;
	}

	.footer-copyright {
		font-size: 0.8125rem;
	}

	.github-link {
		display: inline-flex;
		gap: 0.375rem;
		align-items: center;
		color: #007bff;
	}

	.github-icon {
		vertical-align: middle;
		color: #007bff;
		transition: opacity 0.2s ease;
	}

	.github-link:hover .github-icon {
		color: #374151;
	}

	.footer-copyright a {
		font-weight: 400;
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.footer-copyright a:hover {
		color: #374151;
		text-decoration: underline;
	}

	@media (width <= 480px) {
		footer {
			padding: 1.5rem 1rem 1rem;
		}

		.tech-stack {
			font-size: 0.75rem;
			line-height: 1.5;
		}

		.description {
			font-size: 0.8125rem;
		}
	}
</style>
