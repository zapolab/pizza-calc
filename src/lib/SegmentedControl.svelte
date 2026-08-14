<script lang="ts" generics="T">
	type Props = {
		options: readonly { id: T; label: string }[];
		value: T;
		label: string;
		/** Span the parent and split it into equal segments, instead of sizing to content. */
		fill?: boolean;
	};

	let { options, value = $bindable(), label, fill = false }: Props = $props();
</script>

<div
	role="group"
	aria-label={label}
	class="flex rounded-lg bg-ink/5 p-0.5 text-sm {fill ? 'w-full' : ''}"
>
	{#each options as option (String(option.id))}
		<button
			type="button"
			aria-pressed={value === option.id}
			class="rounded-md px-3 py-1 {fill ? 'flex-1' : 'min-w-14'} {value === option.id
				? 'bg-raised font-medium shadow-sm'
				: 'text-ink/60 hover:text-ink'}"
			onclick={() => (value = option.id)}
		>
			{option.label}
		</button>
	{/each}
</div>
