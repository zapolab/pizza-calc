import type { FlourType } from './flours';
import type { PresetValues } from './presets';

/** Constant for the module tests */
export const testFlourTypes: FlourType[] = [
	{ id: 1, name: 'Tipo 00' },
	{ id: 2, name: 'Tipo 0' },
	{ id: 4, name: 'Tipo 1' },
	{ id: 6, name: 'Integrale' },
	{ id: 7, name: 'Manitoba' }
];

/** Reference dough. Expected results: flour 119 g, water 77 g, salt 4 g, fresh yeast 0.06 g */
export const testValues: PresetValues = {
	doughBallCount: 1,
	doughBallWeight: 200,
	hydration: 65,
	proofingHours: 24,
	fridgeHours: 0,
	saltPerLiter: 50,
	oilPerLiter: 0,
	roomTemperature: 20,
	panPizza: false,
	yeastKind: 'dry',
	flours: [{ flourTypeId: 1, percent: 100 }],
	notes: ''
};
