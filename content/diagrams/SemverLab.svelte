<!--
	«Версия дизайн-системы» (part 4, lesson 13). Each change to a system is one of three kinds: it
	breaks what people already built (major), adds something without breaking (minor), or fixes
	without changing the contract (patch). Apply changes one after another, watch the version
	number move and the changelog grow, and read what each change costs the people who use the
	system.
-->
<script lang="ts">
	import './shared.css';

	type Kind = 'major' | 'minor' | 'patch';
	type Change = { id: string; name: string; kind: Kind; cost: string; note: string };
	const changes: Change[] = [
		{ id: 'rename', name: 'Переименовать токен color.accent в color.brand', kind: 'major', cost: 'Все, кто ссылался на старое имя, получат поломку.', note: 'Переименование ломает контракт. Мягкий путь: оставить старое имя как устаревшее на несколько версий.' },
		{ id: 'value', name: 'Поменять значение токена: акцент чуть темнее', kind: 'minor', cost: 'Ничего не ломается, но вид у всех чуть изменится: предупредите в списке изменений.', note: 'Значение меняется, имя остаётся: чаще это минорное изменение. Если меняется заметно, считайте его мажорным.' },
		{ id: 'add', name: 'Добавить компонент «Подсказка»', kind: 'minor', cost: 'Ничего не ломается: у людей появляется новое.', note: 'Новое без поломки старого это минорная версия.' },
		{ id: 'fix', name: 'Исправить: фокус на кнопке не был виден в тёмной теме', kind: 'patch', cost: 'Ничего не ломается: исправление улучшает то, что уже обещано.', note: 'Исправление без смены контракта это патч.' },
		{ id: 'remove', name: 'Удалить устаревший компонент «Карусель»', kind: 'major', cost: 'Тот, кто пользуется каруселью, останется без неё.', note: 'Удаление ломает. Поэтому сначала помечают устаревшим, пишут, чем заменить, и ждут.' },
		{ id: 'size', name: 'Сделать кнопку по умолчанию крупнее', kind: 'major', cost: 'Раскладки, подогнанные под старый размер, поедут.', note: 'Изменение умолчаний ломает чужие страницы, даже если код не менялся.' },
		{ id: 'doc', name: 'Поправить опечатку в описании компонента', kind: 'patch', cost: 'Ничего.', note: 'Документация без изменения кода часто даже не меняет версию, но записывается в список.' }
	];

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
	const kindName: Record<Kind, string> = { major: 'мажорное (ломает)', minor: 'минорное (добавляет)', patch: 'патч (исправляет)' };
</script>

<figure class="dg">
	<figcaption>Версия системы: что меняет какое число</figcaption>
	<p class="ver" aria-live="polite">Версия <strong>{v.join('.')}</strong> <span class="small">(мажорная.минорная.патч, начиная с 1.4.2)</span></p>
	<div class="list" role="group" aria-label="Изменения, которые можно внести">
		{#each changes as c (c.id)}
			<button type="button" onclick={() => apply(c)}>{c.name}</button>
		{/each}
		<button type="button" onclick={reset}>Начать заново</button>
	</div>
	{#if last}
		<div class="dg-box" aria-live="polite">
			<p><strong>{kindName[last.kind]}.</strong> {last.note}</p>
			<p><strong>Что это стоит тем, кто пользуется системой.</strong> {last.cost}</p>
		</div>
	{/if}
	{#if log.length}
		<div class="dh">Список изменений</div>
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
