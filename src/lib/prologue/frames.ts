// The era frames and Эхо, loaded when the prologue starts playing, not with the home page:
// the question screen is the first paint, and it needs none of them.
import type { Component } from 'svelte';
import type { EraId } from './sequence.ts';
import type { FrameProps } from './types.ts';
import Era1991 from './eras/1991.svelte';
import Era1996 from './eras/1996.svelte';
import Era2000 from './eras/2000.svelte';
import Era2005 from './eras/2005.svelte';
import Era2014 from './eras/2014.svelte';
import Era2025 from './eras/2025.svelte';
import EraIskin from './eras/iskin.svelte';
export { default as Echo } from '#lib/guide/Echo.svelte';

export const FRAMES: Record<EraId, Component<FrameProps>> = {
	'1991': Era1991,
	'1996': Era1996,
	'2000': Era2000,
	'2005': Era2005,
	'2014': Era2014,
	'2025': Era2025,
	iskin: EraIskin
};
