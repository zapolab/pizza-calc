import { describe, expect, it } from 'vitest';
import { computeResults } from './dough';
import { defaultValues } from './presets';

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

	it('keeps the solid ingredients summing back to the requested weight', () => {
		const results = computeResults({ ...defaultValues, doughBallCount: 3, oilPerLiter: 30 });

		expect(results.flour + results.water + results.salt + results.oil).toBe(results.totalWeight);
	});
});
