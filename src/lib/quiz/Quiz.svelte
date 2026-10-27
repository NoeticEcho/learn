<!--
	The lesson test (spec §3.4): one question at a time, keyboard-first. Order and match use
	buttons and selects, never drag-only, so they work from a keyboard and on a phone.
	A wrong answer shows the lesson's «why» for the option that misled.
-->
<script lang="ts">
	import type { Question } from '#lib/content/schema.ts';
	import { t } from '#lib/i18n/index.ts';
	import { grade, shuffle, type Graded } from './grade.ts';

	type Props = {
		questions: Question[];
		seed?: string;
		onanswer?: (i: number, correct: boolean) => void;
		ondone?: (right: number, total: number) => void;
		/** Grades a `code` question; the lesson page wires it to the practice sandbox. */
		gradeCode?: (q: Extract<Question, { type: 'code' }>, code: string) => Promise<boolean>;
	};
	let { questions, seed = 'quiz', onanswer, ondone, gradeCode }: Props = $props();

	const uid = $props.id();
	let index = $state(0);
	let result = $state<Graded | null>(null);
	let right = $state(0);
	let finished = $state(false);

	let single = $state<number | null>(null);
	let multiple = $state<number[]>([]);
	let order = $state<string[]>([]);
	let match = $state<Record<string, string>>({});
	let code = $state('');
	let busy = $state(false);

	const q = $derived(questions[index]);
	const matchRights = $derived(q?.type === 'match' ? shuffle(q.pairs.map((p) => p[1]), `${seed}:${index}:r`) : []);

	function reset() {
		result = null;
		single = null;
		multiple = [];
		match = {};
		order = q?.type === 'order' ? shuffle(q.items, `${seed}:${index}`) : [];
		code = q?.type === 'code' ? q.starter : '';
	}
	$effect.pre(() => {
		void index;
		reset();
	});

	const answered = $derived.by(() => {
		if (!q) return false;
		switch (q.type) {
			case 'single':
				return single !== null;
			case 'multiple':
				return multiple.length > 0;
			case 'order':
				return true;
			case 'match':
				return q.pairs.every(([l]) => !!match[l]);
			case 'code':
				return code.trim().length > 0;
		}
	});

	function move(i: number, d: -1 | 1) {
		const j = i + d;
		if (j < 0 || j >= order.length) return;
		const next = [...order];
		[next[i], next[j]] = [next[j], next[i]];
		order = next;
	}

	async function check(e: SubmitEvent) {
		e.preventDefault();
		if (!q || result || !answered) return;
		let r: Graded;
		if (q.type === 'code') {
			busy = true;
			const ok = gradeCode ? await gradeCode(q, code) : false;
			busy = false;
			r = ok ? { correct: true } : { correct: false, why: t('quiz.wrong.code') };
		} else {
			const response =
				q.type === 'single' ? single : q.type === 'multiple' ? multiple : q.type === 'order' ? order : Object.entries(match);
			r = grade(q, response);
			if (!r.correct && !r.why && q.type === 'order') r = { ...r, why: t('quiz.wrong.order') };
			if (!r.correct && !r.why && q.type === 'match') r = { ...r, why: t('quiz.wrong.match') };
		}
		result = r;
		if (r.correct) right++;
		onanswer?.(index, r.correct);
	}

	function next() {
		if (index + 1 < questions.length) index++;
		else {
			finished = true;
			ondone?.(right, questions.length);
		}
	}

	function retry() {
		index = 0;
		right = 0;
		finished = false;
		reset();
	}
</script>

