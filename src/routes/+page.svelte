<script lang="ts">
	import { cloneValues, defaultValues, type Preset } from '$lib/presets';

	// Placeholder until the sqlite backend is in place.
	let presets = $state<Preset[]>([
		{ id: 1, name: 'Napoletana', values: cloneValues(defaultValues) },
		{
			id: 2,
			name: 'Teglia romana',
			values: { ...defaultValues, doughBallWeight: 700, hydration: 80, panPizza: true }
		}
	]);
	let nextId = $state(3);

	let selectedId = $state<number | null>(1);
	let values = $state(cloneValues(presets[0].values));

	let sidebarOpen = $state(true);
	let mobileSidebarOpen = $state(false);
	let renaming = $state(false);
	let deleteDialog = $state<HTMLDialogElement | null>(null);

	const selectedPreset = $derived(presets.find((p) => p.id === selectedId) ?? null);
	const dirty = $derived(
		selectedPreset !== null && JSON.stringify(selectedPreset.values) !== JSON.stringify(values)
	);

	function selectPreset(preset: Preset) {
		selectedId = preset.id;
		values = cloneValues(preset.values);
		renaming = false;
		mobileSidebarOpen = false;
	}

	function createPreset() {
		const preset: Preset = { id: nextId++, name: 'Nuovo preset', values: cloneValues(values) };
		presets.push(preset);
		selectedId = preset.id;
		renaming = true;
		mobileSidebarOpen = false;
	}

	function savePreset() {
		if (!selectedPreset) return;
		selectedPreset.values = cloneValues(values);
	}

	function deletePreset() {
		const i = presets.findIndex((p) => p.id === selectedId);
		if (i === -1) return;
		presets.splice(i, 1);
		const next = presets[i] ?? presets[i - 1] ?? null;
		selectedId = next?.id ?? null;
		if (next) values = cloneValues(next.values);
		renaming = false;
		deleteDialog?.close();
	}

	function autofocus(node: HTMLInputElement) {
		node.focus();
		node.select();
	}

	// Placeholder: the formulas are not implemented yet.
	const results = {
		flour: 0,
		water: 0,
		salt: 0,
		oil: 0,
		dryYeast: 0,
		wetYeast: 0
	};
</script>

