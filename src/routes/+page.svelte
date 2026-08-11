<script lang="ts">
	type TipoRiporto = 'stanca' | 'normale' | 'vivace';

	let numeroPanetti = $state(1);
	let pesoPanetti = $state(200);
	let temperatura = $state(20);
	let idratazione = $state(65);
	let salePerLitro = $state(50);
	let oreLievitazione = $state(24);
	let oreFrigo = $state(0);
	let olioPerLitro = $state(0);
	let percentualeRiporto = $state(0);
	let tipoRiporto = $state<TipoRiporto>('normale');
	let inTeglia = $state(false);

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

<div class="mx-auto max-w-3xl p-4">
	<form>
		<div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
			<label class="block">
				<span class="text-sm">Numero panetti</span>
				<input type="number" min="1" step="1" bind:value={numeroPanetti} class="mt-1 w-full" />
			</label>

			<label class="block">
				<span class="text-sm">Peso panetti (grammi)</span>
				<input type="number" min="0" step="1" bind:value={pesoPanetti} class="mt-1 w-full" />
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
						bind:value={idratazione}
						class="mt-1 w-full"
					/>
				</label>

				<label class="block">
					<span class="text-sm">Sale (grammi per litro)</span>
					<input type="number" min="0" step="1" bind:value={salePerLitro} class="mt-1 w-full" />
				</label>

				<label class="block">
					<span class="text-sm">Ore di lievitazione totali...</span>
					<input type="number" min="0" step="1" bind:value={oreLievitazione} class="mt-1 w-full" />
				</label>

				<label class="block">
					<span class="text-sm">... di cui Ore in frigorifero</span>
					<input
						type="number"
						min="0"
						max={oreLievitazione}
						step="1"
						bind:value={oreFrigo}
						class="mt-1 w-full"
					/>
				</label>

				<label class="block">
					<span class="text-sm">Olio (grammi per litro)</span>
					<input type="number" min="0" step="1" bind:value={olioPerLitro} class="mt-1 w-full" />
				</label>

				<label class="block">
					<span class="text-sm">Pasta di riporto (% su impasto totale)</span>
					<input
						type="number"
						min="0"
						max="100"
						step="1"
						bind:value={percentualeRiporto}
						class="mt-1 w-full"
					/>
				</label>

				<fieldset>
					<legend class="text-sm">Tipologia pasta di riporto</legend>
					<div class="mt-1 flex h-full justify-between gap-2">
						<label class="flex items-center gap-2">
							<input type="radio" value="stanca" bind:group={tipoRiporto} />
							<span>Stanca</span>
						</label>
						<label class="flex items-center gap-2">
							<input type="radio" value="normale" bind:group={tipoRiporto} />
							<span>Normale</span>
						</label>
						<label class="flex items-center gap-2">
							<input type="radio" value="vivace" bind:group={tipoRiporto} />
							<span>Vivace</span>
						</label>
					</div>
				</fieldset>

				<fieldset>
					<legend class="text-sm">Pizza in teglia</legend>
					<div class="mt-1 flex h-full justify-start gap-4">
						<label class="flex items-center gap-2">
							<input type="radio" value={false} bind:group={inTeglia} />
							<span>No</span>
						</label>
						<label class="flex items-center gap-2">
							<input type="radio" value={true} bind:group={inTeglia} />
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
</div>
