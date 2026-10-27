<!--
	«Скелет страницы по StoryBrand» (part 12, lesson 6). A wireframe of a landing page in seven
	blocks, in the order of Donald Miller's framework (a character with a want, a problem, a guide,
	a plan, a call to action, the stakes, success). Clicking a block says what it does and shows a
	weak and a stronger line for an invented repair workshop. The wording is ours.
-->
<script lang="ts">
	import './shared.css';

	const blocks = [
		{ id: 'want', name: 'Герой хочет', does: 'Первый экран: одной фразой, что человек получит, и кнопка.', weak: 'Инновационные решения для вашего бизнеса', strong: 'Починим вашу обувь за два дня' },
		{ id: 'problem', name: 'Проблема', does: 'Три слоя: что мешает снаружи, что чувствует внутри, почему это несправедливо.', weak: 'Обувь иногда ломается', strong: 'Каблук сломался перед важной встречей. Неловко идти так. Хорошей обуви не место на помойке.' },
		{ id: 'guide', name: 'Проводник', does: 'Сочувствие (мы понимаем) и компетентность (мы умеем). Здесь входите вы.', weak: 'Мы лучшая мастерская города', strong: 'Знаем, как это бывает. Чиним обувь с 2008 года; работа на гарантии 30 дней.' },
		{ id: 'plan', name: 'План', does: 'Три простых шага, которые делают путь ясным и не страшным.', weak: 'Индивидуальный подход к каждому', strong: '1. Принесите пару. 2. Скажем цену и срок. 3. Заберёте починенную.' },
		{ id: 'cta', name: 'Призыв', does: 'Прямая кнопка и мягкая («узнать больше»). Одно главное действие.', weak: 'Свяжитесь с нами по возможности', strong: 'Записаться на приём' },
		{ id: 'stakes', name: 'Что будет, если не действовать', does: 'Честно, без запугивания: что потеряет человек.', weak: 'Не упустите шанс!', strong: 'Трещину в подошве потом не склеить, придётся менять пару.' },
		{ id: 'success', name: 'Успех', does: 'Как выглядит жизнь после: образ, а не слоган.', weak: 'Наш результат вас приятно удивит', strong: 'Вы входите в зал в своих туфлях и забываете о них.' }
	];
	let i = $state(0);
	const b = $derived(blocks[i]);
</script>

<figure class="dg">
	<figcaption>Семь блоков страницы</figcaption>
	<div class="wrap">
		<ol class="page" aria-label="Схема страницы">
			{#each blocks as bl, k (bl.id)}
				<li>
					<button type="button" aria-pressed={k === i} onclick={() => (i = k)}>
						<span class="n">{k + 1}</span> {bl.name}
					</button>
				</li>
			{/each}
		</ol>
		<div aria-live="polite">
			<p class="dg-out"><strong>{i + 1}. {b.name}.</strong> {b.does}</p>
			<p class="dg-out weak">Слабо: «{b.weak}»</p>
			<p class="dg-out strong">Сильнее: «{b.strong}»</p>
		</div>
	</div>
	<p class="dg-out">Пример выдуман: обувная мастерская. Подставьте вместо неё свой проект.</p>
</figure>

<style>
	.wrap {
		display: grid;
		grid-template-columns: minmax(0, 15rem) minmax(0, 1fr);
		gap: var(--space-4);
		align-items: start;
	}
	@media (max-width: 40rem) {
		.wrap {
			grid-template-columns: 1fr;
		}
	}
	.page {
		list-style: none;
		margin: 0;
		padding: 0 !important;
		display: grid;
		gap: var(--space-2);
	}
	.page button {
		width: 100%;
		text-align: left;
	}
	.n {
		display: inline-block;
		min-width: 1.4em;
		color: var(--text-secondary);
	}
	.weak {
		color: var(--text-secondary);
		text-decoration: line-through;
		text-decoration-thickness: 1px;
	}
	.strong {
		color: var(--text-primary);
	}
</style>
