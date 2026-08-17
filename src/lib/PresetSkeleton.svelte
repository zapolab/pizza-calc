<script lang="ts">
	const fieldWidths = ['w-28', 'w-24', 'w-20'];
	const rowWidths = ['w-16', 'w-14', 'w-10', 'w-8', 'w-44'];
</script>

<div class="animate-pulse" role="status" aria-label="Caricamento preset">
	<div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
		{#each fieldWidths as width (width)}
			<div>
				<div class="flex h-5 items-center">
					<div class="h-3.5 {width} rounded bg-ink/10"></div>
				</div>
				<div class="mt-1 h-10.5 rounded-md bg-ink/10"></div>
			</div>
		{/each}
	</div>

	<div class="mt-6 rounded-lg border p-4">
		<div class="flex h-5 items-center">
			<div class="h-3.5 w-36 rounded bg-ink/10"></div>
		</div>
	</div>

	<hr class="my-6" />

	<div class="rounded-lg border p-4">
		<div class="space-y-3">
			{#each rowWidths as width (width)}
				<div class="flex h-7 items-center gap-2">
					<div class="h-3.5 {width} rounded bg-ink/10"></div>
					<div class="min-w-4 flex-1"></div>
					<div class="h-4.5 w-16 rounded bg-ink/10"></div>
				</div>
			{/each}
		</div>

		<div class="mt-3 flex h-7 items-center gap-2 border-t pt-3">
			<div class="h-3.5 w-40 rounded bg-ink/10"></div>
			<div class="min-w-4 flex-1"></div>
			<div class="h-5 w-20 rounded bg-ink/10"></div>
		</div>
	</div>

	<hr class="my-6" />

	<div>
		<div class="flex h-5 items-center">
			<div class="h-3.5 w-10 rounded bg-ink/10"></div>
		</div>
		<div class="mt-1 h-28.5 rounded-md bg-ink/10"></div>
	</div>
</div>
