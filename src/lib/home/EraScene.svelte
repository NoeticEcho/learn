<!--
	Эхо crossing the eras: the right column of the returning home on a wide screen. A window shows
	one era's web at a time (1991, 1996, 2000, 2005, 2014, 2019, 2025, Искин: the eight dots of
	Эхо's ring, design/mascot/README.md); the eras slide through it and away behind Эхо, and the
	dot of the era in the window lights on the ring.

	Decorative (aria-hidden): what it says is in the caption beside it, which is real text. Motion
	is transform and opacity only, on the compositor: the strip of eras slides, the lit dots fade.
	The ring's own `era-<n>` class would repaint the dot's fill and radius, so the scene lays a lit
	dot over each ring dot and fades it instead; Эхо itself is the approved file, untouched.

	It starts after the first paint (`run` is set two frames after mount), stops on hover, while its
	pause button is pressed and while the tab is hidden (not on focus: the scene holds nothing
	focusable, and pausing on the button's own focus would undo the button), and under
	prefers-reduced-motion it is a still: Эхо, the window on 2025, the dot of 2025 lit, the next era waiting.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import Echo from '#lib/guide/Echo.svelte';
	import { t, pick } from '#lib/i18n/index.ts';

	let run = $state(false);
	let hidden = $state(false);
	let paused = $state(false);

	onMount(() => {
		const onVis = () => (hidden = document.hidden);
		document.addEventListener('visibilitychange', onVis);
		requestAnimationFrame(() => requestAnimationFrame(() => (run = true)));
		return () => document.removeEventListener('visibilitychange', onVis);
	});

	// The eras' own words, in the edition's language: drawn text, decoration (the scene is aria-hidden).
	const W = pick({
		ru: { iskin: 'Искин', home: 'Моя домашняя страница', portal: 'ПОРТАЛ', signup: 'Зарегистрируйтесь!' },
		en: { iskin: 'Iskin', home: 'My Home Page', portal: 'PORTAL', signup: 'Sign up now!' }
	});
	const YEARS = ['1991', '1996', '2000', '2005', '2014', '2019', '2025', W.iskin];
	// Эхо's ring (design/mascot/echo.svg): era n's dot, clockwise from the top.
	const DOTS = [
		[80, 20],
		[125.25, 38.75],
		[144, 84],
		[125.25, 129.25],
		[80, 148],
		[34.75, 129.25],
		[16, 84],
		[34.75, 38.75]
	];
</script>

<div class="scene" class:run class:stopped={hidden || paused} aria-hidden="true">
	<svg class="world" viewBox="0 0 440 300" width="440" height="300" focusable="false">
		<rect class="pane" x="120.5" y="12.5" width="299" height="209" rx="6" />
		<svg class="window" x="121" y="13" width="298" height="208" viewBox="0 0 298 208">
			<g class="strip">
				<!-- 1991: a page of text and blue links, written by hand -->
				<g>
					<rect width="298" height="208" fill="#ffffff" />
					<text x="20" y="38" font-family="'Times New Roman', Times, serif" font-size="20" font-weight="bold" fill="#000">World Wide Web</text>
					<g fill="#000" opacity=".8">
						<rect x="20" y="54" width="250" height="5" /><rect x="20" y="66" width="232" height="5" /><rect x="20" y="78" width="180" height="5" />
					</g>
					<g fill="#0000ee"><rect x="20" y="102" width="96" height="5" /><rect x="20" y="118" width="128" height="5" /><rect x="20" y="134" width="72" height="5" /></g>
					<g fill="#0000ee"><rect x="20" y="108" width="96" height="1" /><rect x="20" y="124" width="128" height="1" /><rect x="20" y="140" width="72" height="1" /></g>
					<g fill="#000" opacity=".8"><rect x="20" y="164" width="240" height="5" /><rect x="20" y="176" width="150" height="5" /></g>
				</g>
				<!-- 1996: grey, a table, a hit counter, under construction -->
				<g transform="translate(298 0)">
					<rect width="298" height="208" fill="#c0c0c0" />
					<rect x="14" y="14" width="270" height="34" fill="#000080" />
					<text x="149" y="37" text-anchor="middle" font-family="'Comic Sans MS', 'Comic Neue', cursive" font-size="16" fill="#ffff00">{W.home}</text>
					<g fill="#fff" stroke="#808080" stroke-width="2">
						<rect x="14" y="58" width="80" height="92" /><rect x="102" y="58" width="182" height="92" />
					</g>
					<g fill="#0000ee"><rect x="22" y="70" width="56" height="4" /><rect x="22" y="84" width="48" height="4" /><rect x="22" y="98" width="60" height="4" /></g>
					<g fill="#000" opacity=".7"><rect x="112" y="70" width="160" height="4" /><rect x="112" y="82" width="150" height="4" /><rect x="112" y="94" width="164" height="4" /></g>
					<path d="M190 112 l6 14 14 1 -11 9 4 14 -13 -8 -13 8 4 -14 -11 -9 14 -1 Z" fill="#ff0000" />
					<g transform="translate(14 160)">
						<rect width="200" height="18" fill="#ffd400" />
						<path d="M8 0 h14 l-12 18 h-14 Z M38 0 h14 l-12 18 h-14 Z M68 0 h14 l-12 18 h-14 Z M98 0 h14 l-12 18 h-14 Z M128 0 h14 l-12 18 h-14 Z M158 0 h14 l-12 18 h-14 Z M188 0 h12 v4 l-10 14 h-14 Z" fill="#111" />
					</g>
					<rect x="222" y="160" width="62" height="18" fill="#000" />
					<text x="253" y="174" text-anchor="middle" font-family="'Courier New', monospace" font-size="13" fill="#39ff14">001996</text>
				</g>
				<!-- 2000: the portal and its intro -->
				<g transform="translate(596 0)">
					<rect width="298" height="208" fill="#0b1f3a" />
					<circle cx="149" cy="92" r="56" fill="none" stroke="#3fa9f5" stroke-width="3" opacity=".7" />
					<path d="M70 120 C120 40 190 40 232 80" fill="none" stroke="#f7931e" stroke-width="6" stroke-linecap="round" />
					<text x="149" y="100" text-anchor="middle" font-family="Verdana, sans-serif" font-size="18" font-weight="bold" fill="#fff" letter-spacing="2">{W.portal}</text>
					<rect x="104" y="158" width="90" height="24" rx="3" fill="none" stroke="#fff" stroke-width="1.5" />
					<text x="149" y="175" text-anchor="middle" font-family="Verdana, sans-serif" font-size="11" fill="#fff">Skip intro ›</text>
				</g>
				<!-- 2005: Web 2.0, glossy and beta -->
				<g transform="translate(894 0)">
					<defs>
						<linearGradient id="era-gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fe06a" /><stop offset=".5" stop-color="#6cbf3a" /><stop offset=".5" stop-color="#5aae2b" /><stop offset="1" stop-color="#7cc84a" /></linearGradient>
					</defs>
					<rect width="298" height="208" fill="#f4f8ff" />
					<rect width="298" height="46" fill="#d9e8fb" />
					<text x="20" y="32" font-family="'Trebuchet MS', 'Lucida Grande', sans-serif" font-size="22" font-weight="bold" fill="#ff0084">flick<tspan fill="#0063dc">r</tspan></text>
					<rect x="96" y="16" width="40" height="16" rx="8" fill="#ff7b00" />
					<text x="116" y="28" text-anchor="middle" font-family="Verdana, sans-serif" font-size="9" fill="#fff">beta</text>
					<rect x="20" y="64" width="258" height="40" rx="20" fill="url(#era-gloss)" />
					<rect x="30" y="68" width="238" height="14" rx="7" fill="#fff" opacity=".35" />
					<text x="149" y="90" text-anchor="middle" font-family="'Lucida Grande', Verdana, sans-serif" font-size="14" font-weight="bold" fill="#fff">{W.signup}</text>
					<g fill="#c9d6e8"><rect x="20" y="122" width="76" height="62" rx="6" /><rect x="111" y="122" width="76" height="62" rx="6" /><rect x="202" y="122" width="76" height="62" rx="6" /></g>
					<g fill="#fff" opacity=".5"><rect x="20" y="122" width="76" height="22" rx="6" /><rect x="111" y="122" width="76" height="22" rx="6" /><rect x="202" y="122" width="76" height="22" rx="6" /></g>
				</g>
				<!-- 2014: flat, and the phone first -->
				<g transform="translate(1192 0)">
					<rect width="298" height="208" fill="#ecf0f1" />
					<rect x="20" y="20" width="160" height="168" fill="#e74c3c" />
					<rect x="190" y="20" width="88" height="80" fill="#3498db" /><rect x="190" y="108" width="88" height="80" fill="#2ecc71" />
					<g fill="#fff"><rect x="34" y="36" width="20" height="3" /><rect x="34" y="43" width="20" height="3" /><rect x="34" y="50" width="20" height="3" /></g>
					<rect x="34" y="120" width="110" height="10" fill="#fff" /><rect x="34" y="138" width="80" height="6" fill="#fff" opacity=".7" />
					<rect x="214" y="44" width="40" height="36" rx="4" fill="none" stroke="#fff" stroke-width="3" />
					<circle cx="234" cy="148" r="16" fill="none" stroke="#fff" stroke-width="3" />
				</g>
				<!-- 2019: a design system, the parts before the pages -->
				<g transform="translate(1490 0)">
					<rect width="298" height="208" fill="#fafafa" />
					<g><rect x="20" y="20" width="36" height="36" rx="4" fill="#1d5c63" /><rect x="62" y="20" width="36" height="36" rx="4" fill="#3d8a8f" /><rect x="104" y="20" width="36" height="36" rx="4" fill="#9cc7c4" /><rect x="146" y="20" width="36" height="36" rx="4" fill="#e9c46a" /><rect x="188" y="20" width="36" height="36" rx="4" fill="#e76f51" /></g>
					<rect x="20" y="72" width="90" height="30" rx="6" fill="#1d5c63" /><rect x="40" y="84" width="50" height="6" rx="3" fill="#fff" />
					<rect x="120" y="72" width="90" height="30" rx="6" fill="none" stroke="#1d5c63" stroke-width="2" /><rect x="140" y="84" width="50" height="6" rx="3" fill="#1d5c63" />
					<rect x="222" y="78" width="40" height="20" rx="10" fill="#1d5c63" /><circle cx="252" cy="88" r="7" fill="#fff" />
					<rect x="20" y="118" width="258" height="30" rx="6" fill="#fff" stroke="#c4c9cc" stroke-width="1.5" /><rect x="32" y="130" width="90" height="6" rx="3" fill="#9aa3a8" />
					<g fill="#c4c9cc"><rect x="20" y="164" width="60" height="6" rx="3" /><rect x="88" y="164" width="40" height="6" rx="3" /><rect x="136" y="164" width="72" height="6" rx="3" /></g>
					<text x="20" y="194" font-family="ui-monospace, 'Courier New', monospace" font-size="11" fill="#5f6b70">--color-primary: #1d5c63</text>
				</g>
				<!-- 2025: the conversation -->
				<g transform="translate(1788 0)">
					<rect width="298" height="208" fill="#f7f7f8" />
					<rect x="118" y="20" width="160" height="34" rx="14" fill="#e3e3e8" /><rect x="132" y="34" width="120" height="6" rx="3" fill="#8e8e99" />
					<rect x="20" y="66" width="210" height="62" rx="14" fill="#fff" stroke="#e3e3e8" />
					<g fill="#5b5b66"><rect x="34" y="80" width="170" height="6" rx="3" /><rect x="34" y="93" width="180" height="6" rx="3" /><rect x="34" y="106" width="110" height="6" rx="3" /></g>
					<rect x="20" y="158" width="258" height="34" rx="17" fill="#fff" stroke="#d0d0d7" stroke-width="1.5" />
					<rect x="38" y="172" width="120" height="6" rx="3" fill="#b5b5bf" />
					<circle cx="260" cy="175" r="11" fill="#202123" /><path d="M260 180 v-9 m-4 4 l4 -4 4 4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" />
				</g>
				<!-- Искин: agents that do the work, and a person who sets it -->
				<g transform="translate(2086 0)">
					<rect width="298" height="208" fill="#0e1116" />
					<g stroke="#8FB7D6" stroke-width="1.5" opacity=".7" fill="none">
						<path d="M70 104 L149 52 M70 104 L149 156 M149 52 L228 104 M149 156 L228 104 M149 52 L149 156" />
					</g>
					<g fill="#0e1116" stroke="#C9A66B" stroke-width="2">
						<circle cx="70" cy="104" r="14" /><circle cx="149" cy="52" r="12" /><circle cx="149" cy="156" r="12" /><circle cx="228" cy="104" r="14" />
					</g>
					<circle cx="70" cy="104" r="5" fill="#E4CDA0" />
					<path d="M221 104 l5 5 9 -10" stroke="#8FB7D6" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
					<g fill="#8FB7D6"><circle cx="149" cy="52" r="3" /><circle cx="149" cy="156" r="3" /></g>
				</g>
				<!-- 1991 again, so the loop closes without a jump -->
				<g transform="translate(2384 0)">
					<rect width="298" height="208" fill="#ffffff" />
					<text x="20" y="38" font-family="'Times New Roman', Times, serif" font-size="20" font-weight="bold" fill="#000">World Wide Web</text>
					<g fill="#000" opacity=".8"><rect x="20" y="54" width="250" height="5" /><rect x="20" y="66" width="232" height="5" /><rect x="20" y="78" width="180" height="5" /></g>
					<g fill="#0000ee"><rect x="20" y="102" width="96" height="5" /><rect x="20" y="118" width="128" height="5" /><rect x="20" y="134" width="72" height="5" /></g>
				</g>
			</g>
		</svg>
		<svg x="300" y="230" width="120" height="30" viewBox="0 0 120 30">
			<g class="strip years">
				{#each [...YEARS, YEARS[0]] as y, i (i)}<text x={i * 298 + 120} y="22" text-anchor="end">{y}</text>{/each}
			</g>
		</svg>
	</svg>
	<div class="echo">
		<Echo size={168} />
		<svg class="lit" viewBox="0 0 160 160" focusable="false">
			{#each DOTS as [cx, cy], i (i)}<circle {cx} {cy} r="4.5" style:--k={i} class:now={i === 6} />{/each}
		</svg>
	</div>
</div>
<button type="button" class="quiet pause" aria-pressed={paused} onclick={() => (paused = !paused)}>
	{paused ? t('home.scene.play') : t('home.scene.pause')}
</button>

<style>
	/* 8 eras, 4 s each: 3.2 s in the window, 0.8 s gliding on. */
	.scene {
		--era-s: 4s;
		position: relative;
		width: 440px;
		height: 300px;
	}
	.world {
		display: block;
		overflow: visible;
	}
	.pane {
		fill: none;
		stroke: var(--border-hairline);
	}
	/* The eras keep their own colours; on Ink they are dimmed a little, so a white page of 1991
	   does not outshine the text beside it. */
	.window {
		opacity: 0.86;
	}
	:global([data-theme='paper']) .window {
		opacity: 1;
	}
	.years text {
		font-family: var(--font-mono);
		font-size: 13px;
		fill: var(--text-secondary);
		letter-spacing: 0.04em;
	}
	/* The still pose, and the reduced-motion one: the window on 2025. */
	.strip {
		transform: translateX(-1788px);
	}
	.echo {
		position: absolute;
		left: 0;
		top: 118px;
		width: 168px;
		height: 168px;
	}
	.lit {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
	}
	.lit circle {
		fill: var(--echo-400);
		opacity: 0;
	}
	.lit circle.now {
		opacity: 1;
	}
	.pause {
		margin-top: var(--space-2);
		padding-inline: 0;
		font-size: var(--text-body-sm);
	}

	@media (prefers-reduced-motion: no-preference) {
		/* Both start six eras in, on 2025, where the still pose is: no jump when the motion begins. */
		.run .strip {
			animation: eras calc(var(--era-s) * 8) cubic-bezier(0.6, 0, 0.3, 1) calc(var(--era-s) * -6) infinite;
		}
		.run .lit circle {
			opacity: 0;
			animation: lit calc(var(--era-s) * 8) linear infinite;
			animation-delay: calc(var(--era-s) * (var(--k) - 14));
		}
		.run .echo {
			animation: glide 6s ease-in-out infinite;
		}
		.scene:hover *,
		.scene.stopped *,
		.scene:hover .lit circle,
		.scene.stopped .lit circle,
		.scene:hover :global(*),
		.scene.stopped :global(*) {
			animation-play-state: paused;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.pause {
			display: none;
		}
	}

	/* Hold each era for 80% of its slot, glide to the next in the rest; the ninth panel is the first. */
	@keyframes eras {
		0%, 10% { transform: translateX(0); }
		12.5%, 22.5% { transform: translateX(-298px); }
		25%, 35% { transform: translateX(-596px); }
		37.5%, 47.5% { transform: translateX(-894px); }
		50%, 60% { transform: translateX(-1192px); }
		62.5%, 72.5% { transform: translateX(-1490px); }
		75%, 85% { transform: translateX(-1788px); }
		87.5%, 97.5% { transform: translateX(-2086px); }
		100% { transform: translateX(-2384px); }
	}
	/* A dot is lit while its era is in the window, and crossfades with the next during the glide. */
	@keyframes lit {
		0%, 10% { opacity: 1; }
		12.5%, 97.5% { opacity: 0; }
		100% { opacity: 1; }
	}
	@keyframes glide {
		0%, 100% { transform: translate(0, 0) rotate(-3deg); }
		50% { transform: translate(6px, -5px) rotate(-1deg); }
	}
</style>
