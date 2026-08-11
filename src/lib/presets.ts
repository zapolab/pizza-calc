export type TipoRiporto = 'stanca' | 'normale' | 'vivace';

export type ValoriPreset = {
	pesoPanetti: number;
	idratazione: number;
	salePerLitro: number;
	oreLievitazione: number;
	oreFrigo: number;
	olioPerLitro: number;
	percentualeRiporto: number;
	tipoRiporto: TipoRiporto;
	inTeglia: boolean;
};

export type Preset = {
	id: number;
	nome: string;
	valori: ValoriPreset;
};

export const valoriPredefiniti: ValoriPreset = {
	pesoPanetti: 200,
	idratazione: 65,
	salePerLitro: 50,
	oreLievitazione: 24,
	oreFrigo: 0,
	olioPerLitro: 0,
	percentualeRiporto: 0,
	tipoRiporto: 'normale',
	inTeglia: false
};

export function clonaValori(valori: ValoriPreset): ValoriPreset {
	return { ...valori };
}
