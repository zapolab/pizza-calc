import { error, fail } from '@sveltejs/kit';
import { and, asc, eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { flourType, preset, presetFlour } from '$lib/server/db/schema';
import type { Preset } from '$lib/presets';
import type { Flour } from '$lib/flours';
import {
	parseId,
	parseValues,
	toColumns,
	toFlourRows,
	toValues,
	type PresetRow
} from '$lib/server/presets';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const db = getDb();
	const [rows, flourRows, flourTypes] = await Promise.all([
		db.select().from(preset).orderBy(asc(preset.id)),
		db.select().from(presetFlour).orderBy(asc(presetFlour.presetId), asc(presetFlour.slot)),
		db
			.select({ id: flourType.id, name: flourType.name })
			.from(flourType)
			.orderBy(asc(flourType.sortOrder))
	]);

	const floursByPreset = new Map<number, Flour[]>();
	for (const row of flourRows) {
		const list = floursByPreset.get(row.presetId) ?? [];
		list.push({ flourTypeId: row.flourTypeId, percent: row.percent });
		floursByPreset.set(row.presetId, list);
	}

	const toPreset = (row: PresetRow): Preset => ({
		id: row.id,
		name: row.name,
		values: toValues(row, floursByPreset.get(row.id) ?? [])
	});

	const defaultRow = rows.find((row) => row.isDefault);
	if (!defaultRow) error(500, 'Nessun preset di default nel database');

	return {
		flourTypes,
		presets: rows.filter((row) => !row.isDefault).map(toPreset),
		defaultValues: toPreset(defaultRow).values
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const name = String(data.get('name') ?? '').trim();
		const values = parseValues(data.get('values'));
		if (!name || !values) return fail(400, { message: 'Dati mancanti' });

		try {
			const id = getDb().transaction((tx) => {
				const [row] = tx
					.insert(preset)
					.values({ name, ...toColumns(values) })
					.returning({ id: preset.id })
					.all();
				const flours = toFlourRows(row.id, values);
				if (flours.length > 0) tx.insert(presetFlour).values(flours).run();
				return row.id;
			});
			return { id };
		} catch {
			return fail(400, { message: 'Preset non salvabile' });
		}
	},

	save: async ({ request }) => {
		const data = await request.formData();
		const id = parseId(data.get('id'));
		const values = parseValues(data.get('values'));
		if (id === null || !values) return fail(400, { message: 'Dati mancanti' });

		try {
			getDb().transaction((tx) => {
				const target = tx
					.select({ id: preset.id })
					.from(preset)
					.where(and(eq(preset.id, id), eq(preset.isDefault, false)))
					.get();
				if (!target) return;

				tx.update(preset).set(toColumns(values)).where(eq(preset.id, id)).run();
				tx.delete(presetFlour).where(eq(presetFlour.presetId, id)).run();
				const flours = toFlourRows(id, values);
				if (flours.length > 0) tx.insert(presetFlour).values(flours).run();
			});
			return { saved: true };
		} catch {
			return fail(400, { message: 'Preset non salvabile' });
		}
	},

	rename: async ({ request }) => {
		const data = await request.formData();
		const id = parseId(data.get('id'));
		const name = String(data.get('name') ?? '').trim();
		if (id === null || !name) return fail(400, { message: 'Nome mancante' });

		getDb()
			.update(preset)
			.set({ name })
			.where(and(eq(preset.id, id), eq(preset.isDefault, false)))
			.run();
		return { renamed: true };
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = parseId(data.get('id'));
		if (id === null) return fail(400, { message: 'Preset inesistente' });

		getDb()
			.delete(preset)
			.where(and(eq(preset.id, id), eq(preset.isDefault, false)))
			.run();
		return { deleted: true };
	}
};
