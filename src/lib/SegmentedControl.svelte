<script lang="ts" generics="T">
	type Props = {
		options: readonly { id: T; label: string }[];
		value: T;
		label: string;
	};

	let { options, value = $bindable(), label }: Props = $props();
</script>

<div role="group" aria-label={label} class="flex rounded-lg bg-black/5 p-0.5 text-sm">
	{#each options as option (String(option.id))}
		<button
			type="button"
			aria-pressed={value === option.id}
			class="min-w-14 rounded-md px-3 py-1 {value === option.id
				? 'bg-white font-medium shadow-sm'
				: 'text-black/60 hover:text-black'}"
			onclick={() => (value = option.id)}
		>
			{option.label}
		</button>
	{/each}
</div>
