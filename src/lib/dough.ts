import { clampValues, type PresetValues } from './presets';

export type Results = {
	flour: number;
	water: number;
	salt: number;
	oil: number;
	dryYeast: number;
	wetYeast: number;
};

const DRY_YEAST_FACTOR = 0.33;

function round(num: number, fractionDigits: number): number {
	return Number(num.toFixed(fractionDigits));
}

export function computeResults(values: PresetValues): Results {
	const {
		doughBallCount,
		doughBallWeight,
		hydration,
		proofingHours,
		fridgeHours,
		saltPerLiter,
		oilPerLiter,
		roomTemperature,
		panPizza
	} = clampValues(values);

	const normTemp = roomTemperature * (1 - 0.25 * (panPizza ? 1 : 0));
	const normHours = proofingHours - 0.9 * Math.min(fridgeHours, proofingHours - 1);
	const yeastRatio =
		(2250 * (1 + saltPerLiter / 200) * (1 + oilPerLiter / 300)) /
		((4.2 * hydration - 80 - 0.0305 * Math.pow(hydration, 2)) *
			Math.pow(normTemp, 2.5) *
			Math.pow(normHours, 1.2));
	const totalWeight = doughBallCount * doughBallWeight;

	const flourExact =
		totalWeight / (1 + (hydration / 100) * (1 + (saltPerLiter + oilPerLiter) / 1000));
	const waterExact = (hydration / 100) * flourExact;

	const flour = Math.round(flourExact);
	const water = Math.round(waterExact);
	const salt = Math.round((saltPerLiter / 1000) * waterExact);
	const oil = Math.round((oilPerLiter / 1000) * waterExact);

	const wetYeast = round(flourExact * yeastRatio, 2);
	const dryYeast = round(wetYeast * DRY_YEAST_FACTOR, 2);

	return {
		flour,
		water,
		salt,
		oil,
		dryYeast,
		wetYeast
	};
}
