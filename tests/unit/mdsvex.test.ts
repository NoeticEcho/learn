import { it, expect } from 'vitest';

it('compiles a .svx lesson and exposes its module metadata', async () => {
	const mod = await import('../fixtures/sample.svx');
	expect(mod.metadata).toEqual({ id: 'sample' });
	expect(typeof mod.default).toBe('function');
});