<div class="flex min-h-screen">
	{#if mobileSidebarOpen}
		<button
			type="button"
			class="fixed inset-0 z-30 bg-black/40 sm:hidden"
			aria-label="Chiudi barra laterale"
			onclick={() => (mobileSidebarOpen = false)}
		></button>
	{/if}

	<aside
		class="fixed inset-y-0 left-0 z-40 w-56 shrink-0 overflow-y-auto border-r bg-white transition-transform
			sm:static sm:translate-x-0 sm:bg-transparent sm:transition-none
			{mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
			{sidebarOpen ? 'sm:w-56' : 'sm:w-12'}"
	>
		<div class="flex items-center justify-between gap-2 p-2">
			<span class="text-sm font-semibold {sidebarOpen ? '' : 'hidden max-sm:inline'}">Preset</span>

			<button
				type="button"
				class="rounded p-1 hover:bg-black/5 sm:hidden"
				aria-label="Chiudi barra laterale"
				onclick={() => (mobileSidebarOpen = false)}
			>
				<svg
					class="size-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M18 6L6 18M6 6l12 12" />
				</svg>
			</button>

			<button
				type="button"
				class="rounded p-1 hover:bg-black/5 max-sm:hidden"
				aria-label={sidebarOpen ? 'Comprimi barra laterale' : 'Espandi barra laterale'}
				title={sidebarOpen ? 'Comprimi' : 'Espandi'}
				onclick={() => (sidebarOpen = !sidebarOpen)}
			>
				<svg
					class="size-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d={sidebarOpen ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
				</svg>
			</button>
		</div>

		<div class={sidebarOpen ? '' : 'hidden max-sm:block'}>
			<ul class="px-2">
				{#each presets as preset (preset.id)}
					<li>
						<button
							type="button"
							class="w-full truncate rounded px-2 py-1.5 text-left text-sm hover:bg-black/5
								{preset.id === selectedId ? 'bg-black/10 font-medium' : ''}"
							onclick={() => selectPreset(preset)}
						>
							{preset.name}
						</button>
					</li>
				{/each}
			</ul>

			<div class="p-2">
				<button
					type="button"
					class="flex w-full items-center gap-2 rounded border px-2 py-1.5 text-sm hover:bg-black/5"
					onclick={createPreset}
				>
					<svg
						class="size-4"
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
		</div>
	</aside>

	<main class="mx-auto w-full max-w-3xl p-4">
		<div class="mb-4 flex items-center gap-2 border-b pb-2">
			<button
				type="button"
				class="rounded p-1.5 hover:bg-black/5 sm:hidden"
				aria-label="Apri barra laterale"
				onclick={() => (mobileSidebarOpen = true)}
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
					<path d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			</button>

			{#if renaming && selectedPreset}
				<input
					type="text"
					class="min-w-0 flex-1 text-lg"
					bind:value={selectedPreset.name}
					use:autofocus
					onblur={() => (renaming = false)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === 'Escape') e.currentTarget.blur();
					}}
				/>
			{:else}
				<h2 class="min-w-0 flex-1 truncate text-lg font-semibold">
					{selectedPreset?.name ?? 'Nessun preset'}
					{#if dirty}<span class="text-sm font-normal">•</span>{/if}
				</h2>
			{/if}

			<button
				type="button"
				class="rounded p-1.5 hover:bg-black/5 disabled:opacity-40"
				aria-label="Rinomina preset"
				title="Rinomina"
				disabled={!selectedPreset}
				onclick={() => (renaming = true)}
			>
				<svg
					class="size-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M12 20h9" />
					<path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
				</svg>
			</button>

			<button
				type="button"
				class="rounded p-1.5 hover:bg-black/5 disabled:opacity-40"
				aria-label="Salva parametri nel preset"
				title="Salva nel preset"
				disabled={!dirty}
				onclick={savePreset}
			>
				<svg
					class="size-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
					<path d="M17 21v-8H7v8M7 3v5h8" />
				</svg>
			</button>

			<button
				type="button"
				class="rounded p-1.5 hover:bg-black/5 disabled:opacity-40"
				aria-label="Elimina preset"
				title="Elimina preset"
				disabled={!selectedPreset}
				onclick={() => deleteDialog?.showModal()}
			>
				<svg
					class="size-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2" />
					<path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
					<path d="M10 11v6M14 11v6" />
				</svg>
			</button>
		</div>

		<dialog
			bind:this={deleteDialog}
			class="m-auto max-w-sm rounded border bg-white p-4 backdrop:bg-black/40"
		>
			<h3 class="text-lg font-semibold">Eliminare il preset?</h3>
			<p class="mt-2 text-sm">
				Il preset <strong>{selectedPreset?.name}</strong> verrà eliminato definitivamente.
			</p>
			<div class="mt-4 flex justify-end gap-2">
				<button
					type="button"
					class="rounded border px-3 py-1.5 text-sm hover:bg-black/5"
					onclick={() => deleteDialog?.close()}
				>
					Annulla
				</button>
				<button
					type="button"
					class="rounded border border-red-600 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
					onclick={deletePreset}
				>
					Elimina
				</button>
			</div>
		</dialog>

		<form>
			<div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
				<label class="block">
					<span class="text-sm">Numero panetti</span>
					<input
						type="number"
						min="1"
						step="1"
						bind:value={values.doughBallCount}
						class="mt-1 w-full"
					/>
				</label>

				<label class="block">
					<span class="text-sm">Peso panetti (grammi)</span>
					<input
						type="number"
						min="0"
						step="1"
						bind:value={values.doughBallWeight}
						class="mt-1 w-full"
					/>
				</label>

				<label class="block">
					<span class="text-sm">Idratazione impasto (%)</span>
					<input
						type="number"
						min="50"
						max="100"
						step="1"
						bind:value={values.hydration}
						class="mt-1 w-full"
					/>
				</label>
			</div>

			<details class="mt-6 rounded border p-3">
				<summary class="cursor-pointer text-sm select-none">Parametri avanzati</summary>

				<div class="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
					<label class="block">
						<span class="text-sm">Ore di lievitazione totali</span>
						<input
							type="number"
							min="0"
							step="1"
							bind:value={values.proofingHours}
							class="mt-1 w-full"
						/>
					</label>

					<label class="block">
						<span class="text-sm">Ore di riposo in frigorifero (sul totale)</span>
						<input
							type="number"
							min="0"
							max={values.proofingHours}
							step="1"
							bind:value={values.fridgeHours}
							class="mt-1 w-full"
						/>
					</label>

					<label class="block">
						<span class="text-sm">Sale (grammi per litro)</span>
						<input
							type="number"
							min="0"
							step="1"
							bind:value={values.saltPerLiter}
							class="mt-1 w-full"
						/>
					</label>

					<label class="block">
						<span class="text-sm">Olio (grammi per litro)</span>
						<input
							type="number"
							min="0"
							step="1"
							bind:value={values.oilPerLiter}
							class="mt-1 w-full"
						/>
					</label>

					<label class="block">
						<span class="text-sm">Temperatura ambiente (°C)</span>
						<input type="number" step="1" bind:value={values.roomTemperature} class="mt-1 w-full" />
					</label>

					<fieldset>
						<legend class="text-sm">Pizza in teglia</legend>
						<div class="mt-1 flex h-full justify-start gap-4">
							<label class="flex items-center gap-2">
								<input type="radio" value={false} bind:group={values.panPizza} />
								<span>No</span>
							</label>
							<label class="flex items-center gap-2">
								<input type="radio" value={true} bind:group={values.panPizza} />
								<span>Si</span>
							</label>
						</div>
					</fieldset>
				</div>
			</details>
		</form>

		<hr class="my-6" />

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<p class="rounded border p-3 text-center">Farina: {results.flour} g</p>
			<p class="rounded border p-3 text-center">Acqua: {results.water} g</p>
			<p class="rounded border p-3 text-center">Sale: {results.salt} g</p>
			<p class="rounded border p-3 text-center">Olio: {results.oil} g</p>
			<p class="rounded border p-3 text-center">Lievito di birra secco: {results.dryYeast} g</p>
			<p class="rounded border p-3 text-center">Lievito di birra fresco: {results.wetYeast} g</p>
		</div>
	</main>
</div>
