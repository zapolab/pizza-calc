INSERT INTO `flour_type` (`name`, `sortOrder`) VALUES
	('Tipo 00', 1),
	('Tipo 0', 2),
	('Tipo 0 Super', 3),
	('Tipo 1', 4),
	('Tipo 2', 5),
	('Integrale', 6),
	('Manitoba', 7),
	('Semola di grano duro rimacinata', 8);
--> statement-breakpoint
INSERT INTO `preset` (
	`name`, `isDefault`, `doughBallCount`, `doughBallWeight`, `hydration`,
	`proofingHours`, `fridgeHours`, `saltPerLiter`, `oilPerLiter`,
	`roomTemperature`, `panPizza`, `yeastKind`, `notes`
) VALUES
	('Default', 1, 1, 200, 65, 24, 0, 50, 0, 20, 0, 'dry', '');
--> statement-breakpoint
INSERT INTO `preset_flour` (`presetId`, `slot`, `flourTypeId`, `percent`)
SELECT `preset`.`id`, 0, `flour_type`.`id`, 100
FROM `preset`, `flour_type`
WHERE `flour_type`.`name` = 'Tipo 00';
