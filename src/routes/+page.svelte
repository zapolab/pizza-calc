<script lang="ts">
	import { clonaValori, valoriPredefiniti, type Preset } from '$lib/presets';

	// Segnaposto in attesa del backend sqlite.
	let presets = $state<Preset[]>([
		{ id: 1, nome: 'Napoletana', valori: clonaValori(valoriPredefiniti) },
		{
			id: 2,
			nome: 'Teglia romana',
			valori: { ...valoriPredefiniti, pesoPanetti: 700, idratazione: 80, inTeglia: true }
		}
	]);
	let prossimoId = $state(3);

	let idSelezionato = $state<number | null>(1);
	let valori = $state(clonaValori(presets[0].valori));

	// Non fanno parte del preset.
	let numeroPanetti = $state(1);
	let temperatura = $state(20);

	let barraAperta = $state(true);
	let barraMobileAperta = $state(false);
	let inRinomina = $state(false);
	let dialogElimina = $state<HTMLDialogElement | null>(null);

	const presetSelezionato = $derived(presets.find((p) => p.id === idSelezionato) ?? null);
	const modificato = $derived(
		presetSelezionato !== null &&
			JSON.stringify(presetSelezionato.valori) !== JSON.stringify(valori)
	);

	function selezionaPreset(preset: Preset) {
		idSelezionato = preset.id;
		valori = clonaValori(preset.valori);
		inRinomina = false;
		barraMobileAperta = false;
	}

	function nuovoPreset() {
		const preset: Preset = { id: prossimoId++, nome: 'Nuovo preset', valori: clonaValori(valori) };
		presets.push(preset);
		idSelezionato = preset.id;
		inRinomina = true;
		barraMobileAperta = false;
	}

	function salvaPreset() {
		if (!presetSelezionato) return;
		presetSelezionato.valori = clonaValori(valori);
	}

	function eliminaPreset() {
		const i = presets.findIndex((p) => p.id === idSelezionato);
		if (i === -1) return;
		presets.splice(i, 1);
		const successivo = presets[i] ?? presets[i - 1] ?? null;
		idSelezionato = successivo?.id ?? null;
		if (successivo) valori = clonaValori(successivo.valori);
		inRinomina = false;
		dialogElimina?.close();
	}

	function autofocus(node: HTMLInputElement) {
		node.focus();
		node.select();
	}

	// Segnaposto: le formule non sono ancora implementate.
	const risultati = {
		farina: 0,
		acqua: 0,
		sale: 0,
		olio: 0,
		riporto: 0,
		lievito: 0
	};
</script>

