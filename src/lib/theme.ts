export type ThemeChoice = 'auto' | 'light' | 'dark';
export type Theme = 'light' | 'dark';

export const themeChoices: { id: ThemeChoice; label: string }[] = [
	{ id: 'auto', label: 'Auto' },
	{ id: 'light', label: 'Chiaro' },
	{ id: 'dark', label: 'Scuro' }
];

export const THEME_STORAGE_KEY = 'theme';

/** Class on `<html>`; the `dark:` variant and the `.dark` token block key off it. */
export const DARK_CLASS = 'dark';

export const DARK_QUERY = '(prefers-color-scheme: dark)';

export function resolveTheme(choice: ThemeChoice, systemPrefersDark: boolean): Theme {
	if (choice === 'auto') return systemPrefersDark ? 'dark' : 'light';
	return choice;
}

export function parseChoice(raw: string | null): ThemeChoice {
	return themeChoices.some((choice) => choice.id === raw) ? (raw as ThemeChoice) : 'auto';
}
