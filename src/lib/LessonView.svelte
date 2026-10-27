<!--
	A lesson, in the anatomy every lesson shares (spec §3.4): «Зачем», the theory (the lesson's
	own body, with its live diagram), the practice with Эхо beside it, the test, the cards, the
	sources and videos, and «Дальше». Everything about the person (their project, their key, what
	they finished) is read from the browser after mount; the page itself is prerendered.
-->
<script lang="ts">
	import { onMount, type Component } from 'svelte';
	import type { LessonMeta, Part, Question } from '#lib/content/schema.ts';
	import type { Catalogue } from '#lib/content/catalogue.ts';
	import { buildGraph, nextLessons } from '#lib/content/graph.ts';
	import { t, pl, midSentence } from '#lib/i18n/index.ts';
	import * as links from '#lib/links.ts';
	import Quiz from '#lib/quiz/Quiz.svelte';
	import Guide from '#lib/guide/Guide.svelte';
	import VideoFacade from '#lib/VideoFacade.svelte';
	import Comic from '#lib/comic/Comic.svelte';
	import type { GuideEvent } from '#lib/guide/script.ts';
	import type { ModelConfig } from '#lib/guide/model.ts';
	import type { CheckResult } from '#lib/practice/checks.ts';
	import type { Persona } from '#lib/persona/fields.ts';

	type Props = { lesson: LessonMeta; part: Part; catalogue: Catalogue; body: Component | null };
	let { lesson, part, catalogue, body: Body }: Props = $props();

	let Practice = $state<Component<any> | null>(null);
	let persona = $state<Persona | null>(null);
	let prepare = $state<(s: string) => string>((s) => s);
	let model = $state<ModelConfig | null>(null);
	let event = $state<GuideEvent>({ kind: 'enter' });
	let attempt = 0;
	let done = $state(false);
	let justFinished = $state(false);
	let doneSet = $state(new Set<string>());
	let code = '';

	const era = $derived(lesson.practice?.era ?? part.era ?? null);
	const graph = $derived(buildGraph(catalogue.lessons, catalogue));
	const opened = $derived.by(() => {
		const before = new Set([...doneSet].filter((id) => id !== lesson.id));
		const after = new Set([...before, lesson.id]);
		const was = new Set(nextLessons(graph, before));
		return nextLessons(graph, after)
			.filter((id) => !was.has(id) && id !== lesson.id)
			.map((id) => graph.lessons.get(id)!);
	});
	const concepts = $derived(lesson.teaches.map((c) => midSentence(catalogue.concepts.find((x) => x.id === c)?.title ?? c)));

	onMount(async () => {
		const learner = await import('#lib/learner.ts');
		const d = await learner.db();
		await learner.progress.markStarted(d, lesson.id);
		doneSet = await learner.done();
		done = doneSet.has(lesson.id);
		model = await learner.ownKey();
		if (lesson.practice) {
			const [{ render }, mod, p] = await Promise.all([
				import('#lib/persona/render.ts'),
				import('#lib/practice/Practice.svelte'),
				learner.persona()
			]);
			persona = p;
			prepare = (s: string) => render(s, p);
			Practice = mod.default;
		}
	});

	// The brief lesson edits the brief on this page (BriefEditor); its practice reads the new one.
	onMount(() => {
		if (!lesson.practice) return;
		const reread = async () => {
			const [learner, { render }] = await Promise.all([import('#lib/learner.ts'), import('#lib/persona/render.ts')]);
			const next = await learner.persona();
			persona = next;
			prepare = (s: string) => render(s, next);
		};
		addEventListener('learn:brief', reread);
		return () => removeEventListener('learn:brief', reread);
	});

	const store = {
		load: async (stepId: string, file: string) => {
			const { db, progress } = await import('#lib/learner.ts');
			return progress.getFile(await db(), stepId, file);
		},
		save: async (stepId: string, file: string, text: string) => {
			const { db, progress } = await import('#lib/learner.ts');
			if (file === 'index.html') code = text;
			await progress.saveFile(await db(), stepId, file, text);
		},
		legacy: async (era: number) => {
			const { db, progress } = await import('#lib/learner.ts');
			return progress.legacyFiles(await db(), era);
		}
	};

	let practiceAwarded = false;
	async function oncheck(results: CheckResult[]) {
		const failed = results.filter((r) => !r.ok).map((r) => r.id);
		if (!failed.length) {
			event = { kind: 'pass' };
			if (!practiceAwarded) {
				practiceAwarded = true;
				const [{ db, progress }, { award }] = await Promise.all([import('#lib/learner.ts'), import('#lib/game/index.ts')]);
				const d = await db();
				const key = `practiceDone:${lesson.id}`;
				if (!(await progress.getSetting(d, key))) {
					await progress.setSetting(d, key, true);
					await award(d, 'practice');
				}
			}
		} else if (attempt++ > 0) event = { kind: 'fail', failed, attempt: attempt - 1 };
	}

	async function onanswer(i: number, correct: boolean) {
		const { db, progress } = await import('#lib/learner.ts');
		await progress.saveAnswer(await db(), lesson.id, i, correct);
	}

	async function ondone(right: number, total: number) {
		if (right !== total) return;
		const [{ db, progress }, { award }] = await Promise.all([import('#lib/learner.ts'), import('#lib/game/index.ts')]);
		const d = await db();
		const key = `quizPerfect:${lesson.id}`;
		if (!(await progress.getSetting(d, key))) {
			await progress.setSetting(d, key, true);
			await award(d, 'quizPerfect');
		}
	}

	async function gradeCode(q: Extract<Question, { type: 'code' }>, src: string) {
		const { runChecks } = await import('#lib/practice/runner.ts');
		const results = await runChecks({ 'index.html': src }, q.checks, persona ?? {});
		return results.every((r) => r.ok);
	}

	async function finish() {
		const [{ db, progress }, { award, XP }, srs] = await Promise.all([
			import('#lib/learner.ts'),
			import('#lib/game/index.ts'),
			import('#lib/srs/index.ts')
		]);
		const d = await db();
		const first = !(await progress.doneSet(d)).has(lesson.id);
		await progress.markDone(d, lesson.id, XP.lesson);
		if (first) await award(d, 'lesson');
		await srs.enrol(d, lesson.cards);
		doneSet = await progress.doneSet(d);
		done = true;
		justFinished = true;
	}

	const context = () => ({ lesson: `${lesson.title}\n${lesson.summary}`, code });
