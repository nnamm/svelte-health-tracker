<script lang="ts">
	import Calendar from '$lib/components/calendar/CalendarGrid.svelte';
</script>

<nav>
	<a href="/">Home</a>
</nav>

<main>
	<slot />
	<Calendar />
</main>

<footer>
	<p>@ 2024 Health Tracker</p>
</footer>
