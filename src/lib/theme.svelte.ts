import { browser } from '$app/environment';
import {
	DARK_QUERY,
	parseChoice,
	resolveTheme,
	THEME_STORAGE_KEY,
	type Theme,
	type ThemeChoice
} from './theme';

class ThemeState {
	#choice = $state<ThemeChoice>('auto');
	#systemPrefersDark = $state(false);

	constructor() {
		if (!browser) return;

		this.#choice = parseChoice(localStorage.getItem(THEME_STORAGE_KEY));

		const query = matchMedia(DARK_QUERY);
		this.#systemPrefersDark = query.matches;
		// `auto` tracks the device live, not only at load.
		query.addEventListener('change', (event) => (this.#systemPrefersDark = event.matches));
	}

	get choice(): ThemeChoice {
		return this.#choice;
	}

	set choice(choice: ThemeChoice) {
		this.#choice = choice;
		if (browser) localStorage.setItem(THEME_STORAGE_KEY, choice);
	}

	get current(): Theme {
		return resolveTheme(this.#choice, this.#systemPrefersDark);
	}
}

export const theme = new ThemeState();
