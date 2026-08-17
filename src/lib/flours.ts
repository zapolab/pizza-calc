export type FlourType = {
	id: number;
	name: string;
};

export type Flour = {
	flourTypeId: number;
	percent: number;
};

export function flourTypeName(flourTypes: FlourType[], id: number, index = 0): string {
	const type = flourTypes.find((flourType) => flourType.id === id);
	if (type) return type.name;
	return index === 0 ? 'Farina' : `Farina ${index + 1}`;
}

export function nextFlourTypeId(flourTypes: FlourType[], usedIds: number[]): number {
	return flourTypes.find((type) => !usedIds.includes(type.id))?.id ?? flourTypes[0].id;
}