<section class="quiz" aria-label={t('quiz.label')}>
	{#if finished}
		<div class="summary" role="status">
			<p class="score">{right === questions.length ? t('quiz.done.perfect') : t('quiz.done', { right, n: questions.length })}</p>
			<button type="button" class="secondary" onclick={retry}>{t('quiz.retry')}</button>
		</div>
	{:else if q}
		<p class="progress">{t('quiz.progress', { i: index + 1, n: questions.length })}</p>
		<form onsubmit={check}>
			<fieldset disabled={!!result}>
				<legend class="prompt">{q.prompt}</legend>

				{#if q.type === 'single' || q.type === 'multiple'}
					<p class="hint">{q.type === 'single' ? t('quiz.choose.one') : t('quiz.choose.many')}</p>
					<div class="options">
						{#each q.options as option, i (i)}
							{@const wrongPick = result && !result.correct && (q.type === 'single' ? single === i : multiple.includes(i))}
							<label class="option" class:wrong={wrongPick}>
								{#if q.type === 'single'}
									<input type="radio" name="{uid}-q{index}" value={i} bind:group={single} />
								{:else}
									<input type="checkbox" value={i} bind:group={multiple} />
								{/if}
								<span>{option}</span>
							</label>
						{/each}
					</div>
				{:else if q.type === 'order'}
					<p class="hint">{t('quiz.order.hint')}</p>
					<ol class="order">
						{#each order as item, i (item)}
							<li>
								<span class="item">{item}</span>
								<span class="moves">
									<button type="button" class="icon" disabled={i === 0} aria-label={t('quiz.up', { item })} onclick={() => move(i, -1)}>↑</button>
									<button type="button" class="icon" disabled={i === order.length - 1} aria-label={t('quiz.down', { item })} onclick={() => move(i, 1)}>↓</button>
								</span>
							</li>
						{/each}
					</ol>
				{:else if q.type === 'match'}
					<p class="hint">{t('quiz.match.hint')}</p>
					<div class="match">
						{#each q.pairs as [left], i (left)}
							<label class="pair" for="{uid}-m{index}-{i}">{left}</label>
							<select id="{uid}-m{index}-{i}" bind:value={match[left]} aria-label={t('quiz.pair', { item: left })}>
								<option value="" disabled selected>{t('quiz.pick')}</option>
								{#each matchRights as r (r)}<option value={r}>{r}</option>{/each}
							</select>
						{/each}
					</div>
				{:else if q.type === 'code'}
					<label class="hint" for="{uid}-code{index}">{t('quiz.code.label')}</label>
					<textarea id="{uid}-code{index}" class="code" rows="6" spellcheck="false" bind:value={code}></textarea>
				{/if}
			</fieldset>

			<div class="actions">
				{#if !result}
					<button type="submit" class="primary" disabled={!answered || busy}>{t('quiz.check')}</button>
				{:else}
					<button type="button" class="primary" onclick={next}>
						{index + 1 < questions.length ? t('quiz.next') : t('quiz.finish')}
					</button>
				{/if}
			</div>
		</form>

		<div class="feedback" role="status" aria-live="polite">
			{#if result}
				<p class:right={result.correct} class:wrong={!result.correct}>
					<strong>{result.correct ? t('quiz.right') : t('quiz.wrong')}</strong>
					{#if result.why}{' '}{result.why}{/if}
				</p>
			{/if}
		</div>
	{/if}
</section>

<style>
	/* A test is read, not laid out: options as long as a line of the theory, not the screen. */
	.quiz {
		max-width: 48rem;
	}
	.progress {
		font-size: var(--text-caption);
		font-variant-numeric: tabular-nums;
		color: var(--text-secondary);
		margin: 0 0 var(--space-3);
	}
	fieldset {
		border: 0;
		margin: 0;
		padding: 0;
		min-width: 0;
	}
	.prompt {
		font-family: var(--font-serif);
		font-size: var(--text-body-lg);
		line-height: var(--lh-body-lg);
		color: var(--text-primary);
		padding: 0;
		margin-bottom: var(--space-2);
	}
	.hint {
		display: block;
		color: var(--text-secondary);
		font-size: var(--text-body-sm);
		margin: 0 0 var(--space-4);
	}
	.options {
		display: grid;
		gap: var(--space-2);
	}
	.option {
		display: flex;
		gap: var(--space-3);
		align-items: baseline;
		min-height: var(--hit-min);
		padding: var(--space-3) var(--space-4);
		border: var(--line) solid var(--border-hairline);
		color: var(--text-body);
		cursor: pointer;
		transition: border-color var(--dur-micro) var(--ease-stop);
	}
	.option:hover {
		border-color: var(--border-brass);
		color: var(--text-primary);
	}
	.option:has(input:checked) {
		border-color: var(--accent-measure);
		color: var(--text-primary);
	}
	.option.wrong {
		border-color: var(--accent-command);
	}
	input[type='radio'],
	input[type='checkbox'] {
		accent-color: var(--brass-500);
		transform: translateY(1px);
	}
	.order {
		list-style: none;
		margin: 0;
		padding: 0;
		counter-reset: step;
		display: grid;
		gap: var(--space-2);
	}
	.order li {
		counter-increment: step;
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-2) var(--space-2) var(--space-4);
		border: var(--line) solid var(--border-hairline);
	}
	.order li::before {
		content: counter(step);
		font-variant-numeric: tabular-nums;
		font-size: var(--text-caption);
		color: var(--text-secondary);
		min-width: 2ch;
	}
	.order .item {
		flex: 1;
		color: var(--text-primary);
	}
	.moves {
		display: flex;
		gap: var(--space-1);
	}
	.match {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
		gap: var(--space-3) var(--space-4);
		align-items: center;
	}
	.pair {
		color: var(--text-primary);
	}
	select,
	textarea {
		background: var(--surface-body);
		border: var(--line) solid var(--field-edge);
		border-radius: 0;
		min-height: var(--hit-min);
		padding: var(--space-2) var(--space-3);
		width: 100%;
	}
	textarea.code {
		font-family: var(--font-mono);
		font-size: var(--text-body-sm);
	}
	.actions {
		margin-top: var(--space-5);
	}
	.feedback p {
		margin: var(--space-4) 0 0;
		padding-left: var(--space-4);
		border-left: 2px solid var(--accent-measure);
		color: var(--text-body);
		max-width: var(--measure);
	}
	.feedback p.wrong {
		border-left-color: var(--accent-command);
	}
	.feedback strong {
		color: var(--text-primary);
		font-weight: var(--weight-medium);
	}
	.summary .score {
		font-family: var(--font-serif);
		font-size: var(--text-body-lg);
		color: var(--text-primary);
		margin: 0 0 var(--space-4);
	}
	@media (max-width: 600px) {
		.match {
			grid-template-columns: 1fr;
			gap: var(--space-1);
		}
		.match select {
			margin-bottom: var(--space-3);
		}
	}
</style>
