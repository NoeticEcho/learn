<!--
	«Версия дизайн-системы» (part 4, lesson 13). Each change to a system is one of three kinds: it
	breaks what people already built (major), adds something without breaking (minor), or fixes
	without changing the contract (patch). Apply changes one after another, watch the version
	number move and the changelog grow, and read what each change costs the people who use the
	system.
-->
<script lang="ts">
	import './shared.css';
	import { pick } from '#lib/i18n/index.ts';

	type Kind = 'major' | 'minor' | 'patch';
	type Change = { id: string; name: string; kind: Kind; cost: string; note: string };
	// The diagram's words, one table per edition (docs/content-plan/README.md, «English edition»);
	// which kind each change is stays the same in both.
	const W = pick({
		ru: {
			changes: {
				rename: ['Переименовать токен color.accent в color.brand', 'Все, кто ссылался на старое имя, получат поломку.', 'Переименование ломает контракт. Мягкий путь: оставить старое имя как устаревшее на несколько версий.'],
				value: ['Поменять значение токена: акцент чуть темнее', 'Ничего не ломается, но вид у всех чуть изменится: предупредите в списке изменений.', 'Значение меняется, имя остаётся: чаще это минорное изменение. Если меняется заметно, считайте его мажорным.'],
				add: ['Добавить компонент «Подсказка»', 'Ничего не ломается: у людей появляется новое.', 'Новое без поломки старого это минорная версия.'],
				fix: ['Исправить: фокус на кнопке не был виден в тёмной теме', 'Ничего не ломается: исправление улучшает то, что уже обещано.', 'Исправление без смены контракта это патч.'],
				remove: ['Удалить устаревший компонент «Карусель»', 'Тот, кто пользуется каруселью, останется без неё.', 'Удаление ломает. Поэтому сначала помечают устаревшим, пишут, чем заменить, и ждут.'],
				size: ['Сделать кнопку по умолчанию крупнее', 'Раскладки, подогнанные под старый размер, поедут.', 'Изменение умолчаний ломает чужие страницы, даже если код не менялся.'],
				doc: ['Поправить опечатку в описании компонента', 'Ничего.', 'Документация без изменения кода часто даже не меняет версию, но записывается в список.']
			} as Record<string, string[]>,
			kindName: { major: 'мажорное (ломает)', minor: 'минорное (добавляет)', patch: 'патч (исправляет)' } as Record<Kind, string>,
			caption: 'Версия системы: что меняет какое число',
			version: 'Версия',
			scheme: '(мажорная.минорная.патч, начиная с 1.4.2)',
			group: 'Изменения, которые можно внести',
			again: 'Начать заново',
			cost: 'Что это стоит тем, кто пользуется системой.',
			log: 'Список изменений'
		},
		en: {
			changes: {
				rename: ['Rename the token color.accent to color.brand', 'Everyone who used the old name gets a break.', 'A rename breaks the contract. The gentle way: keep the old name as deprecated for a few versions.'],
				value: ['Change a token’s value: the accent a little darker', 'Nothing breaks, but the look changes a little for everyone: warn them in the changelog.', 'The value changes and the name stays: more often a minor change. If it changes noticeably, count it as major.'],
				add: ['Add a “Tooltip” component', 'Nothing breaks: people get something new.', 'Something new that breaks nothing old is a minor version.'],
				fix: ['Fix: the focus on a button was not visible in the dark theme', 'Nothing breaks: the fix improves what was already promised.', 'A fix that doesn’t change the contract is a patch.'],
				remove: ['Remove the deprecated “Carousel” component', 'Whoever uses the carousel is left without it.', 'Removal breaks things. So you first mark it deprecated, say what replaces it, and wait.'],
				size: ['Make the default button larger', 'Layouts fitted to the old size will shift.', 'Changing defaults breaks other people’s pages even if no code changed.'],
				doc: ['Fix a typo in a component’s description', 'Nothing.', 'Documentation without a code change often doesn’t even change the version, but it is written in the log.']
			} as Record<string, string[]>,
			kindName: { major: 'major (breaks)', minor: 'minor (adds)', patch: 'patch (fixes)' } as Record<Kind, string>,
			caption: 'A system’s version: which change moves which number',
			version: 'Version',
			scheme: '(major.minor.patch, starting from 1.4.2)',
			group: 'Changes you can make',
			again: 'Start again',
			cost: 'What this costs the people who use the system.',
			log: 'The changelog'
		}
	});
	const kinds: Record<string, Kind> = { rename: 'major', value: 'minor', add: 'minor', fix: 'patch', remove: 'major', size: 'major', doc: 'patch' };
	const changes: Change[] = Object.keys(kinds).map((id) => ({ id, name: W.changes[id][0], kind: kinds[id], cost: W.changes[id][1], note: W.changes[id][2] }));

	let v = $state<[number, number, number]>([1, 4, 2]);
	let log = $state<{ v: string; text: string; kind: Kind }[]>([]);
	let last = $state<Change | null>(null);

	function apply(c: Change) {
		const [a, b, p] = v;
		v = c.kind === 'major' ? [a + 1, 0, 0] : c.kind === 'minor' ? [a, b + 1, 0] : [a, b, p + 1];
		log = [{ v: v.join('.'), text: c.name, kind: c.kind }, ...log];
		last = c;
	}
	function reset() {
		v = [1, 4, 2];
		log = [];
		last = null;
	}
	const kindName = W.kindName;
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<p class="ver" aria-live="polite">{W.version} <strong>{v.join('.')}</strong> <span class="small">{W.scheme}</span></p>
	<div class="list" role="group" aria-label={W.group}>
		{#each changes as c (c.id)}
			<button type="button" onclick={() => apply(c)}>{c.name}</button>
		{/each}
		<button type="button" onclick={reset}>{W.again}</button>
	</div>
	{#if last}
		<div class="dg-box" aria-live="polite">
			<p><strong>{kindName[last.kind]}.</strong> {last.note}</p>
			<p><strong>{W.cost}</strong> {last.cost}</p>
		</div>
	{/if}
	{#if log.length}
		<div class="dh">{W.log}</div>
		<ol class="log" reversed>
			{#each log as l, i (i)}
				<li><code class="dg-mono">{l.v}</code> · {l.text} <span class="small">· {kindName[l.kind]}</span></li>
			{/each}
		</ol>
	{/if}
</figure>

<style>
	.ver {
		margin: 0 0 var(--space-3);
		font-size: var(--text-body-lg);
		color: var(--text-primary);
	}
	.small {
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.list {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}
	.list button {
		text-align: left;
		padding: var(--space-2) var(--space-3) !important;
	}
	.dg-box p {
		margin: 0 0 var(--space-2);
	}
	.dh {
		margin: var(--space-4) 0 var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-body-sm);
		color: var(--text-secondary);
	}
	.log {
		margin: 0 !important;
		display: grid;
		gap: var(--space-1);
	}
</style>
