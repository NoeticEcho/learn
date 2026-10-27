<script lang="ts">
	import Practice from '#lib/practice/Practice.svelte';
	import type { PracticeStep } from '#lib/content/schema.ts';

	const step: PracticeStep = {
		id: 'dev',
		title: 'Dev step',
		task: 'Add a heading.',
		era: 1,
		files: { 'index.html': '<p>{{name}}</p>', 'script.js': '' },
		solution: { 'index.html': '<h1>{{name}}</h1>', 'script.js': '' },
		checks: [
			{ id: 'h1', kind: 'exists', selector: 'h1' },
			{ id: 'name', kind: 'field', selector: 'h1', field: 'name' },
			{ id: 'no-inline', kind: 'noTag', tags: ['script', 'style'] }
		]
	};
	const persona = { name: 'Анна Берёзкина' };
	const prepare = (s: string) => s.replace(/\{\{name\}\}/g, persona.name);
</script>

<main style="padding: 24px">
	<Practice {step} {persona} {prepare} />
</main>
