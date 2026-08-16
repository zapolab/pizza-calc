export type FlourType = {
	id: number;
	name: string;
};

export type Flour = {
	flourTypeId: number;
	percent: number;
};

/**
 * Catalog of selectable flours. In-memory placeholder for the future sqlite table.
 * Ids mirror the autoincrement order in which `flour_type` is seeded.
 */
export const flourTypes: FlourType[] = [
	{ id: 1, name: 'Tipo 00' },
	{ id: 2, name: 'Tipo 0' },
	{ id: 3, name: 'Tipo 0 Super' },
	{ id: 4, name: 'Tipo 1' },
	{ id: 5, name: 'Tipo 2' },
	{ id: 6, name: 'Integrale' },
	{ id: 7, name: 'Manitoba' },
	{ id: 8, name: 'Semola di grano duro rimacinata' }
];

export const defaultFlourTypeId = flourTypes[0].id;

/** Function for vitest **/
export function flourTypeName(id: number, index = 0): string {
	const type = flourTypes.find((flourType) => flourType.id === id);
	if (type) return type.name;
	return index === 0 ? 'Farina' : `Farina ${index + 1}`;
}

export function nextFlourTypeId(usedIds: number[]): number {
	return flourTypes.find((type) => !usedIds.includes(type.id))?.id ?? defaultFlourTypeId;
}
