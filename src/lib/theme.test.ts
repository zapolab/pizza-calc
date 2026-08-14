import { describe, expect, it } from 'vitest';
import { parseChoice, resolveTheme } from './theme';

describe('resolveTheme', () => {
	it('takes an explicit choice over the device', () => {
		expect(resolveTheme('light', true)).toBe('light');
		expect(resolveTheme('dark', false)).toBe('dark');
	});

	it('follows the device on auto', () => {
		expect(resolveTheme('auto', true)).toBe('dark');
		expect(resolveTheme('auto', false)).toBe('light');
	});
});

describe('parseChoice', () => {
	it('keeps every valid choice', () => {
		expect(parseChoice('auto')).toBe('auto');
		expect(parseChoice('light')).toBe('light');
		expect(parseChoice('dark')).toBe('dark');
	});

	it('falls back to auto on missing or unknown storage', () => {
		expect(parseChoice(null)).toBe('auto');
		expect(parseChoice('')).toBe('auto');
		expect(parseChoice('sepia')).toBe('auto');
	});
});
