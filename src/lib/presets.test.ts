import { describe, expect, it } from 'vitest';
import { flourTypeName, nextFlourTypeId, type Flour } from './flours';
import {
	clampValues,
	cloneValues,
	MAX_FLOURS,
	rebalanceFlours,
	validateValues,
	withFlourRemoved
} from './presets';
import { testFlourTypes, testValues } from './testValues';

function withFlours(flours: Flour[]) {
	return { ...cloneValues(testValues), flours };
}

describe('cloneValues', () => {
	it('deep-clones the flours', () => {
		const clone = cloneValues(testValues);
		clone.flours[0].percent = 42;

		expect(testValues.flours[0].percent).toBe(100);
	});
});

describe('clampValues', () => {
	it('clamps every percentage into range', () => {
		const values = withFlours([
			{ flourTypeId: 1, percent: -20 },
			{ flourTypeId: 6, percent: 180 }
		]);

		expect(clampValues(values).flours).toEqual([
			{ flourTypeId: 1, percent: 0 },
			{ flourTypeId: 6, percent: 100 }
		]);
	});

	it('maps an emptied field onto zero', () => {
		const values = withFlours([{ flourTypeId: 1, percent: Number.NaN }]);

		expect(clampValues(values).flours[0].percent).toBe(0);
	});

	it('keeps at most MAX_FLOURS entries', () => {
		const many = Array.from({ length: 5 }, (_, i) => ({
			flourTypeId: i + 1,
			percent: 20
		}));

		expect(clampValues(withFlours(many)).flours).toHaveLength(MAX_FLOURS);
	});
});

describe('validateValues', () => {
	it('accepts a single flour at 100%', () => {
		expect(validateValues(testValues).flours).toBeUndefined();
	});

	it('reports a total that is not 100%', () => {
		const errors = validateValues(
			withFlours([
				{ flourTypeId: 1, percent: 70 },
				{ flourTypeId: 6, percent: 20 }
			])
		);

		expect(errors.flours).toBe('La somma delle percentuali deve essere 100%');
	});

	it('accepts three flours summing to 100%', () => {
		const errors = validateValues(
			withFlours([
				{ flourTypeId: 1, percent: 33 },
				{ flourTypeId: 6, percent: 33 },
				{ flourTypeId: 7, percent: 34 }
			])
		);

		expect(errors.flours).toBeUndefined();
	});

	it('flags the empty row, not just the total', () => {
		const errors = validateValues(
			withFlours([
				{ flourTypeId: 1, percent: 100 },
				{ flourTypeId: 6, percent: Number.NaN }
			])
		);

		expect(errors.flourPercents).toEqual([undefined, 'Valore obbligatorio']);
	});

	it('reports a flour type picked twice', () => {
		const errors = validateValues(
			withFlours([
				{ flourTypeId: 1, percent: 50 },
				{ flourTypeId: 1, percent: 50 }
			])
		);

		expect(errors.flours).toBe('Ogni farina può essere scelta una sola volta');
	});
});

