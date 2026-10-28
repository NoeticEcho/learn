<!--
	«Биография по проходам» (part 10, lesson 7). A made-up biography of the textbook's persona goes
	through the part's five passes one at a time. The slider moves from «было» to the page that
	comes out; each stop shows the text, what that pass did, and two counters: the words, and the
	share of them that the stop-word dictionary flags. All the text is invented.
-->
<script lang="ts">
	import './shared.css';
	import { dictFor, mark, words } from './stopwords.ts';
	import { pick } from '#lib/i18n/index.ts';

	type Stage = { name: string; did: string; text: string };
	const W = pick({
		ru: {
			stages: [
				{
					name: 'Было',
					did: 'Исходная биография: самоописание, оценки, канцелярит и немного о хобби. Самое важное (кто и чем полезна) спрятано в середине.',
					text: 'Добро пожаловать на мою страничку! Меня зовут Ксения, и на сегодняшний день я — профессионал в области землеустройства и права с богатым опытом. Я родилась в Заречье и с детства любила карты и границы. После школы окончила аграрный университет, затем юридический институт. Являюсь высококвалифицированным специалистом, осуществляю качественное оказание услуг и всегда нахожу индивидуальный подход к каждому клиенту. Я уже много лет помогаю людям решать земельные вопросы и никогда не подводила. Имею множество дипломов и сертификатов. В свободное время люблю читать и ходить в походы. Если у вас есть вопросы, обращайтесь, я всегда рада помочь!'
				},
				{
					name: 'Проход 1: вывод вперёд',
					did: 'Вывод перенесён в начало: кто, чем занята, кому полезна и что делать. Остальной текст пока тот же.',
					text: 'Я Ксения Ольховская, кадастровый инженер и судебный эксперт по земельным спорам. Помогаю владельцам участков, застройщикам и адвокатам понять, где проходит граница. Записаться на консультацию можно по телефону. Я родилась в Заречье и с детства любила карты и границы. После школы окончила аграрный университет, затем юридический институт. Являюсь высококвалифицированным специалистом, осуществляю качественное оказание услуг и всегда нахожу индивидуальный подход к каждому клиенту. Никогда не подводила. Имею множество дипломов и сертификатов. В свободное время люблю читать и ходить в походы.'
				},
				{
					name: 'Проход 2: факты вместо оценок',
					did: 'Оценки заменены фактами: образование с годами, документы, стаж. Канцелярит и «множество дипломов» ушли.',
					text: 'Я Ксения Ольховская, кадастровый инженер и судебный эксперт по земельным спорам. Помогаю владельцам участков, застройщикам и адвокатам понять, где проходит граница. Записаться на консультацию можно по телефону. С 2006 года работаю с землёй: сначала геодезистом, с 2011 года кадастровым инженером, с 2015 года судебным экспертом. Окончила землеустройство (2006) и юриспруденцию (2012). Аттестат кадастрового инженера и сертификат судебного эксперта выданы с номерами, их можно проверить. Никогда не подводила. В свободное время хожу в походы.'
				},
				{
					name: 'Проходы 3 и 4: структура и тон',
					did: 'Страница разделена подзаголовками, короткие абзацы, список документов. Тон спокойный и уважительный.',
					text: 'Я Ксения Ольховская, кадастровый инженер и судебный эксперт по земельным спорам. Помогаю владельцам участков, застройщикам и адвокатам понять, где проходит граница.\n\nЗаписаться на консультацию.\n\nЧто я делаю. Уточняю границы, готовлю межевой план, пишу заключения по назначению суда и рецензии на чужие заключения.\n\nКак пришла к этому. С 2006 года работаю с землёй: геодезист, затем кадастровый инженер (2011), судебный эксперт (2015). Образование: землеустройство (2006), юриспруденция (2012).\n\nДокументы. Аттестат кадастрового инженера; сертификат судебного эксперта; членство в СРО. Номера указаны на странице «Документы».\n\nНикогда не подводила. В свободное время хожу в походы.'
				},
				{
					name: 'Проход 5: проверка допустимости',
					did: 'Удалена фраза «никогда не подводила»: это оценка, которую нельзя проверить. Хобби убрано: для эксперта по спорам оно ничего не добавляет к доверию (на странице кофейни оно бы осталось). Добавлена честная оговорка о результате.',
					text: 'Я Ксения Ольховская, кадастровый инженер и судебный эксперт по земельным спорам. Помогаю владельцам участков, застройщикам и адвокатам понять, где проходит граница.\n\nЗаписаться на консультацию.\n\nЧто я делаю. Уточняю границы, готовлю межевой план, пишу заключения по назначению суда и рецензии на чужие заключения.\n\nКак пришла к этому. С 2006 года работаю с землёй: геодезист, затем кадастровый инженер (2011), судебный эксперт (2015). Образование: землеустройство (2006), юриспруденция (2012).\n\nДокументы. Аттестат кадастрового инженера; сертификат судебного эксперта; членство в СРО. Номера и ссылки на реестры указаны на странице «Документы».\n\nЧего не обещаю. Исход спора зависит от документов и решения суда. Обещаю разбор: что можно сделать в вашем случае и от чего это зависит.'
				}
			] as Stage[],
			caption: 'Биография по проходам',
			step: 'Шаг',
			of: 'из',
			pass: 'Проход редактуры',
			words: 'Слов:',
			marked: 'Помечено словарём шума:',
			note: 'Подсветка показывает кандидатов, а не приговор.'
		},
		en: {
			stages: [
				{
					name: 'Before',
					did: 'The original bio: self-description, appraisals, officialese and a bit about hobbies. The most important thing (who she is and how she helps) is buried in the middle.',
					text: 'Welcome to my page! My name is Kate, and at this point in time I am a professional in the field of land surveying and law with a wealth of experience. I was born in Riverbend and have loved maps and boundaries since childhood. After school I graduated from the agricultural college, then the law school. I am a highly qualified specialist, I carry out the provision of quality services and always find an individual approach to every client. For many years I have been helping people to resolve land issues and have never let anyone down. I hold a large number of diplomas and certificates. In my spare time I like reading and hiking. If you have any questions, please do not hesitate to contact me, I am always happy to help!'
				},
				{
					name: 'Pass 1: the conclusion first',
					did: 'The conclusion moves to the top: who she is, what she does, who she helps and what to do. The rest of the text is still the same.',
					text: 'I’m Kate Alder, a land surveyor and expert witness in boundary disputes. I help landowners, developers and attorneys find out where a boundary really runs. You can book a consultation by phone. I was born in Riverbend and have loved maps and boundaries since childhood. After school I graduated from the agricultural college, then the law school. I am a highly qualified specialist, I carry out the provision of quality services and always find an individual approach to every client. I have never let anyone down. I hold a large number of diplomas and certificates. In my spare time I like hiking.'
				},
				{
					name: 'Pass 2: facts instead of appraisals',
					did: 'Appraisals are replaced with facts: education with years, documents, length of practice. The officialese and the “large number of diplomas” are gone.',
					text: 'I’m Kate Alder, a land surveyor and expert witness in boundary disputes. I help landowners, developers and attorneys find out where a boundary really runs. You can book a consultation by phone. I have worked with land since 2006: first as a survey technician, from 2011 as a licensed surveyor, from 2015 as an expert witness. I studied land surveying (2006) and law (2012). My surveyor’s license and expert accreditation have numbers you can check. I have never let anyone down. In my spare time I hike.'
				},
				{
					name: 'Passes 3 and 4: structure and tone',
					did: 'The page is split by subheadings, the paragraphs are short, the documents are a list. The tone is calm and respectful.',
					text: 'I’m Kate Alder, a land surveyor and expert witness in boundary disputes. I help landowners, developers and attorneys find out where a boundary really runs.\n\nBook a consultation.\n\nWhat I do. I confirm boundaries, prepare boundary plans, write reports for the court and review other experts’ reports.\n\nHow I got here. I have worked with land since 2006: survey technician, then licensed surveyor (2011), then expert witness (2015). Education: land surveying (2006), law (2012).\n\nDocuments. Surveyor’s license; expert witness accreditation; association membership. The numbers are on the “Credentials” page.\n\nI have never let anyone down. In my spare time I hike.'
				},
				{
					name: 'Pass 5: is it allowed?',
					did: 'The phrase “never let anyone down” is gone: it’s an appraisal nobody can check. The hobby is gone too: for a boundary expert it adds nothing to trust (on a coffee shop’s page it would stay). An honest caveat about outcomes is added.',
					text: 'I’m Kate Alder, a land surveyor and expert witness in boundary disputes. I help landowners, developers and attorneys find out where a boundary really runs.\n\nBook a consultation.\n\nWhat I do. I confirm boundaries, prepare boundary plans, write reports for the court and review other experts’ reports.\n\nHow I got here. I have worked with land since 2006: survey technician, then licensed surveyor (2011), then expert witness (2015). Education: land surveying (2006), law (2012).\n\nDocuments. Surveyor’s license; expert witness accreditation; association membership. The numbers and links to the registers are on the “Credentials” page.\n\nWhat I don’t promise. The outcome of a dispute depends on the documents and the court’s decision. What I do promise is an analysis: what can be done in your case, and what it depends on.'
				}
			] as Stage[],
			caption: 'A bio, pass by pass',
			step: 'Step',
			of: 'of',
			pass: 'Editing pass',
			words: 'Words:',
			marked: 'Marked by the noise dictionary:',
			note: 'The highlighting shows candidates, not a verdict.'
		}
	});
	const stages = W.stages;
	const dict = dictFor();
	let at = $state(0);
	const s = $derived(stages[at]);
	const segs = $derived(mark(s.text));
	const total = $derived(words(s.text));
	const flagged = $derived(segs.filter((x) => x.cat).reduce((n, x) => n + words(x.text), 0));
</script>

<figure class="dg">
	<figcaption>{W.caption}</figcaption>
	<div class="dg-ctl">
		<label>
			{W.step} <strong>{at}</strong> {W.of} {stages.length - 1}
			<input type="range" min="0" max={stages.length - 1} step="1" bind:value={at} aria-label={W.pass} />
		</label>
	</div>
	<p class="dg-out"><strong>{s.name}.</strong> {s.did}</p>
	<div class="text dg-box">
		{#each segs as g, i (i)}{#if g.cat}<mark class="m" title={dict[g.cat].label}>{g.text}</mark>{:else}{g.text}{/if}{/each}
	</div>
	<p class="dg-out" aria-live="polite">{W.words} <strong>{total}</strong>. {W.marked} <strong>{flagged}</strong>. {W.note}</p>
</figure>

<style>
	.text {
		white-space: pre-wrap;
		line-height: 1.65;
		max-width: 42rem;
	}
	.m {
		color: var(--text-primary);
		background: color-mix(in srgb, #d9534f 24%, transparent);
		border-bottom: 2px solid currentColor;
		padding: 0 2px;
	}
</style>
