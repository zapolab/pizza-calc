import { describe, expect, it } from 'vitest';
import { testValues } from '$lib/testValues';
import { MAX_FLOURS, type PresetValues } from '$lib/presets';
import { parseId, parseValues, toColumns, toFlourRows, toValues, type PresetRow } from './presets';

const row: PresetRow = {
	id: 7,
	name: 'Napoletana',
	isDefault: false,
	doughBallCount: 2,
	doughBallWeight: 250,
	hydration: 70,
	proofingHours: 30,
	fridgeHours: 12,
	saltPerLiter: 55,
	oilPerLiter: 10,
	roomTemperature: 22,
	panPizza: true,
	yeastKind: 'fresh',
	notes: 'prova'
};

describe('toValues', () => {
	it('carries every column over and keeps the flours it is given', () => {
		const flours = [{ flourTypeId: 1, percent: 100 }];

		expect(toValues(row, flours)).toEqual({
			doughBallCount: 2,
			doughBallWeight: 250,
			hydration: 70,
			proofingHours: 30,
			fridgeHours: 12,
			saltPerLiter: 55,
			oilPerLiter: 10,
			roomTemperature: 22,
			panPizza: true,
			yeastKind: 'fresh',
			flours,
			notes: 'prova'
		});
	});
});

describe('toColumns', () => {
	it('clamps values the client sent out of range', () => {
		const columns = toColumns({
			...testValues,
			doughBallCount: 999,
			doughBallWeight: 5,
			roomTemperature: 80
		});

		expect(columns.doughBallCount).toBe(100);
		expect(columns.doughBallWeight).toBe(50);
		expect(columns.roomTemperature).toBe(35);
	});

	it('rounds a decimal the client sent anyway', () => {
		expect(toColumns({ ...testValues, hydration: 65.7 }).hydration).toBe(66);
	});

	it('keeps fridgeHours below proofingHours', () => {
		const columns = toColumns({ ...testValues, proofingHours: 24, fridgeHours: 99 });

		expect(columns.fridgeHours).toBe(23);
	});

	it('narrows an unknown yeastKind onto dry', () => {
		const values = { ...testValues, yeastKind: 'bogus' } as unknown as PresetValues;

		expect(toColumns(values).yeastKind).toBe('dry');
		expect(toColumns({ ...testValues, yeastKind: 'fresh' }).yeastKind).toBe('fresh');
	});

	it('coerces panPizza and notes', () => {
		const values = { ...testValues, panPizza: 1, notes: null } as unknown as PresetValues;
		const columns = toColumns(values);

		expect(columns.panPizza).toBe(true);
		expect(columns.notes).toBe('');
	});
});

describe('toFlourRows', () => {
	it('numbers the slots in order and rounds each share', () => {
		const rows = toFlourRows(7, {
			...testValues,
			flours: [
				{ flourTypeId: 1, percent: 60.4 },
				{ flourTypeId: 7, percent: 39.6 }
			]
		});

		expect(rows).toEqual([
			{ presetId: 7, slot: 0, flourTypeId: 1, percent: 60 },
			{ presetId: 7, slot: 1, flourTypeId: 7, percent: 40 }
		]);
	});

	it('drops the entries past MAX_FLOURS', () => {
		const flours = Array.from({ length: 5 }, (_, i) => ({ flourTypeId: i + 1, percent: 20 }));

		expect(toFlourRows(7, { ...testValues, flours })).toHaveLength(MAX_FLOURS);
	});
});

describe('parseValues', () => {
	it('reads back what the client serialized', () => {
		expect(parseValues(JSON.stringify(testValues))).toEqual(testValues);
	});

	it('rejects a missing field, malformed JSON and a body without flours', () => {
		expect(parseValues(null)).toBeNull();
		expect(parseValues('{')).toBeNull();
		expect(parseValues('null')).toBeNull();
		expect(parseValues(JSON.stringify({ ...testValues, flours: 'tanta' }))).toBeNull();
	});
});

describe('parseId', () => {
	it('accepts an integer and rejects anything else', () => {
		expect(parseId('7')).toBe(7);
		expect(parseId('abc')).toBeNull();
		expect(parseId('1.5')).toBeNull();
		expect(parseId('')).toBeNull();
		expect(parseId(null)).toBeNull();
	});
});