describe('rebalanceFlours', () => {
	const three: Flour[] = [
		{ flourTypeId: 1, percent: 100 },
		{ flourTypeId: 6, percent: 0 },
		{ flourTypeId: 7, percent: 0 }
	];

	it('hands the freed share to the row below', () => {
		expect(rebalanceFlours(three, 0, 60)).toEqual([
			{ flourTypeId: 1, percent: 60 },
			{ flourTypeId: 6, percent: 40 },
			{ flourTypeId: 7, percent: 0 }
		]);
	});

	it('walks down the list on every following edit', () => {
		const first = rebalanceFlours(three, 0, 60);

		expect(rebalanceFlours(first, 1, 30)).toEqual([
			{ flourTypeId: 1, percent: 60 },
			{ flourTypeId: 6, percent: 30 },
			{ flourTypeId: 7, percent: 10 }
		]);
	});

	it('takes from the row above when there is none below', () => {
		const current: Flour[] = [
			{ flourTypeId: 1, percent: 60 },
			{ flourTypeId: 6, percent: 30 },
			{ flourTypeId: 7, percent: 10 }
		];

		expect(rebalanceFlours(current, 2, 15)).toEqual([
			{ flourTypeId: 1, percent: 60 },
			{ flourTypeId: 6, percent: 25 },
			{ flourTypeId: 7, percent: 15 }
		]);
	});

	it('spills onto the next row once the nearest one is exhausted', () => {
		const current: Flour[] = [
			{ flourTypeId: 1, percent: 60 },
			{ flourTypeId: 6, percent: 30 },
			{ flourTypeId: 7, percent: 10 }
		];

		expect(rebalanceFlours(current, 2, 50)).toEqual([
			{ flourTypeId: 1, percent: 50 },
			{ flourTypeId: 6, percent: 0 },
			{ flourTypeId: 7, percent: 50 }
		]);
	});

	it('realigns a total that was not 100', () => {
		const legacy: Flour[] = [
			{ flourTypeId: 1, percent: 50 },
			{ flourTypeId: 6, percent: 30 }
		];

		expect(rebalanceFlours(legacy, 0, 50)).toEqual([
			{ flourTypeId: 1, percent: 50 },
			{ flourTypeId: 6, percent: 50 }
		]);
	});

	it('clamps the edited share into range', () => {
		expect(rebalanceFlours(three, 1, 180)).toEqual([
			{ flourTypeId: 1, percent: 0 },
			{ flourTypeId: 6, percent: 100 },
			{ flourTypeId: 7, percent: 0 }
		]);
	});

	it('leaves the others alone while the field is empty', () => {
		const current: Flour[] = [
			{ flourTypeId: 1, percent: 60 },
			{ flourTypeId: 6, percent: 40 }
		];
		const next = rebalanceFlours(current, 0, Number.NaN);

		expect(next[0].percent).toBeNaN();
		expect(next[1].percent).toBe(40);
	});

	it('does not mutate the list it is given', () => {
		rebalanceFlours(three, 0, 60);

		expect(three[1].percent).toBe(0);
	});

	it('forces a lone flour to 100%', () => {
		expect(rebalanceFlours([{ flourTypeId: 1, percent: 100 }], 0, 40)).toEqual([
			{ flourTypeId: 1, percent: 100 }
		]);
	});
});

describe('withFlourRemoved', () => {
	const three: Flour[] = [
		{ flourTypeId: 1, percent: 60 },
		{ flourTypeId: 6, percent: 30 },
		{ flourTypeId: 7, percent: 10 }
	];

	it('hands the freed share to the row below', () => {
		expect(withFlourRemoved(three, 1)).toEqual([
			{ flourTypeId: 1, percent: 60 },
			{ flourTypeId: 7, percent: 40 }
		]);
	});

	it('hands it to the row above when the last one goes', () => {
		expect(withFlourRemoved(three, 2)).toEqual([
			{ flourTypeId: 1, percent: 60 },
			{ flourTypeId: 6, percent: 40 }
		]);
	});

	it('does not mutate the list it is given', () => {
		withFlourRemoved(three, 0);

		expect(three).toHaveLength(3);
	});
});

describe('flourTypeName', () => {
	it('resolves a catalog id', () => {
		expect(flourTypeName(testFlourTypes, 1)).toBe('Tipo 00');
	});

	it('falls back to a positional label for an unknown id', () => {
		expect(flourTypeName(testFlourTypes, 99, 0)).toBe('Farina');
		expect(flourTypeName(testFlourTypes, 99, 1)).toBe('Farina 2');
	});
});

describe('nextFlourTypeId', () => {
	it('skips the ids already picked', () => {
		expect(nextFlourTypeId(testFlourTypes, [1])).toBe(2);
	});
});
