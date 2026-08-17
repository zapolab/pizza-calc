CREATE TABLE `flour_type` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`sortOrder` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `preset` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`doughBallCount` integer NOT NULL,
	`doughBallWeight` integer NOT NULL,
	`hydration` integer NOT NULL,
	`proofingHours` integer NOT NULL,
	`fridgeHours` integer NOT NULL,
	`saltPerLiter` integer NOT NULL,
	`oilPerLiter` integer NOT NULL,
	`roomTemperature` integer NOT NULL,
	`panPizza` integer NOT NULL,
	`yeastKind` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `preset_flour` (
	`presetId` integer NOT NULL,
	`slot` integer NOT NULL,
	`flourTypeId` integer NOT NULL,
	`percent` integer NOT NULL,
	PRIMARY KEY(`presetId`, `slot`),
	FOREIGN KEY (`presetId`) REFERENCES `preset`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`flourTypeId`) REFERENCES `flour_type`(`id`) ON UPDATE no action ON DELETE no action
);
