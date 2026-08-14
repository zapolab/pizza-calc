export type FlourType = {
	id: string;
	name: string;
};

export type Flour = {
	flourTypeId: string;
	percent: number;
};

/** Catalog of selectable flours. In-memory placeholder for the future sqlite table. */
export const flourTypes: FlourType[] = [
	{ id: 'tipo-00', name: 'Farina Tipo 00' },
	{ id: 'tipo-0', name: 'Farina Tipo 0' },
	{ id: 'tipo-0S', name: 'Farina Tipo 0 Super' },
	{ id: 'tipo-1', name: 'Farina Tipo 1' },
	{ id: 'tipo-2', name: 'Farina Tipo 2' },
	{ id: 'integrale', name: 'Farina integrale' },
	{ id: 'manitoba', name: 'Manitoba' },
	{ id: 'semola', name: 'Semola di grano duro rimacinata' }
];

export const defaultFlourTypeId = flourTypes[0].id;

/** Function for vitest **/
export function flourTypeName(id: string, index = 0): string {
	const type = flourTypes.find((flourType) => flourType.id === id);
	if (type) return type.name;
	return index === 0 ? 'Farina' : `Farina ${index + 1}`;
}

export function nextFlourTypeId(usedIds: string[]): string {
	return flourTypes.find((type) => !usedIds.includes(type.id))?.id ?? defaultFlourTypeId;
}
