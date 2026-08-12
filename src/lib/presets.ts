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
	panPizza: false
};

export function cloneValues(values: PresetValues): PresetValues {
	return { ...values };
}
