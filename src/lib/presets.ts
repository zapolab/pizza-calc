import { type Flour } from './flours';

export const MAX_FLOURS = 3;

export type YeastKind = 'dry' | 'fresh';

export type PresetValues = {
	doughBallCount: number;
	doughBallWeight: number;
	hydration: number;
	proofingHours: number;
	fridgeHours: number;
	saltPerLiter: number;
	oilPerLiter: number;
	roomTemperature: number;
	panPizza: boolean;
	yeastKind: YeastKind;
	flours: Flour[];
	notes: string;
};

export type Preset = {
	id: number;
	name: string;
	values: PresetValues;
};

export function cloneValues(values: PresetValues): PresetValues {
	return { ...values, flours: values.flours.map((flour) => ({ ...flour })) };
}

export type Limit = { min: number; max: number };

/** Accepted range of every numeric input */
export const limits = {
	doughBallCount: { min: 1, max: 100 },
	doughBallWeight: { min: 50, max: 1000 },
	hydration: { min: 50, max: 100 },
	proofingHours: { min: 3, max: 96 },
	fridgeHours: { min: 0, max: 95 },
	saltPerLiter: { min: 0, max: 70 },
	oilPerLiter: { min: 0, max: 150 },
	roomTemperature: { min: 15, max: 35 },
	flourPercent: { min: 0, max: 100 }
} satisfies Record<string, Limit>;

function clamp(value: number, { min, max }: Limit): number {
	if (!Number.isFinite(value)) return min;
	return Math.min(Math.max(value, min), max);
}

function clampFlours(flours: Flour[]): Flour[] {
	return flours.slice(0, MAX_FLOURS).map(({ flourTypeId, percent }) => ({
		flourTypeId,
		percent: clamp(percent, limits.flourPercent)
	}));
}

/** Brings every value inside its limit */
export function clampValues(values: PresetValues): PresetValues {
	const proofingHours = clamp(values.proofingHours, limits.proofingHours);

	return {
		doughBallCount: clamp(values.doughBallCount, limits.doughBallCount),
		doughBallWeight: clamp(values.doughBallWeight, limits.doughBallWeight),
		hydration: clamp(values.hydration, limits.hydration),
		proofingHours,
		fridgeHours: Math.min(clamp(values.fridgeHours, limits.fridgeHours), proofingHours - 1),
		saltPerLiter: clamp(values.saltPerLiter, limits.saltPerLiter),
		oilPerLiter: clamp(values.oilPerLiter, limits.oilPerLiter),
		roomTemperature: clamp(values.roomTemperature, limits.roomTemperature),
		panPizza: values.panPizza,
		yeastKind: values.yeastKind,
		flours: clampFlours(values.flours),
		notes: values.notes
	};
}

/** Compensation order: below the edited one first, then above it, nearest first */
function compensationOrder(length: number, index: number): number[] {
	const below = Array.from({ length: length - index - 1 }, (_, i) => index + 1 + i);
	const above = Array.from({ length: index }, (_, i) => index - 1 - i);
	return [...below, ...above];
}

/** What the shares are missing to total 100% */
function missingShare(flours: Flour[]): number {
	return flours.reduce((left, flour) => left - clamp(flour.percent, limits.flourPercent), 100);
}

/** Hands a share to the rows in order, filling each one, and returns what did not fit */
function distribute(flours: Flour[], order: number[], share: number): number {
	let left = share;

	for (const i of order) {
		if (left === 0) break;
		const current = clamp(flours[i].percent, limits.flourPercent);
		flours[i].percent = clamp(current + left, limits.flourPercent);
		left -= flours[i].percent - current;
	}

	return left;
}

/** Sets one flour's share and spreads the remainder over the others */
export function rebalanceFlours(flours: Flour[], index: number, percent: number): Flour[] {
	const next = flours.map((flour) => ({ ...flour }));
	if (!Number.isFinite(percent)) {
		next[index].percent = percent;
		return next;
	}

	next[index].percent = clamp(percent, limits.flourPercent);

	const left = distribute(next, compensationOrder(next.length, index), missingShare(next));
	next[index].percent = clamp(next[index].percent + left, limits.flourPercent);

	return next;
}

/** Removes a flour and gives its share to the others, following compensationOrder */
export function withFlourRemoved(flours: Flour[], index: number): Flour[] {
	const next = flours.filter((_, i) => i !== index).map((flour) => ({ ...flour }));
	if (next.length === 0) return next;

	const order = compensationOrder(flours.length, index).map((i) => (i > index ? i - 1 : i));
	distribute(next, order, missingShare(next));

	return next;
}

export type ValidationErrors = Partial<Record<keyof PresetValues, string>> & {
	flourPercents?: (string | undefined)[];
};

export function validateValues(values: PresetValues): ValidationErrors {
	const errors: ValidationErrors = {};

	for (const [field, limit] of Object.entries(limits) as [keyof typeof limits, Limit][]) {
		if (field === 'flourPercent') {
			const flourPercents = values.flours.map((flour) => {
				if (!Number.isFinite(flour.percent)) return 'Valore obbligatorio';
				if (flour.percent < limit.min || flour.percent > limit.max)
					return `Deve essere tra ${limit.min} e ${limit.max}`;
				return undefined;
			});
			if (flourPercents.some(Boolean)) errors.flourPercents = flourPercents;

			const flourTotal = values.flours.reduce(
				(sum, flour) => sum + (Number.isFinite(flour.percent) ? flour.percent : 0),
				0
			);
			if (Math.abs(flourTotal - 100) > 0.01)
				errors.flours = 'La somma delle percentuali deve essere 100%';

			const pickedTypes = values.flours.map((flour) => flour.flourTypeId);
			if (new Set(pickedTypes).size < pickedTypes.length)
				errors.flours = 'Ogni farina può essere scelta una sola volta';
		} else {
			const value = values[field];
			if (!Number.isFinite(value)) errors[field] = 'Valore obbligatorio';
			else if (value < limit.min || value > limit.max)
				errors[field] = `Deve essere tra ${limit.min} e ${limit.max}`;
		}
	}

	if (!errors.fridgeHours && !errors.proofingHours && values.fridgeHours >= values.proofingHours)
		errors.fridgeHours = 'Non può essere uguale o superare le ore di lievitazione totali';

	return errors;
}
