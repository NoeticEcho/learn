<!--
	«Скелет страницы по StoryBrand» (part 12, lesson 6). A wireframe of a landing page in seven
	blocks, in the order of Donald Miller's framework (a character with a want, a problem, a guide,
	a plan, a call to action, the stakes, success). Clicking a block says what it does and shows a
	weak and a stronger line for an invented repair workshop. The wording is ours.
-->
<script lang="ts">
	import './shared.css';

	import { pick } from '#lib/i18n/index.ts';

	const W = pick({
		ru: {
			blocks: [
				{ id: 'want', name: 'Герой хочет', does: 'Первый экран: одной фразой, что человек получит, и кнопка.', weak: 'Инновационные решения для вашего бизнеса', strong: 'Починим вашу обувь за два дня' },
				{ id: 'problem', name: 'Проблема', does: 'Три слоя: что мешает снаружи, что чувствует внутри, почему это несправедливо.', weak: 'Обувь иногда ломается', strong: 'Каблук сломался перед важной встречей. Неловко идти так. Хорошей обуви не место на помойке.' },
				{ id: 'guide', name: 'Проводник', does: 'Сочувствие (мы понимаем) и компетентность (мы умеем). Здесь входите вы.', weak: 'Мы лучшая мастерская города', strong: 'Знаем, как это бывает. Чиним обувь с 2008 года; работа на гарантии 30 дней.' },
				{ id: 'plan', name: 'План', does: 'Три простых шага, которые делают путь ясным и не страшным.', weak: 'Индивидуальный подход к каждому', strong: '1. Принесите пару. 2. Скажем цену и срок. 3. Заберёте починенную.' },
				{ id: 'cta', name: 'Призыв', does: 'Прямая кнопка и мягкая («узнать больше»). Одно главное действие.', weak: 'Свяжитесь с нами по возможности', strong: 'Записаться на приём' },
				{ id: 'stakes', name: 'Что будет, если не действовать', does: 'Честно, без запугивания: что потеряет человек.', weak: 'Не упустите шанс!', strong: 'Трещину в подошве потом не склеить, придётся менять пару.' },
				{ id: 'success', name: 'Успех', does: 'Как выглядит жизнь после: образ, а не слоган.', weak: 'Наш результат вас приятно удивит', strong: 'Вы входите в зал в своих туфлях и забываете о них.' }
			],
			caption: 'Семь блоков страницы',
			schema: 'Схема страницы',
			q: (t: string) => `«${t}»`,
			weak: 'Слабо: ',
			strong: 'Сильнее: ',
			note: '{W.note}'
		},
		en: {
			blocks: [
				{ id: 'want', name: 'The hero wants', does: 'The first screen: in one phrase, what the person gets, and a button.', weak: 'Innovative solutions for your business', strong: 'We’ll fix your shoes in two days' },
				{ id: 'problem', name: 'The problem', does: 'Three layers: what is in the way outside, what they feel inside, why it is unfair.', weak: 'Shoes sometimes break', strong: 'A heel snapped before an important meeting. It’s awkward to walk in like this. Good shoes don’t belong in the bin.' },
				{ id: 'guide', name: 'The guide', does: 'Empathy (we understand) and competence (we can do it). This is where you come in.', weak: 'We’re the best workshop in town', strong: 'We know how it goes. We’ve repaired shoes since 2008, and every job has a 30-day guarantee.' },
				{ id: 'plan', name: 'The plan', does: 'Three simple steps that make the path clear and not frightening.', weak: 'A personal approach to everyone', strong: '1. Bring in the pair. 2. We quote a price and a date. 3. You collect them mended.' },
				{ id: 'cta', name: 'The call to action', does: 'A direct button and a soft one (“learn more”). One main action.', weak: 'Please get in touch at your convenience', strong: 'Book a repair' },
				{ id: 'stakes', name: 'What happens if they don’t act', does: 'Honestly, without scaring anyone: what the person stands to lose.', weak: 'Don’t miss your chance!', strong: 'A crack in the sole can’t be glued later, and you’ll have to replace the pair.' },
				{ id: 'success', name: 'Success', does: 'What life looks like afterwards: a picture, not a slogan.', weak: 'Our results will pleasantly surprise you', strong: 'You walk into the hall in your own shoes and forget you’re wearing them.' }
			],
			caption: 'The seven blocks of a page',
			schema: 'Page diagram',
			q: (t: string) => `“${t}”`,
			weak: 'Weak: ',
			strong: 'Stronger: ',
			note: 'The example is invented: a shoe repair workshop. Put your own project in its place.'
		}
	});
	const blocks = W.blocks;
	let i = $state(0);
	const b = $derived(blocks[i]);
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="wrap">
		<ol class="page" aria-label={W.schema}>
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
			<p class="dg-out weak">{W.weak}{W.q(b.weak)}</p>
			<p class="dg-out strong">{W.strong}{W.q(b.strong)}</p>
		</div>
	</div>
	<p class="dg-out">{W.note}</p>
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
