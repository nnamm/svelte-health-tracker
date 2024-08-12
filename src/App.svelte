<script>
  import Calendar from 'svelte-calendar';
  import HealthForm from './components/HealthForm.svelte';
  import GeometricPattern from './components/GeometricPattern.svelte';
</script>

<main>
  <h1>Health Tracker</h1>
  <div class="container">
    <Calendar />
    <HealthForm />
    <GeometricPattern />
  </div>
</main>

<style>
  .container {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
  }
</style>
