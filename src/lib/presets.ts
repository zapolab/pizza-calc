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
};

export type Preset = {
	id: number;
	name: string;
	values: PresetValues;
};

export const defaultValues: PresetValues = {
	doughBallCount: 1,
	doughBallWeight: 200,
	hydration: 65,
	proofingHours: 24,
	fridgeHours: 0,
	saltPerLiter: 50,
	oilPerLiter: 0,
	roomTemperature: 20,
	panPizza: false,
	yeastKind: 'dry'
};

export function cloneValues(values: PresetValues): PresetValues {
	return { ...values };
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
	roomTemperature: { min: 15, max: 35 }
} satisfies Record<string, Limit>;

function clamp(value: number, { min, max }: Limit): number {
	if (!Number.isFinite(value)) return min;
	return Math.min(Math.max(value, min), max);
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
		yeastKind: values.yeastKind
	};
}

export type ValidationErrors = Partial<Record<keyof PresetValues, string>>;

export function validateValues(values: PresetValues): ValidationErrors {
	const errors: ValidationErrors = {};

	for (const [field, limit] of Object.entries(limits) as [keyof typeof limits, Limit][]) {
		const value = values[field];
		if (!Number.isFinite(value)) errors[field] = 'Valore obbligatorio';
		else if (value < limit.min || value > limit.max)
			errors[field] = `Deve essere tra ${limit.min} e ${limit.max}`;
	}

	if (!errors.fridgeHours && !errors.proofingHours && values.fridgeHours >= values.proofingHours)
		errors.fridgeHours = 'Non può essere uguale o superare le ore di lievitazione totali';

	return errors;
}
