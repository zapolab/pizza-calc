<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { DARK_CLASS } from '$lib/theme';
	import { theme } from '$lib/theme.svelte';

	let { children } = $props();

	$effect(() => {
		document.documentElement.classList.toggle(DARK_CLASS, theme.current === 'dark');
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
