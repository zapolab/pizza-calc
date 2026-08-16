import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const flourType = sqliteTable('flour_type', {
	id: integer().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	/** Display order of the catalog (future use)*/
	sortOrder: integer().notNull()
});

export const preset = sqliteTable('preset', {
	id: integer().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	isDefault: integer({ mode: 'boolean' }).notNull().default(false),
	doughBallCount: integer().notNull(),
	doughBallWeight: integer().notNull(),
	hydration: integer().notNull(),
	proofingHours: integer().notNull(),
	fridgeHours: integer().notNull(),
	saltPerLiter: integer().notNull(),
	oilPerLiter: integer().notNull(),
	roomTemperature: integer().notNull(),
	panPizza: integer({ mode: 'boolean' }).notNull(),
	yeastKind: text({ enum: ['dry', 'fresh'] }).notNull(),
	notes: text().notNull().default('')
});

export const presetFlour = sqliteTable(
	'preset_flour',
	{
		presetId: integer()
			.notNull()
			.references(() => preset.id, { onDelete: 'cascade' }),
		/** Index in the preset's flour list */
		slot: integer().notNull(),
		flourTypeId: integer()
			.notNull()
			.references(() => flourType.id),
		percent: integer().notNull()
	},
	(t) => [primaryKey({ columns: [t.presetId, t.slot] })]
);