</script>

<article class="lesson">
	<header class="container head">
		<nav class="path" aria-label={t('lesson.path')}>
			<a href={links.map()}>{t('nav.map')}</a>
			<span aria-hidden="true">/</span>
			<span>{part.title}</span>
		</nav>
		<h1>{lesson.title}</h1>
		<p class="why"><span class="visually-hidden">{t('lesson.why')}: </span>{lesson.summary}</p>
		<p class="minutes">{t('lesson.minutes', { n: lesson.minutes, minutes: pl(lesson.minutes, 'minute.forms') })}</p>
	</header>

	<div class={['container theory', lesson.comic && 'has-comic']}>
		{#if lesson.comic}<Comic comic={lesson.comic} {era} />{/if}
		<div class="prose">
			{#if Body}<Body />{/if}
		</div>
	</div>

	{#if lesson.practice}
		<section class="container block" aria-labelledby="practice-h">
			<h2 id="practice-h" class="visually-hidden">{t('lesson.practice')}</h2>
			<div class="guide-row">
				<Guide lines={lesson.guide} {event} {era} {model} {context} persona={persona ?? undefined} />
			</div>
			{#if Practice && persona}
				<Practice step={lesson.practice} persona={persona as unknown as Record<string, unknown>} {prepare} {store} {oncheck} />
			{:else}
				<p class="loading">{t('lesson.persona.loading')}</p>
			{/if}
		</section>
	{:else}
		<section class="container block">
			<Guide lines={lesson.guide} {event} {era} {model} {context} />
		</section>
	{/if}

	<section class="container block" aria-labelledby="quiz-h">
		<h2 id="quiz-h">{t('lesson.quiz')}</h2>
		<Quiz questions={lesson.quiz} seed={lesson.id} {onanswer} {ondone} {gradeCode} />
	</section>

	<section class="container block" aria-labelledby="cards-h">
		<h2 id="cards-h">{t('lesson.cards')}</h2>
		<p class="note">{t('lesson.cards.note')}</p>
		<ul class="cards">
			{#each lesson.cards as c (c.id)}
				<li>
					<p class="front">{c.front}</p>
					<details><summary>{t('lesson.cards.show')}</summary><p>{c.back}</p></details>
				</li>
			{/each}
		</ul>
	</section>

	<section class="container block" aria-labelledby="sources-h">
		<h2 id="sources-h">{t('lesson.sources')}</h2>
		<ul class="sources">
			{#each lesson.sources as s (s.url)}
				<li>
					<a href={s.url} rel="noopener noreferrer" target="_blank">{s.title}</a>
					<span class="lic">{t(`licence.${s.licence}`)}, {t(`lang.${s.lang}`)}</span>
				</li>
			{/each}
		</ul>
		{#if lesson.videos.length}
			<h3>{t('lesson.videos')}</h3>
			<div class="videos">
				{#each lesson.videos as v (v.url)}<VideoFacade video={v} />{/each}
			</div>
		{/if}
	</section>

	<section class="container block next" aria-labelledby="next-h">
		<h2 id="next-h">{t('lesson.next')}</h2>
		<p>{t('lesson.next.teaches', { concepts: concepts.join(', ') })}</p>
		{#if done}
			<p class="status" role="status">{justFinished ? t('lesson.finished') : t('lesson.done.already')}</p>
			{#if opened.length}
				<p>{t('lesson.next.opens')}</p>
				<ul class="opens">
					{#each opened as l (l.id)}<li><a href={links.lesson(l.id)}>{l.title}</a></li>{/each}
				</ul>
			{:else}
				<p class="note">{t('lesson.next.none')}</p>
				<a class="secondary" href={links.map()}>{t('home.map')}</a>
			{/if}
		{:else}
			<button type="button" class="primary" onclick={finish}>{t('lesson.finish')}</button>
		{/if}
	</section>
</article>

<style>
	.head {
		padding-block: var(--space-8) var(--space-6);
	}
	.path {
		display: flex;
		gap: var(--space-2);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
		margin-bottom: var(--space-5);
	}
	.path a {
		color: var(--text-secondary);
	}
	h1 {
		font-size: var(--text-display);
		line-height: 1.02;
		max-width: 18ch;
		overflow-wrap: break-word;
		min-width: 0;
		margin-bottom: var(--space-5);
	}
	/* A two-sentence lede: at 40ch it stood as a five-line ragged column beside an empty half. */
	.why {
		margin: 0 0 var(--space-3);
		max-width: 52ch;
		font-family: var(--font-serif);
		font-size: var(--text-body-lg);
		line-height: var(--lh-body-lg);
		color: var(--text-body);
	}
	.minutes {
		margin: 0;
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	/* The comic: a strip under the header on narrow screens, the rail beside the theory on wide
	   ones. The text column keeps its measure; the rail sits a gutter after it, not at the edge. */
	.has-comic {
		display: grid;
		gap: var(--space-6);
	}
	@media (min-width: 1100px) {
		.has-comic {
			grid-template-columns: minmax(0, auto) minmax(16rem, 21rem);
			justify-content: start;
			align-items: start;
			column-gap: clamp(var(--space-7), 5vw, var(--space-9));
		}
		.has-comic > .prose {
			grid-area: 1 / 1;
		}
		.has-comic > :global(.comic) {
			grid-area: 1 / 2;
		}
	}
	.block {
		margin-top: var(--space-9);
	}
	.block > h2 {
		font-size: var(--text-display-sm);
		line-height: 1.15;
		margin-bottom: var(--space-5);
	}
	h3 {
		font-size: var(--text-body-lg);
		margin: var(--space-6) 0 var(--space-4);
	}
	.guide-row {
		margin-bottom: var(--space-6);
	}
	.loading,
	.note {
		color: var(--text-secondary);
		font-size: var(--text-body-sm);
	}
	.cards {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
		gap: var(--space-4);
	}
	.cards li {
		padding: var(--space-4);
		border: var(--line) solid var(--border-hairline);
	}
	.front {
		margin: 0 0 var(--space-2);
		font-family: var(--font-serif);
		color: var(--text-primary);
	}
	.cards summary {
		cursor: pointer;
		color: var(--text-link);
		font-size: var(--text-body-sm);
		min-height: var(--hit-min);
		display: flex;
		align-items: center;
	}
	.cards details p {
		margin: 0;
		color: var(--text-body);
	}
	.sources {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--space-3);
		max-width: var(--measure);
	}
	.sources li {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1) var(--space-3);
		align-items: baseline;
	}
	.lic {
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.videos {
		display: grid;
		gap: var(--space-5);
	}
	.next p {
		max-width: var(--measure);
		color: var(--text-body);
	}
	.status {
		color: var(--accent-state-text);
	}
	.opens {
		padding-left: var(--space-5);
	}
	@media (max-width: 600px) {
		h1 {
			font-size: var(--text-display-sm);
		}
	}
</style>
