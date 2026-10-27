import { describe, it, expect } from 'vitest';
import { resolveTheme } from '#lib/theme.ts';

describe('resolveTheme', () => {
	it('uses the stored choice first', () => expect(resolveTheme('paper', false)).toBe('paper'));
	it('falls back to the system preference', () => expect(resolveTheme(null, true)).toBe('paper'));
	it('defaults to ink', () => expect(resolveTheme(null, false)).toBe('ink'));
	it('ignores junk', () => expect(resolveTheme('neon', false)).toBe('ink'));
});