<div class="flex min-h-screen">
	{#if barraMobileAperta}
		<button
			type="button"
			class="fixed inset-0 z-30 bg-black/40 sm:hidden"
			aria-label="Chiudi barra laterale"
			onclick={() => (barraMobileAperta = false)}
		></button>
	{/if}

	<aside
		class="fixed inset-y-0 left-0 z-40 w-56 shrink-0 overflow-y-auto border-r bg-white transition-transform
			sm:static sm:translate-x-0 sm:bg-transparent sm:transition-none
			{barraMobileAperta ? 'translate-x-0' : '-translate-x-full'}
			{barraAperta ? 'sm:w-56' : 'sm:w-12'}"
	>
		<div class="flex items-center justify-between gap-2 p-2">
			<span class="text-sm font-semibold {barraAperta ? '' : 'hidden max-sm:inline'}">Preset</span>

			<button
				type="button"
				class="rounded p-1 hover:bg-black/5 sm:hidden"
				aria-label="Chiudi barra laterale"
				onclick={() => (barraMobileAperta = false)}
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
				aria-label={barraAperta ? 'Comprimi barra laterale' : 'Espandi barra laterale'}
				title={barraAperta ? 'Comprimi' : 'Espandi'}
				onclick={() => (barraAperta = !barraAperta)}
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
					<path d={barraAperta ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
				</svg>
			</button>
		</div>

		<div class={barraAperta ? '' : 'hidden max-sm:block'}>
			<ul class="px-2">
				{#each presets as preset (preset.id)}
					<li>
						<button
							type="button"
							class="w-full truncate rounded px-2 py-1.5 text-left text-sm hover:bg-black/5
								{preset.id === idSelezionato ? 'bg-black/10 font-medium' : ''}"
							onclick={() => selezionaPreset(preset)}
						>
							{preset.nome}
						</button>
					</li>
				{/each}
			</ul>

			<div class="p-2">
				<button
					type="button"
					class="flex w-full items-center gap-2 rounded border px-2 py-1.5 text-sm hover:bg-black/5"
					onclick={nuovoPreset}
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
				onclick={() => (barraMobileAperta = true)}
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

			{#if inRinomina && presetSelezionato}
				<input
					type="text"
					class="min-w-0 flex-1 text-lg"
					bind:value={presetSelezionato.nome}
					use:autofocus
					onblur={() => (inRinomina = false)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === 'Escape') e.currentTarget.blur();
					}}
				/>
			{:else}
				<h2 class="min-w-0 flex-1 truncate text-lg font-semibold">
					{presetSelezionato?.nome ?? 'Nessun preset'}
					{#if modificato}<span class="text-sm font-normal">•</span>{/if}
				</h2>
			{/if}

			<button
				type="button"
				class="rounded p-1.5 hover:bg-black/5 disabled:opacity-40"
				aria-label="Rinomina preset"
				title="Rinomina"
				disabled={!presetSelezionato}
				onclick={() => (inRinomina = true)}
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
				disabled={!modificato}
				onclick={salvaPreset}
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
				disabled={!presetSelezionato}
				onclick={() => dialogElimina?.showModal()}
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
			bind:this={dialogElimina}
			class="m-auto max-w-sm rounded border bg-white p-4 backdrop:bg-black/40"
		>
			<h3 class="text-lg font-semibold">Eliminare il preset?</h3>
			<p class="mt-2 text-sm">
				Il preset <strong>{presetSelezionato?.nome}</strong> verrà eliminato definitivamente.
			</p>
			<div class="mt-4 flex justify-end gap-2">
				<button
					type="button"
					class="rounded border px-3 py-1.5 text-sm hover:bg-black/5"
					onclick={() => dialogElimina?.close()}
				>
					Annulla
				</button>
				<button
					type="button"
					class="rounded border border-red-600 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
					onclick={eliminaPreset}
				>
					Elimina
				</button>
			</div>
		</dialog>

		<form>
			<div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
				<label class="block">
					<span class="text-sm">Numero panetti</span>
					<input type="number" min="1" step="1" bind:value={numeroPanetti} class="mt-1 w-full" />
				</label>

				<label class="block">
					<span class="text-sm">Peso panetti (grammi)</span>
					<input
						type="number"
						min="0"
						step="1"
						bind:value={valori.pesoPanetti}
						class="mt-1 w-full"
					/>
				</label>

				<label class="block">
					<span class="text-sm">Temperatura ambiente (°C)</span>
					<input type="number" step="1" bind:value={temperatura} class="mt-1 w-full" />
				</label>
			</div>

			<details class="mt-6 rounded border p-3">
				<summary class="cursor-pointer text-sm select-none">Parametri avanzati</summary>

				<div class="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
					<label class="block">
						<span class="text-sm">Idratazione desiderata (% da 50 a 100)</span>
						<input
							type="number"
							min="50"
							max="100"
							step="1"
							bind:value={valori.idratazione}
							class="mt-1 w-full"
						/>
					</label>

					<label class="block">
						<span class="text-sm">Sale (grammi per litro)</span>
						<input
							type="number"
							min="0"
							step="1"
							bind:value={valori.salePerLitro}
							class="mt-1 w-full"
						/>
					</label>

					<label class="block">
						<span class="text-sm">Ore di lievitazione totali...</span>
						<input
							type="number"
							min="0"
							step="1"
							bind:value={valori.oreLievitazione}
							class="mt-1 w-full"
						/>
					</label>

					<label class="block">
						<span class="text-sm">... di cui Ore in frigorifero</span>
						<input
							type="number"
							min="0"
							max={valori.oreLievitazione}
							step="1"
							bind:value={valori.oreFrigo}
							class="mt-1 w-full"
						/>
					</label>

					<label class="block">
						<span class="text-sm">Olio (grammi per litro)</span>
						<input
							type="number"
							min="0"
							step="1"
							bind:value={valori.olioPerLitro}
							class="mt-1 w-full"
						/>
					</label>

					<label class="block">
						<span class="text-sm">Pasta di riporto (% su impasto totale)</span>
						<input
							type="number"
							min="0"
							max="100"
							step="1"
							bind:value={valori.percentualeRiporto}
							class="mt-1 w-full"
						/>
					</label>

					<fieldset>
						<legend class="text-sm">Tipologia pasta di riporto</legend>
						<div class="mt-1 flex h-full justify-between gap-2">
							<label class="flex items-center gap-2">
								<input type="radio" value="stanca" bind:group={valori.tipoRiporto} />
								<span>Stanca</span>
							</label>
							<label class="flex items-center gap-2">
								<input type="radio" value="normale" bind:group={valori.tipoRiporto} />
								<span>Normale</span>
							</label>
							<label class="flex items-center gap-2">
								<input type="radio" value="vivace" bind:group={valori.tipoRiporto} />
								<span>Vivace</span>
							</label>
						</div>
					</fieldset>

					<fieldset>
						<legend class="text-sm">Pizza in teglia</legend>
						<div class="mt-1 flex h-full justify-start gap-4">
							<label class="flex items-center gap-2">
								<input type="radio" value={false} bind:group={valori.inTeglia} />
								<span>No</span>
							</label>
							<label class="flex items-center gap-2">
								<input type="radio" value={true} bind:group={valori.inTeglia} />
								<span>Si</span>
							</label>
						</div>
					</fieldset>
				</div>
			</details>
		</form>

		<hr class="my-6" />

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<p class="rounded border p-3 text-center">Farina: {risultati.farina} g</p>
			<p class="rounded border p-3 text-center">Acqua: {risultati.acqua} g</p>
			<p class="rounded border p-3 text-center">Sale: {risultati.sale} g</p>
			<p class="rounded border p-3 text-center">Olio: {risultati.olio} g</p>
			<p class="rounded border p-3 text-center">Pasta di riporto: {risultati.riporto} g</p>
			<p class="rounded border p-3 text-center">Lievito di birra secco: {risultati.lievito} g</p>
		</div>
	</main>
</div>
