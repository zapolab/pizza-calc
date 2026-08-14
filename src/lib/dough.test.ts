import { describe, expect, it } from 'vitest';
import { computeResults } from './dough';
import { defaultValues } from './presets';
import { defaultFlourTypeId } from './flours';

describe('computeResults', () => {
	it('matches the reference dough', () => {
		const results = computeResults(defaultValues);

		expect(results.totalWeight).toBe(200);
		expect(results.flour).toBe(119);
		expect(results.water).toBe(77);
		expect(results.salt).toBe(4);
		expect(results.oil).toBe(0);
		expect(results.wetYeast).toBe(0.06);
	});

	it('gives the whole flour to a single 100% entry', () => {
		const results = computeResults(defaultValues);

		expect(results.flours).toEqual([
			{ flourTypeId: defaultFlourTypeId, percent: 100, weight: results.flour }
		]);
	});

	it('splits the flour by percentage, summing back to the total', () => {
		const results = computeResults({
			...defaultValues,
			flours: [
				{ flourTypeId: 'tipo-00', percent: 70 },
				{ flourTypeId: 'manitoba', percent: 30 }
			]
		});

		expect(results.flours).toEqual([
			{ flourTypeId: 'tipo-00', percent: 70, weight: 83 },
			{ flourTypeId: 'manitoba', percent: 30, weight: 36 }
		]);
		expect(results.flours[0].weight + results.flours[1].weight).toBe(results.flour);
	});

	it('rounds thirds largest-remainder rather than losing a gram', () => {
		const results = computeResults({
			...defaultValues,
			flours: [
				{ flourTypeId: 'tipo-00', percent: 34 },
				{ flourTypeId: 'tipo-0', percent: 33 },
				{ flourTypeId: 'tipo-1', percent: 33 }
			]
		});

		expect(results.flours.reduce((sum, flour) => sum + flour.weight, 0)).toBe(results.flour);
	});

	it('keeps the solid ingredients summing back to the requested weight', () => {
		const results = computeResults({ ...defaultValues, doughBallCount: 3, oilPerLiter: 30 });

		expect(results.flour + results.water + results.salt + results.oil).toBe(results.totalWeight);
	});
});
