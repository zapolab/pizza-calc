import { clampValues, type PresetValues } from '$lib/presets';
import type { Flour } from '$lib/flours';
import { preset } from './db/schema';

export type PresetRow = typeof preset.$inferSelect;

export function toValues(row: PresetRow, flours: Flour[]): PresetValues {
	return {
		doughBallCount: row.doughBallCount,
		doughBallWeight: row.doughBallWeight,
		hydration: row.hydration,
		proofingHours: row.proofingHours,
		fridgeHours: row.fridgeHours,
		saltPerLiter: row.saltPerLiter,
		oilPerLiter: row.oilPerLiter,
		roomTemperature: row.roomTemperature,
		panPizza: row.panPizza,
		yeastKind: row.yeastKind,
		flours,
		notes: row.notes
	};
}

export function toColumns(values: PresetValues) {
	const v = clampValues(values);
	return {
		doughBallCount: Math.round(v.doughBallCount),
		doughBallWeight: Math.round(v.doughBallWeight),
		hydration: Math.round(v.hydration),
		proofingHours: Math.round(v.proofingHours),
		fridgeHours: Math.round(v.fridgeHours),
		saltPerLiter: Math.round(v.saltPerLiter),
		oilPerLiter: Math.round(v.oilPerLiter),
		roomTemperature: Math.round(v.roomTemperature),
		panPizza: Boolean(v.panPizza),
		yeastKind: v.yeastKind === 'fresh' ? ('fresh' as const) : ('dry' as const),
		notes: String(v.notes ?? '')
	};
}

export function toFlourRows(presetId: number, values: PresetValues) {
	return clampValues(values).flours.map((flour, slot) => ({
		presetId,
		slot,
		flourTypeId: flour.flourTypeId,
		percent: Math.round(flour.percent)
	}));
}

export function parseValues(raw: FormDataEntryValue | null): PresetValues | null {
	if (typeof raw !== 'string') return null;
	try {
		const parsed = JSON.parse(raw);
		if (!parsed || !Array.isArray(parsed.flours)) return null;
		return parsed as PresetValues;
	} catch {
		return null;
	}
}

export function parseId(raw: FormDataEntryValue | null): number | null {
	if (typeof raw !== 'string' || raw.trim() === '') return null;

	const id = Number(raw);
	return Number.isInteger(id) ? id : null;
}
