import { describe, expect, it } from 'vitest';
import { flourTypeName, nextFlourTypeId, type Flour } from './flours';
import { clampValues, cloneValues, defaultValues, MAX_FLOURS, validateValues } from './presets';

function withFlours(flours: Flour[]) {
	return { ...cloneValues(defaultValues), flours };
}

describe('cloneValues', () => {
	it('deep-clones the flours', () => {
		const clone = cloneValues(defaultValues);
		clone.flours[0].percent = 42;

		expect(defaultValues.flours[0].percent).toBe(100);
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

	it('keeps at most MAX_FLOURS entries and at least one', () => {
		const many = Array.from({ length: 5 }, (_, i) => ({
			flourTypeId: i + 1,
			percent: 20
		}));

		expect(clampValues(withFlours(many)).flours).toHaveLength(MAX_FLOURS);
		expect(clampValues(withFlours([])).flours).toHaveLength(1);
	});
});

describe('validateValues', () => {
	it('accepts a single flour at 100%', () => {
		expect(validateValues(defaultValues).flours).toBeUndefined();
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

describe('flourTypeName', () => {
	it('resolves a catalog id', () => {
		expect(flourTypeName(1)).toBe('Tipo 00');
	});

	it('falls back to a positional label for an unknown id', () => {
		expect(flourTypeName(99, 0)).toBe('Farina');
		expect(flourTypeName(99, 1)).toBe('Farina 2');
	});
});

describe('nextFlourTypeId', () => {
	it('skips the ids already picked', () => {
		expect(nextFlourTypeId([1])).toBe(2);
	});
});
