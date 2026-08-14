<script lang="ts">
	import { computeResults } from '$lib/dough';
	import NumberField from '$lib/NumberField.svelte';
	import SegmentedControl from '$lib/SegmentedControl.svelte';
	import { flourTypeName, flourTypes, nextFlourTypeId } from '$lib/flours';
	import {
		cloneValues,
		defaultValues,
		limits,
		MAX_FLOURS,
		validateValues,
		type Preset,
		type YeastKind
	} from '$lib/presets';

	const yeastKinds: { id: YeastKind; label: string }[] = [
		{ id: 'dry', label: 'Secco' },
		{ id: 'fresh', label: 'Fresco' }
	];

	const panPizzaOptions = [
		{ id: false, label: 'No' },
		{ id: true, label: 'Sì' }
	];

	// Placeholder until the sqlite backend is in place.
	let presets = $state<Preset[]>([
		{ id: 1, name: 'Napoletana', values: cloneValues(defaultValues) },
		{
			id: 2,
			name: 'Teglia romana',
			values: {
				...cloneValues(defaultValues),
				doughBallWeight: 700,
				hydration: 80,
				panPizza: true
			}
		}
	]);
	let nextId = $state(3);

	let selectedId = $state<number | null>(1);
	let values = $state(cloneValues(presets[0].values));

	let sidebarOpen = $state(true);
	let mobileSidebarOpen = $state(false);
	let advancedOpen = $state(false);
	let renaming = $state(false);
	let deleteDialog = $state<HTMLDialogElement | null>(null);

	const errors = $derived(validateValues(values));
	const hasErrors = $derived(Object.keys(errors).length > 0);
	const hasAdvancedErrors = $derived(
		Boolean(
			errors.proofingHours ||
			errors.fridgeHours ||
			errors.saltPerLiter ||
			errors.oilPerLiter ||
			errors.roomTemperature ||
			errors.flours ||
			errors.flourPercents
		)
	);

	// An error inside the collapsed section would go unnoticed.
	$effect(() => {
		if (hasAdvancedErrors) advancedOpen = true;
	});

	const selectedPreset = $derived(presets.find((p) => p.id === selectedId) ?? null);

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
		const snapshot = cloneValues(values);
		if (selectedPreset) selectedPreset.values = snapshot;
	}

	// Autosave: every field change lands in the selected preset.
	$effect(savePreset);

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

	function addFlour() {
		const used = values.flours.map((flour) => flour.flourTypeId);
		values.flours.push({ flourTypeId: nextFlourTypeId(used), percent: 0 });
	}

	function removeFlour(index: number) {
		values.flours.splice(index, 1);
	}

	function autofocus(node: HTMLInputElement) {
		node.focus();
		node.select();
	}

	const results = $derived(computeResults(values));
	// With one flour the split is not listed, so its grade rides on the `Farina` row instead.
	const singleFlourName = $derived(
		results.flours.length === 1
			? flourTypes.find((type) => type.id === results.flours[0].flourTypeId)?.name
			: undefined
	);
	const yeast = $derived(
		values.yeastKind === 'dry'
			? { label: 'Lievito di birra secco', amount: results.dryYeast }
			: { label: 'Lievito di birra fresco', amount: results.wetYeast }
	);
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
			class="m-auto max-w-sm rounded-lg border bg-white p-4 backdrop:bg-black/40"
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
				<NumberField
					label="Numero panetti"
					min={limits.doughBallCount.min}
					max={limits.doughBallCount.max}
					bind:value={values.doughBallCount}
					error={errors.doughBallCount}
				/>

				<NumberField
					label="Peso panetti"
					unit="g"
					min={limits.doughBallWeight.min}
					max={limits.doughBallWeight.max}
					bind:value={values.doughBallWeight}
					error={errors.doughBallWeight}
				/>

				<NumberField
					label="Idratazione"
					unit="%"
					min={limits.hydration.min}
					max={limits.hydration.max}
					bind:value={values.hydration}
					error={errors.hydration}
				/>
			</div>

			<details
				bind:open={advancedOpen}
				class="mt-6 rounded-lg border p-4 {hasAdvancedErrors ? 'border-red-600' : ''}"
			>
				<summary
					class="cursor-pointer text-sm select-none {hasAdvancedErrors ? 'text-red-600' : ''}"
				>
					Parametri avanzati
				</summary>

				<div class="mt-4 space-y-3">
					{#each values.flours as flour, i (i)}
						<div class="flex flex-col gap-2 sm:flex-row sm:items-start">
							<div class="min-w-0 flex-1">
								<label for="flour-{i}" class="text-sm">
									{values.flours.length > 1 ? `Farina ${i + 1}` : 'Farina'}
								</label>
								<select
									id="flour-{i}"
									bind:value={flour.flourTypeId}
									class="mt-1 w-full rounded-md border-black/25"
								>
									{#each flourTypes as flourType (flourType.id)}
										<option value={flourType.id}>{flourType.name}</option>
									{/each}
								</select>
							</div>

							<div class="flex items-center gap-2 sm:contents">
								<div class="min-w-0 flex-1 sm:w-44 sm:flex-none">
									<NumberField
										label="Percentuale"
										unit="%"
										min={limits.flourPercent.min}
										max={limits.flourPercent.max}
										bind:value={flour.percent}
										error={errors.flourPercents?.[i]}
									/>
								</div>

								{#if values.flours.length > 1}
									<button
										type="button"
										class="mt-7 flex h-10.5 w-10 items-center justify-center rounded p-1.5 hover:bg-black/5"
										aria-label="Rimuovi farina {i + 1}"
										title="Rimuovi"
										onclick={() => removeFlour(i)}
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
								{/if}
							</div>
						</div>
					{/each}
				</div>

				{#if errors.flours}
					<p class="mt-2 text-sm text-red-700">{errors.flours}</p>
				{/if}

				<button
					type="button"
					class="mt-3 flex items-center gap-2 rounded border px-2 py-1.5 text-sm hover:bg-black/5 disabled:opacity-40"
					disabled={values.flours.length >= MAX_FLOURS}
					onclick={addFlour}
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
					Aggiungi farina
				</button>

				<hr class="my-4" />

				<div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
					<NumberField
						label="Lievitazione totale"
						unit="h"
						min={limits.proofingHours.min}
						max={limits.proofingHours.max}
						bind:value={values.proofingHours}
						error={errors.proofingHours}
					/>

					<NumberField
						label="Di cui in frigorifero"
						unit="h"
						min={limits.fridgeHours.min}
						max={values.proofingHours - 1}
						bind:value={values.fridgeHours}
						error={errors.fridgeHours}
					/>

					<NumberField
						label="Temperatura ambiente"
						unit="°C"
						min={limits.roomTemperature.min}
						max={limits.roomTemperature.max}
						bind:value={values.roomTemperature}
						error={errors.roomTemperature}
					/>

					<NumberField
						label="Sale"
						unit="g/l"
						min={limits.saltPerLiter.min}
						max={limits.saltPerLiter.max}
						bind:value={values.saltPerLiter}
						error={errors.saltPerLiter}
					/>

					<NumberField
						label="Olio"
						unit="g/l"
						min={limits.oilPerLiter.min}
						max={limits.oilPerLiter.max}
						bind:value={values.oilPerLiter}
						error={errors.oilPerLiter}
					/>
				</div>

				<hr class="my-4" />

				<div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
					<div class="flex items-center justify-between gap-3">
						<span class="text-sm">Pizza in teglia</span>
						<SegmentedControl
							label="Pizza in teglia"
							options={panPizzaOptions}
							bind:value={values.panPizza}
						/>
					</div>

					<div class="flex items-center justify-between gap-3">
						<span class="text-sm">Lievito di birra</span>
						<SegmentedControl
							label="Tipo di lievito"
							options={yeastKinds}
							bind:value={values.yeastKind}
						/>
					</div>
				</div>
			</details>
		</form>

		<hr class="my-6" />

		{#if hasErrors}
			<p
				class="mb-4 rounded-lg border border-red-600 bg-red-50 p-3 text-sm text-red-700"
				role="alert"
			>
				Alcuni parametri non sono validi, si prega di correggerli.
			</p>
		{/if}

		<div class="rounded-lg border p-4">
			<ul class="space-y-3">
				<li>
					<div class="flex items-baseline gap-2">
						<span class="truncate">
							Farina
							{#if singleFlourName}<span class="text-black/50">{singleFlourName}</span>{/if}
						</span>
						<span class="min-w-4 flex-1 border-b border-dotted border-black/25"></span>
						<span class="text-lg font-semibold tabular-nums">{results.flour} g</span>
					</div>

					{#if results.flours.length > 1}
						<ul class="mt-2 space-y-1 pl-4 text-sm text-black/60">
							{#each results.flours as flour, i (i)}
								<li class="flex items-baseline gap-2">
									<span class="truncate">{flourTypeName(flour.flourTypeId, i)}</span>
									<span class="min-w-4 flex-1 border-b border-dotted border-black/15"></span>
									<span class="w-10 text-right tabular-nums">{flour.percent}%</span>
									<span class="w-14 text-right font-medium text-black/80 tabular-nums">
										{flour.weight} g
									</span>
								</li>
							{/each}
						</ul>
					{/if}
				</li>
				<li class="flex items-baseline gap-2">
					<span>Acqua</span>
					<span class="min-w-4 flex-1 border-b border-dotted border-black/25"></span>
					<span class="text-lg font-semibold tabular-nums">{results.water} g</span>
				</li>
				<li class="flex items-baseline gap-2">
					<span>Sale</span>
					<span class="min-w-4 flex-1 border-b border-dotted border-black/25"></span>
					<span class="text-lg font-semibold tabular-nums">{results.salt} g</span>
				</li>
				<li class="flex items-baseline gap-2">
					<span>Olio</span>
					<span class="min-w-4 flex-1 border-b border-dotted border-black/25"></span>
					<span class="text-lg font-semibold tabular-nums">{results.oil} g</span>
				</li>
				<li class="flex items-baseline gap-2">
					<span>{yeast.label}</span>
					<span class="min-w-4 flex-1 border-b border-dotted border-black/25"></span>
					<span class="text-lg font-semibold tabular-nums">{yeast.amount} g</span>
				</li>
			</ul>

			<div class="mt-3 flex items-baseline gap-2 border-t pt-3">
				<span class="font-medium">Peso totale impasto</span>
				<span class="min-w-4 flex-1 border-b border-dotted border-black/25"></span>
				<span class="text-xl font-bold tabular-nums">{results.totalWeight} g</span>
			</div>
		</div>

		<hr class="my-6" />

		<div>
			<label for="notes" class="text-sm">Note</label>
			<textarea
				id="notes"
				rows="4"
				placeholder="Tecnica di impasto, cottura, come è venuta…"
				bind:value={values.notes}
				class="mt-1 w-full resize-y rounded-md"></textarea>
		</div>
	</main>
</div>
