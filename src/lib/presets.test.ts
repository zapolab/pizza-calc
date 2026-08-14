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
			{ flourTypeId: 'tipo-00', percent: -20 },
			{ flourTypeId: 'integrale', percent: 180 }
		]);

		expect(clampValues(values).flours).toEqual([
			{ flourTypeId: 'tipo-00', percent: 0 },
			{ flourTypeId: 'integrale', percent: 100 }
		]);
	});

	it('maps an emptied field onto zero', () => {
		const values = withFlours([{ flourTypeId: 'tipo-00', percent: Number.NaN }]);

		expect(clampValues(values).flours[0].percent).toBe(0);
	});

	it('keeps at most MAX_FLOURS entries and at least one', () => {
		const many = Array.from({ length: 5 }, (_, i) => ({
			flourTypeId: `f${i}`,
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
				{ flourTypeId: 'tipo-00', percent: 70 },
				{ flourTypeId: 'integrale', percent: 20 }
			])
		);

		expect(errors.flours).toBe('La somma delle percentuali deve essere 100%');
	});

	it('tolerates floating point noise around 100%', () => {
		const errors = validateValues(
			withFlours([
				{ flourTypeId: 'tipo-00', percent: 33.3 },
				{ flourTypeId: 'integrale', percent: 33.3 },
				{ flourTypeId: 'manitoba', percent: 33.4 }
			])
		);

		expect(errors.flours).toBeUndefined();
	});

	it('flags the empty row, not just the total', () => {
		const errors = validateValues(
			withFlours([
				{ flourTypeId: 'tipo-00', percent: 100 },
				{ flourTypeId: 'integrale', percent: Number.NaN }
			])
		);

		expect(errors.flourPercents).toEqual([undefined, 'Valore obbligatorio']);
	});

	it('reports a flour type picked twice', () => {
		const errors = validateValues(
			withFlours([
				{ flourTypeId: 'tipo-00', percent: 50 },
				{ flourTypeId: 'tipo-00', percent: 50 }
			])
		);

		expect(errors.flours).toBe('Ogni farina può essere scelta una sola volta');
	});
});

describe('flourTypeName', () => {
	it('resolves a catalog id', () => {
		expect(flourTypeName('tipo-00')).toBe('Tipo 00');
	});

	it('falls back to a positional label for an unknown id', () => {
		expect(flourTypeName('gone', 0)).toBe('Farina');
		expect(flourTypeName('gone', 1)).toBe('Farina 2');
	});
});

describe('nextFlourTypeId', () => {
	it('skips the ids already picked', () => {
		expect(nextFlourTypeId(['tipo-00'])).toBe('tipo-0');
	});
});
