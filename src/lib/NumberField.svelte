<script lang="ts">
	type Props = {
		label: string;
		value: number;
		min: number;
		max: number;
		unit?: string;
		step?: number;
		error?: string;
	};

	let { label, value = $bindable(), min, max, unit, step = 1, error }: Props = $props();

	const id = $props.id();
	const invalid = $derived(Boolean(error));

	function nudge(delta: number) {
		const from = Number.isFinite(value) ? value : min;
		value = Math.min(max, Math.max(min, from + delta));
	}
</script>

<div>
	<label for={id} class="text-sm">{label}</label>

	<div
		class="mt-1 flex items-stretch overflow-hidden rounded-md border focus-within:border-black/60
			{invalid ? 'border-red-600' : 'border-black/25'}"
	>
		<button
			type="button"
			class="px-3 text-lg leading-none select-none hover:bg-black/5 disabled:opacity-30"
			aria-label="Diminuisci: {label}"
			disabled={value <= min}
			onclick={() => nudge(-step)}
		>
			−
		</button>

		<label for={id} class="flex min-w-0 flex-1 items-center">
			<input
				{id}
				type="number"
				{min}
				{max}
				{step}
				bind:value
				aria-invalid={invalid}
				class="w-full min-w-0 rounded-none border-0 text-right focus:ring-0 {unit
					? 'pr-1'
					: 'pr-3'}"
			/>
			{#if unit}
				<span class="shrink-0 pr-3 pl-1 text-sm whitespace-nowrap text-black/50" aria-hidden="true">
					{unit}
				</span>
			{/if}
		</label>

		<button
			type="button"
			class="px-3 text-lg leading-none select-none hover:bg-black/5 disabled:opacity-30"
			aria-label="Aumenta: {label}"
			disabled={value >= max}
			onclick={() => nudge(step)}
		>
			+
		</button>
	</div>

	{#if error}
		<p class="mt-1 text-sm text-red-700">{error}</p>
	{/if}
</div>
