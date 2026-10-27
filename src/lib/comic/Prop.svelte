<!--
	One prop of the comic kit (kit.ts), drawn in a 150 × 130 box in the system's line language:
	brass strokes on ink bodies (no window has traffic lights: a browser is its address field), the CRT's amber only on a 1991 screen, the echo light for what is
	alive (a link, a packet in flight, a lit LED). Every colour is a token, so Paper redraws it.
	The label is drawn text and the whole scene is aria-hidden: whatever the label says, the
	panel's lines must say too.
-->
<script lang="ts">
	import type { PropName } from './kit.ts';

	type Props = { name: PropName; label?: string };
	let { name, label }: Props = $props();

	const parts = $derived((label ?? '').split('|').map((s) => s.trim()).filter(Boolean));
	/** A label wider than its room is squeezed into it, never past the prop's edge. */
	const fit = (text: string | undefined, room: number, size: number) =>
		text && text.length * size * 0.6 > room ? room : undefined;
	const numbers = $derived(label ? label.split(/\s+/).filter(Boolean).slice(0, 3) : ['1', '2', '3']);
</script>

{#if name === 'crt'}
	<rect class="body" x="14" y="4" width="122" height="96" rx="7" />
	<rect class="screen crt-screen" x="26" y="15" width="98" height="70" rx="4" />
	{#if label}
		<text class="amber t code" x="33" y="33" textLength={fit(label, 86, 11)} lengthAdjust="spacingAndGlyphs">{label}</text>
	{:else}
		<text class="amber t code" x="33" y="33">WorldWideWeb</text>
	{/if}
	<path class="amber-line" d="M33 45 H104 M33 54 H92" />
	<path class="echo-line" d="M33 66 H78" />
	<path class="echo-line thin" d="M33 69 H78" />
	<path class="body" d="M58 100 L92 100 L100 116 L50 116 Z" />
	<rect class="body" x="22" y="118" width="106" height="9" />
{:else if name === 'browser-1996'}
	<rect class="body" x="4" y="8" width="142" height="116" />
	<rect class="bar96" x="7" y="11" width="136" height="13" />
	<rect class="btn" x="118" y="13" width="9" height="9" /><rect class="btn" x="130" y="13" width="9" height="9" />
	<rect class="btn" x="10" y="28" width="16" height="12" /><rect class="btn" x="29" y="28" width="16" height="12" />
	<rect class="field" x="49" y="28" width="92" height="12" />
	{#if label}<text class="t small code" x="52" y="37" textLength={fit(label, 86, 8.5)} lengthAdjust="spacingAndGlyphs">{label}</text>{/if}
	<rect class="screen paperish" x="10" y="44" width="130" height="76" />
	<path class="rule" d="M10 62 H140 M54 62 V120" />
	<path class="echo-line" d="M16 72 H46 M16 82 H44 M16 92 H46" />
	<path class="ink-line" d="M60 72 H132 M60 80 H126 M60 88 H130" />
	<rect class="counter" x="84" y="102" width="46" height="12" />
	<text class="amber t small code" x="88" y="111">000137</text>
{:else if name === 'browser'}
	<rect class="body" x="4" y="10" width="142" height="110" />
	<path class="rule" d="M4 28 H146" />
	<rect class="field" x="10" y="14" width="130" height="10" />
	{#if label}<text class="t small code" x="14" y="22" textLength={fit(label, 122, 8.5)} lengthAdjust="spacingAndGlyphs">{label}</text>{/if}
	<rect class="screen" x="10" y="34" width="130" height="80" />
	<path class="brass-line" d="M20 50 H96" />
	<path class="ink-line" d="M20 64 H128 M20 73 H120 M20 82 H110" />
	<rect class="action" x="20" y="94" width="40" height="11" />
{:else if name === 'editor'}
	<rect class="body" x="2" y="10" width="146" height="110" />
	<path class="rule" d="M75 10 V120 M2 24 H148" />
	<text class="t small code" x="8" y="20" textLength={fit(label ?? 'index.html', 62, 8.5)} lengthAdjust="spacingAndGlyphs">{label ?? 'index.html'}</text>
	<path class="brass-line" d="M9 36 H32" /><path class="echo-line" d="M36 36 H58" />
	<path class="ink-line" d="M15 48 H50 M15 58 H66 M15 68 H44" />
	<path class="brass-line" d="M9 80 H30" />
	<path class="ink-line" d="M15 92 H60 M15 102 H38" />
	<rect class="screen paperish" x="80" y="29" width="62" height="86" />
	<path class="heading" d="M86 42 H126" />
	<path class="ink-line" d="M86 54 H136 M86 62 H130 M86 70 H134" />
	<path class="echo-line" d="M86 82 H112" />
{:else if name === 'phone'}
	<rect class="body" x="46" y="4" width="60" height="122" rx="9" />
	<rect class="screen" x="51" y="15" width="50" height="98" rx="2" />
	<rect class="dot" x="68" y="8" width="16" height="3" />
	{#if label}<text class="t tiny" x="55" y="26" textLength={fit(label, 42, 7)} lengthAdjust="spacingAndGlyphs">{label}</text>{/if}
	<path class="brass-line" d="M56 38 H90" />
	<path class="ink-line" d="M56 50 H96 M56 58 H92 M56 66 H96 M56 74 H84" />
	<rect class="action" x="56" y="90" width="40" height="12" />
	<path class="rule" d="M68 119 H84" />
{:else if name === 'server'}
	<rect class="body" x="38" y="2" width="76" height="126" />
	{#each [0, 1, 2, 3] as u (u)}
		<rect class="unit" x="43" y={8 + u * 30} width="66" height="24" />
		<circle class={u === 1 ? 'led amber-fill' : 'led'} cx="51" cy={20 + u * 30} r="2.4" />
		<path class="rule" d="M60 {15 + u * 30} H102 M60 {20 + u * 30} H102 M60 {25 + u * 30} H102" />
	{/each}
	{#if label}
		<rect class="tag" x="14" y="104" width="124" height="16" />
		<text class="t small" x="20" y="115" textLength={fit(label, 112, 8.5)} lengthAdjust="spacingAndGlyphs">{label}</text>
	{/if}
{:else if name === 'network'}
	<path class="brass-line" d="M22 92 L60 40 L112 30 L136 84 L76 112 Z M60 40 L76 112 M22 92 L136 84" />
	{#each [[22, 92], [60, 40], [112, 30], [136, 84], [76, 112]] as [x, y], i (i)}
		<rect class="node" x={x - 9} y={y - 7} width="18" height="14" />
		<path class="echo-line thin" d="M{x - 5} {y} H{x + 5}" />
	{/each}
	<circle class="led" cx="92" cy="33.8" r="3" />
	{#if label}<text class="t small" x="4" y="128" textLength={fit(label, 142, 8.5)} lengthAdjust="spacingAndGlyphs">{label}</text>{/if}
{:else if name === 'flowchart'}
	{@const boxes = (parts.length ? parts : ['', '', '', '']).slice(0, 4)}
	{#each boxes as b, i (i)}
		{@const x = i % 2 === 0 ? (i === 0 ? 4 : 86) : i === 1 ? 86 : 4}
		{@const y = i < 2 ? 20 : 86}
		<rect class="box" {x} {y} width="60" height="26" />
		{#if b}<text class="t small" x={x + 30} y={y + 16} text-anchor="middle" textLength={fit(b, 54, 8.5)} lengthAdjust="spacingAndGlyphs">{b}</text>{:else}<path class="ink-line" d="M{x + 10} {y + 13} H{x + 50}" />{/if}
	{/each}
	<path class="arrow" d="M66 33 H82 M78 29 L82 33 L78 37" />
	{#if boxes.length > 2}<path class="arrow" d="M116 48 V82 M112 78 L116 82 L120 78" />{/if}
	{#if boxes.length > 3}<path class="arrow" d="M84 99 H68 M72 95 L68 99 L72 103" />{/if}
{:else if name === 'packets'}
	{#each numbers as n, i (i)}
		{@const x = [8, 54, 98][i]}
		{@const y = [70, 26, 62][i]}
		<g transform="rotate({[-8, 5, -3][i]} {x + 22} {y + 15})">
			<rect class="body" {x} {y} width="44" height="30" />
			<path class="rule" d="M{x} {y} L{x + 22} {y + 16} L{x + 44} {y}" />
			<text class="echo-fill t code" x={x + 22} y={y + 27} text-anchor="middle">{n}</text>
		</g>
	{/each}
	<path class="echo-line dash" d="M4 118 C40 108 70 124 104 112 S140 104 148 108" />
{:else if name === 'envelope'}
	<rect class="body" x="6" y="28" width="138" height="84" />
	<path class="rule" d="M6 28 L75 76 L144 28" />
	<circle class="seal" cx="75" cy="76" r="10" />
	<path class="seal-mark" d="M70 76 H80 M75 71 V81" />
	{#if label}<text class="t small" x="74" y="104" text-anchor="middle" textLength={fit(label, 124, 8.5)} lengthAdjust="spacingAndGlyphs">{label}</text>{/if}
{:else if name === 'postcard'}
	<rect class="body paperish" x="4" y="24" width="142" height="92" />
	<path class="rule" d="M82 34 V106" />
	<rect class="stamp" x="118" y="32" width="20" height="24" />
	<path class="ink-line" d="M92 74 H138 M92 86 H138 M92 98 H130" />
	<text class="t small" x="12" y="46" textLength={fit(label ?? 'пароль: …', 64, 8.5)} lengthAdjust="spacingAndGlyphs">{label ?? 'пароль: …'}</text>
	<path class="echo-line" d="M12 60 Q24 55 36 60 T60 60 T74 60 M12 74 Q24 69 36 74 T60 74" />
{:else if name === 'lock'}
	<path class="shackle" d="M54 62 V44 A21 21 0 0 1 96 44 V62" />
	<rect class="body" x="40" y="60" width="70" height="54" />
	<circle class="seal" cx="75" cy="82" r="6" />
	<path class="brass-line" d="M75 86 V98" />
	{#if label}<text class="t small" x="75" y="128" text-anchor="middle" textLength={fit(label, 140, 8.5)} lengthAdjust="spacingAndGlyphs">{label}</text>{/if}
{:else if name === 'certificate'}
	<rect class="body paperish" x="12" y="6" width="126" height="108" />
	<rect class="rule-box" x="18" y="12" width="114" height="96" />
	<text class="t small" x="75" y="30" text-anchor="middle" textLength={fit(label ?? 'сертификат', 100, 8.5)} lengthAdjust="spacingAndGlyphs">{label ?? 'сертификат'}</text>
	<path class="ink-line" d="M30 44 H120 M30 54 H112 M30 64 H118" />
	<path class="seal-ribbon" d="M98 92 L92 122 L100 116 L106 124 L110 94" />
	<circle class="seal" cx="104" cy="88" r="12" />
	<path class="seal-mark" d="M98 88 L102 92 L110 83" />
{:else if name === 'cards'}
	<rect class="body" x="22" y="26" width="104" height="70" transform="rotate(-7 74 61)" />
	<rect class="body" x="26" y="30" width="104" height="70" transform="rotate(4 78 65)" />
	<rect class="body paperish" x="22" y="36" width="106" height="72" />
	<text class="t" x="75" y="68" text-anchor="middle" textLength={fit(label ?? '?', 92, 11)} lengthAdjust="spacingAndGlyphs">{label ?? '?'}</text>
	<path class="ink-line" d="M40 88 H110" />
{:else if name === 'sheet'}
	<path class="body paperish" d="M30 4 H104 L122 22 V126 H30 Z" />
	<path class="rule" d="M104 4 V22 H122" />
	{#if label}<text class="t small" x="38" y="34" textLength={fit(label, 76, 8.5)} lengthAdjust="spacingAndGlyphs">{label}</text>{/if}
	{#each [0, 1, 2, 3, 4, 5, 6] as l (l)}
		<path class="ink-line" d="M38 {48 + l * 11} H{l % 3 === 2 ? 92 : 112}" />
	{/each}
{/if}

<style>
	* {
		vector-effect: non-scaling-stroke;
	}
	.body,
	.unit,
	.node,
	.box,
	.tag,
	.counter,
	.stamp {
		fill: var(--ink-200);
		stroke: var(--brass-700);
		stroke-width: 1.4;
		stroke-linejoin: round;
	}
	.paperish {
		fill: var(--ink-300);
	}
	.unit {
		fill: var(--ink-100);
	}
	.screen {
		fill: var(--ink-000);
		stroke: var(--brass-700);
		stroke-width: 1;
	}
	/* A CRT is dark in both themes: its amber is phosphor light on black, not a themed ink. */
	.crt-screen {
		fill: var(--crt-ground);
	}
	.field,
	.rule-box {
		fill: var(--ink-000);
		stroke: var(--rule-600);
		stroke-width: 1;
	}
	.rule-box {
		fill: none;
	}
	.bar96 {
		fill: var(--brass-900);
	}
	.btn {
		fill: var(--ink-300);
		stroke: var(--rule-600);
	}
	.rule {
		fill: none;
		stroke: var(--rule-600);
		stroke-width: 1;
	}
	.brass-line,
	.ink-line,
	.echo-line,
	.amber-line,
	.heading,
	.arrow,
	.shackle {
		fill: none;
		stroke-linecap: round;
		stroke-width: 2;
	}
	.brass-line,
	.arrow {
		stroke: var(--brass-500);
	}
	.heading {
		stroke: var(--paper-100);
		stroke-width: 3;
	}
	.ink-line {
		stroke: var(--ash-400);
		stroke-width: 1.6;
	}
	.echo-line {
		stroke: var(--echo-400);
	}
	.thin {
		stroke-width: 0.8;
	}
	.dash {
		stroke-dasharray: 2 5;
		stroke-width: 1.4;
	}
	.amber-line {
		stroke: var(--crt-amber);
		opacity: 0.75;
	}
	.shackle {
		stroke: var(--brass-500);
		stroke-width: 7;
	}
	.action {
		fill: var(--brass-700);
	}
	.dot {
		fill: var(--rule-600);
	}
	.led {
		fill: var(--echo-400);
	}
	.amber-fill {
		fill: var(--crt-amber);
	}
	.seal {
		fill: var(--brass-900);
		stroke: var(--brass-500);
		stroke-width: 1.4;
	}
	.seal-ribbon {
		fill: var(--brass-700);
	}
	.seal-mark {
		fill: none;
		stroke: var(--brass-300);
		stroke-width: 1.6;
		stroke-linecap: round;
	}
	/* Drawn words are in the body face; mono only where the drawing shows code or a machine's
	   screen (hallmark 64). */
	.t {
		font-family: var(--font-sans);
		font-size: 11px;
		fill: var(--text-body);
	}
	.code {
		font-family: var(--font-mono);
	}
	.small {
		font-size: 8.5px;
	}
	.tiny {
		font-size: 7px;
	}
	.amber {
		fill: var(--crt-amber);
	}
	.echo-fill {
		fill: var(--echo-400);
		font-size: 13px;
	}
</style>
