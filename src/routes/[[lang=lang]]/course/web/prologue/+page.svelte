<!--
	The web course's prologue (spec 2026-10-27 §3.1a). It was the textbook's front door; now the
	platform's front door is the catalog, and this is one click from it. A person who opens it has
	asked for it, so it always plays, however many times they have seen it.
-->
<script lang="ts">
	import { t, getLocale } from '#lib/i18n/index.ts';
	import * as links from '#lib/links.ts';
	import Prologue, { type Answers } from '#lib/prologue/Prologue.svelte';
	import { defaultPersonaFor } from '#lib/persona/defaults.ts';
	import Seo from '#lib/seo/Seo.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const persona = defaultPersonaFor(getLocale());
	const example: Answers = {
		who: `${persona.name}, ${persona.people[0].role.split(',')[0]}`,
		forWhom: persona.forWhom,
		action: persona.mainAction.label
	};

	async function seen() {
		const { db, progress } = await import('#lib/learner.ts');
		await progress.setSetting(await db(), 'prologueSeen', true);
	}

	async function save(a: Answers) {
		const [{ db, progress }, { fromAnswers }] = await Promise.all([import('#lib/learner.ts'), import('#lib/persona/render.ts')]);
		const d = await db();
		for (const [k, v] of Object.entries(fromAnswers(a))) await progress.setPersona(d, k, v);
		await seen();
	}
</script>

<Seo title={t('seo.prologue.title')} description={t('seo.prologue')} noindex />

<div class="container">
	<Prologue title={data.title} {example} onsave={save} onskip={seen} startHref={data.first ? links.lesson(data.first) : links.map()} skipHref={links.map()} />
</div>
