<script lang="ts">
	let { oncreate }: { oncreate: () => void } = $props();
</script>

<div class="flex flex-col items-center px-4 py-16 text-center">
	<svg
		class="size-32 text-ink opacity-25"
		viewBox="0 0 120 120"
		fill="none"
		stroke="currentColor"
		aria-hidden="true"
	>
		<circle cx="60" cy="60" r="43" stroke-width="3" stroke-dasharray="9 9" stroke-linecap="round" />

		<g stroke-width="3" stroke-linecap="round">
			<path d="M40 46h40M40 60h40M40 74h40" />
			<circle cx="70" cy="46" r="5" class="fill-surface" />
			<circle cx="50" cy="60" r="5" class="fill-surface" />
			<circle cx="64" cy="74" r="5" class="fill-surface" />
		</g>
	</svg>

	<h3 class="mt-6 text-lg font-semibold">Crea il primo preset</h3>

	<p class="mt-2 max-w-sm text-sm text-ink/60">
		Un preset conserva i parametri dell'impasto — idratazione, farine e altro ancora. Creane uno per
		iniziare a calcolare.
	</p>

	<button
		type="button"
		class="mt-6 flex items-center gap-2 rounded-md bg-ink px-4 py-2 font-medium text-surface hover:bg-ink/85"
		onclick={oncreate}
	>
		<svg
			class="size-5"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			aria-hidden="true"
		>
			<path d="M12 5v14M5 12h14" />
		</svg>
		Nuovo preset
	</button>
</div>
