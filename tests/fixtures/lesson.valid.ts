/** A complete lesson that the schema must accept. Tests derive invalid lessons from it. */
export const validLesson = {
	id: '02-html/01-first-page',
	part: 2,
	order: 1,
	title: 'Первая страница',
	definition: 'HTML — язык разметки: теги говорят браузеру, где в тексте заголовок, абзац и ссылка.',
	summary: 'Вы соберёте первую страницу из трёх тегов.',
	minutes: 20,
	teaches: ['html-tag'],
	requires: [],
	practice: {
		id: 'first-page',
		title: 'Страница эксперта',
		task: 'Добавьте заголовок с именем.',
		era: 1,
		files: { 'index.html': '<p>{{name}}</p>' },
		solution: { 'index.html': '<h1>{{name}}</h1>' },
		checks: [{ id: 'h1', kind: 'exists', selector: 'h1' }]
	},
	quiz: [
		{
			type: 'single',
			prompt: 'Что такое тег?',
			options: ['Метка разметки', 'Картинка'],
			answer: 0,
			why: ['Да.', 'Нет: картинка вставляется тегом img.']
		},
		{
			type: 'multiple',
			prompt: 'Какие теги — заголовки?',
			options: ['h1', 'p', 'h2'],
			answer: [0, 2],
			why: ['Да.', 'Нет: p — абзац.', 'Да.']
		},
		{ type: 'order', prompt: 'Порядок частей документа', items: ['doctype', 'html', 'head', 'body'] },
		{
			type: 'match',
			prompt: 'Тег и смысл',
			pairs: [
				['h1', 'заголовок'],
				['p', 'абзац']
			]
		}
	],
	cards: [
		{ id: 'html-tag', front: 'Что такое тег?', back: 'Метка, которая говорит браузеру, что это за часть текста.' },
		{ id: 'html-h1', front: 'Зачем h1?', back: 'Главный заголовок страницы.' },
		{ id: 'html-p', front: 'Что делает p?', back: 'Абзац текста.' }
	],
	sources: [
		{ title: 'MDN', url: 'https://developer.mozilla.org/', licence: 'CC-BY-SA', kind: 'docs', lang: 'en' },
		{ title: 'WHATWG HTML', url: 'https://html.spec.whatwg.org/', licence: 'CC-BY', kind: 'spec', lang: 'en' }
	],
	videos: [
		{ title: 'Видео', url: 'https://www.youtube.com/watch?v=xxxxxxxxxxx', licence: 'proprietary-link', kind: 'video', lang: 'ru' }
	],
	guide: {
		intro: 'Начнём.',
		hints: ['Посмотрите на первую строку.'],
		mistakes: { h1: 'Заголовка пока нет.' },
		outro: 'Готово.'
	}
};
