/**
 * The copywriting and story formulas that the «Формулы» diagram can lay out on the person's brief
 * (part 11, and StoryBrand and Hook–Story–Offer in lesson 5). Each formula is a list of blocks; a
 * block says what it has to do, which fact of the brief feeds it, and the question the writer
 * answers. A formula is a skeleton and the diagram writes no sentences for the person: grammar
 * would break on anyone's brief, and the writing is the practice.
 * Licence of this file: Apache-2.0.
 *
 * Two editions. The English formulas are written for English, not translated line by line: the
 * block names are the formulas' own English words, and the guessing texts are English copy.
 * `formulasFor()` and `guessesFor()` pick by the page's locale.
 */
import { getLocale, type Locale } from '#lib/i18n/index.ts';
export type Src = 'forWhom' | 'who' | 'action' | 'item' | 'itemText' | 'price' | 'proof' | 'sections' | 'contacts' | 'none';

export type Block = { code: string; name: string; does: string; src: Src; ask: string };
export type Formula = { id: string; name: string; blocks: Block[] };

export const ruFormulas: Formula[] = [
	{
		id: 'aida',
		name: 'AIDA',
		blocks: [
			{ code: 'A', name: 'Attention, внимание', does: 'Остановить взгляд на том, что читателю уже важно.', src: 'forWhom', ask: 'Какая мысль или ситуация у этого человека в голове до того, как он пришёл?' },
			{ code: 'I', name: 'Interest, интерес', does: 'Дать причину читать дальше: новое знание, нерешённый вопрос.', src: 'item', ask: 'Что про это предложение читатель не знал и захочет узнать?' },
			{ code: 'D', name: 'Desire, желание', does: 'Показать результат так, чтобы его захотелось получить.', src: 'itemText', ask: 'Как выглядит жизнь читателя, когда это сделано?' },
			{ code: 'A', name: 'Action, действие', does: 'Назвать один следующий шаг.', src: 'action', ask: 'Что именно он должен сделать сейчас и что произойдёт после?' }
		]
	},
	{
		id: 'aidca',
		name: 'AIDCA',
		blocks: [
			{ code: 'A', name: 'Attention, внимание', does: 'Остановить взгляд.', src: 'forWhom', ask: 'Что у читателя в голове до визита?' },
			{ code: 'I', name: 'Interest, интерес', does: 'Дать причину читать дальше.', src: 'item', ask: 'Что про предложение он не знал?' },
			{ code: 'D', name: 'Desire, желание', does: 'Показать желаемый результат.', src: 'itemText', ask: 'Как выглядит его жизнь, когда всё сделано?' },
			{ code: 'C', name: 'Conviction, убеждение', does: 'Снять сомнение «а правда ли?»: документ, номер, случай, гарантия условий.', src: 'proof', ask: 'Чем это можно проверить, а не только сказать?' },
			{ code: 'A', name: 'Action, действие', does: 'Один следующий шаг.', src: 'action', ask: 'Что он делает сейчас?' }
		]
	},
	{
		id: 'acca',
		name: 'ACCA',
		blocks: [
			{ code: 'A', name: 'Awareness, осведомлённость', does: 'Сообщить, что есть такое решение или предложение.', src: 'item', ask: 'Знает ли читатель, что это вообще можно сделать, и как это называется?' },
			{ code: 'C', name: 'Comprehension, понимание', does: 'Объяснить, как это устроено, простыми словами.', src: 'sections', ask: 'Какие шаги проходит человек от обращения до результата?' },
			{ code: 'C', name: 'Conviction, убеждённость', does: 'Показать основания верить.', src: 'proof', ask: 'Какие факты это подтверждают?' },
			{ code: 'A', name: 'Action, действие', does: 'Пригласить сделать шаг.', src: 'action', ask: 'Какой первый шаг самый лёгкий?' }
		]
	},
	{
		id: 'pas',
		name: 'PAS',
		blocks: [
			{ code: 'P', name: 'Problem, проблема', does: 'Назвать проблему читателя его словами.', src: 'forWhom', ask: 'С какой бедой этот человек приходит, как он сам её называет?' },
			{ code: 'A', name: 'Agitate, обострить', does: 'Честно показать цену бездействия: что произойдёт, если ничего не делать. Только факты, без запугивания.', src: 'none', ask: 'Что реально случится со сроками, деньгами, нервами, если откладывать?' },
			{ code: 'S', name: 'Solve, решение', does: 'Показать, как предложение снимает проблему.', src: 'item', ask: 'Какой шаг вашего предложения закрывает именно эту беду?' }
		]
	},
	{
		id: 'paso',
		name: 'PASO',
		blocks: [
			{ code: 'P', name: 'Problem, проблема', does: 'Проблема читателя его словами.', src: 'forWhom', ask: 'С какой бедой он приходит?' },
			{ code: 'A', name: 'Agitate, обострить', does: 'Честная цена бездействия, без запугивания.', src: 'none', ask: 'Что случится, если ничего не делать?' },
			{ code: 'S', name: 'Solution, решение', does: 'Как предложение снимает проблему.', src: 'item', ask: 'Какой шаг закрывает беду?' },
			{ code: 'O', name: 'Offer, предложение', does: 'Конкретные условия: что, за сколько, как начать.', src: 'price', ask: 'Какие условия вы можете выполнить и назвать прямо?' }
		]
	},
	{
		id: 'slap',
		name: 'SLAP',
		blocks: [
			{ code: 'S', name: 'Stop, стоп', does: 'Остановить: одна короткая строка про то, что читателю важно.', src: 'forWhom', ask: 'Какая строка заставит именно этого человека остановиться?' },
			{ code: 'L', name: 'Look, смотрите', does: 'Дать то, на что стоит посмотреть: суть предложения и факт.', src: 'item', ask: 'Что в предложении главное и можно ли это показать числом?' },
			{ code: 'A', name: 'Act, действуйте', does: 'Позвать к действию.', src: 'action', ask: 'Какой глагол и какая кнопка?' },
			{ code: 'P', name: 'Purchase, покупка', does: 'Назвать условия обращения: цена, срок, как оформить.', src: 'price', ask: 'Что человек получит и на каких условиях?' }
		]
	},
	{
		id: 'bab',
		name: 'BAB',
		blocks: [
			{ code: 'B', name: 'Before, до', does: 'Описать положение читателя сейчас.', src: 'forWhom', ask: 'Как выглядит день человека, у которого эта задача не решена?' },
			{ code: 'A', name: 'After, после', does: 'Описать положение, когда задача решена. Результат читателя, а не ваш товар.', src: 'itemText', ask: 'Что он может делать, чего не мог раньше?' },
			{ code: 'B', name: 'Bridge, мост', does: 'Показать, как перейти из «до» в «после».', src: 'action', ask: 'Какое действие переводит его через мост и что в нём шаг за шагом?' }
		]
	},
	{
		id: 'fourp',
		name: '4P: Picture–Promise–Prove–Push',
		blocks: [
			{ code: 'Pic', name: 'Picture, картина', does: 'Нарисовать картину желаемого или нежеланного положения читателя.', src: 'forWhom', ask: 'Какую сцену читатель узнает как свою?' },
			{ code: 'Pro', name: 'Promise, обещание', does: 'Дать честное обещание, которое вы можете выполнить.', src: 'item', ask: 'Что вы реально можете пообещать, не гарантируя исход?' },
			{ code: 'Prv', name: 'Prove, доказательство', does: 'Подкрепить обещание фактами.', src: 'proof', ask: 'Чем подтверждается обещание?' },
			{ code: 'Psh', name: 'Push, толчок', does: 'Подтолкнуть к одному действию.', src: 'action', ask: 'Какой шаг самый простой?' }
		]
	},
	{
		id: 'fab',
		name: 'FAB',
		blocks: [
			{ code: 'F', name: 'Feature, свойство', does: 'Что в предложении есть: факт о самом продукте или услуге.', src: 'itemText', ask: 'Что это, из чего состоит, какого размера, какой длины?' },
			{ code: 'Ad', name: 'Advantage, преимущество', does: 'Что это свойство позволяет делать лучше или иначе, чем без него.', src: 'none', ask: 'Что оно даёт по сравнению с обычным способом?' },
			{ code: 'B', name: 'Benefit, выгода', does: 'Что получает именно этот человек: «и что мне с этого».', src: 'forWhom', ask: 'Что это меняет в жизни или деле человека из «для кого»?' }
		]
	},
	{
		id: 'quest',
		name: 'QUEST',
		blocks: [
			{ code: 'Q', name: 'Qualify, отобрать', does: 'Дать понять, для кого письмо или страница и для кого нет.', src: 'forWhom', ask: 'Кому это точно подойдёт и кому нет?' },
			{ code: 'U', name: 'Understand, понять', does: 'Показать, что вы понимаете ситуацию читателя.', src: 'none', ask: 'Какую деталь знает только тот, кто сталкивался с такой задачей?' },
			{ code: 'E', name: 'Educate, объяснить', does: 'Рассказать, как это устроено и что можно сделать.', src: 'sections', ask: 'Что полезно знать читателю в любом случае, даже если он не станет клиентом?' },
			{ code: 'S', name: 'Stimulate, побудить', does: 'Показать, что выигрыш реален: доказательства, условия.', src: 'proof', ask: 'Какой факт делает выигрыш реальным?' },
			{ code: 'T', name: 'Transition, перейти', does: 'Перевести к действию.', src: 'action', ask: 'Каким может быть следующий шаг?' }
		]
	},
	{
		id: 'sb7',
		name: 'StoryBrand (SB7)',
		blocks: [
			{ code: '1', name: 'Герой', does: 'Герой страницы это посетитель, а не вы.', src: 'forWhom', ask: 'Чего хочет этот человек? Одной фразой, как цель.' },
			{ code: '2', name: 'Проблема', does: 'Внешняя, внутренняя и по-человечески несправедливая сторона проблемы.', src: 'none', ask: 'Что мешает ему извне, что он чувствует и почему это неправильно?' },
			{ code: '3', name: 'Проводник', does: 'Вы: сочувствие и компетентность вместе.', src: 'who', ask: 'Какой фразой вы показываете, что понимаете его, и чем доказываете, что справитесь?' },
			{ code: '4', name: 'План', does: 'Три простых шага от «хочу» до «получил».', src: 'sections', ask: 'Какие три шага проходит человек?' },
			{ code: '5', name: 'Призыв к действию', does: 'Прямой призыв и мягкий («посмотреть, как это работает»).', src: 'action', ask: 'Какая кнопка прямая и какая мягкая?' },
			{ code: '6', name: 'Провал', does: 'Что случится, если не действовать. Честно и коротко.', src: 'none', ask: 'Какие реальные потери будут, если ничего не делать?' },
			{ code: '7', name: 'Успех', does: 'Что получится, когда герой дойдёт до конца.', src: 'itemText', ask: 'Каким станет его положение?' }
		]
	},
	{
		id: 'hso',
		name: 'Hook–Story–Offer',
		blocks: [
			{ code: 'H', name: 'Hook, крючок', does: 'Первая строка, которая останавливает.', src: 'forWhom', ask: 'Что из жизни читателя вы назовёте первым?' },
			{ code: 'S', name: 'Story, история', does: 'Короткая история: от «было» к «стало», по которой читатель узнаёт себя.', src: 'none', ask: 'Какой случай (обезличенный) покажет путь от проблемы к результату?' },
			{ code: 'O', name: 'Offer, предложение', does: 'Одно понятное предложение с условиями и одним действием.', src: 'item', ask: 'Какое одно предложение вы делаете и как его принять?' }
		]
	}
];

export type Guess = { text: string; right: string; why: string };

/** «Какая это формула?»: short bicycle-workshop texts for the attention formulas. */
export const ruGuesses: Record<string, { options: string[]; items: Guess[] }> = {
	attention: {
		options: ['aida', 'aidca', 'acca', 'pas', 'paso', 'slap'],
		items: [
			{
				right: 'aida',
				text: 'Колесо «восьмёркой»? Это не страшно: камеру и спицы меняют за 20 минут, обод правят на станке. Утром вы выедете на работу на нормальном велосипеде, а не пойдёте пешком. Запишите велосипед на ремонт.',
				why: 'Внимание (вопрос про колесо), интерес (чинят быстро), желание (утром на работу) и действие. Нет ни доказательств, ни условий, значит, простая AIDA.'
			},
			{
				right: 'aidca',
				text: 'Колесо «восьмёркой»? Это не страшно: камеру и спицы меняют за 20 минут. Утром вы выедете на работу на нормальном велосипеде. Мастера прошли обучение у производителя, а гарантия на работу, 30 дней, записана в чеке. Запишите велосипед на ремонт.',
				why: 'К AIDA добавлен блок убеждения перед действием: обучение у производителя и гарантия в чеке. Это AIDCA.'
			},
			{
				right: 'acca',
				text: 'Весна: велосипед после зимы нужно проверить. Проверка включает тормоза, цепь, колёса и подшипники и занимает около часа. Мастера прошли обучение у производителя, цены на странице. Запишитесь на весеннее ТО.',
				why: 'Сначала осведомлённость, потом объяснение, как это устроено (понимание), основания верить и действие. Эмоций почти нет, это ACCA.'
			},
			{
				right: 'pas',
				text: 'Тормоза слабеют на спуске. Каждая поездка с ними это риск, а чем дольше откладывать, тем дороже: изношенный диск придётся менять целиком. Мы заменим колодки и отрегулируем тросы за один визит.',
				why: 'Проблема, обострение через честные последствия (риск и цена) и решение. Предложения с условиями нет: PAS.'
			},
			{
				right: 'paso',
				text: 'Тормоза слабеют на спуске. Каждая поездка с ними это риск, а чем дольше откладывать, тем дороже: изношенный диск придётся менять целиком. Мы заменим колодки и отрегулируем тросы за один визит. Осмотр тормозов бесплатный при записи на любой ремонт.',
				why: 'То же, что PAS, плюс конкретное предложение с условием в конце. Это PASO.'
			},
			{
				right: 'slap',
				text: 'Стоп: тормоза скрипят? Смотрите: замена колодок, 20 минут, 600 ₽. Звоните сегодня, привозите завтра. Оплата после ремонта.',
				why: 'Четыре короткие строки для объявления: остановить, показать суть и цену, позвать, назвать условия. SLAP.'
			}
		]
	}
};

export const enFormulas: Formula[] = [
	{
		id: 'aida',
		name: 'AIDA',
		blocks: [
			{ code: 'A', name: 'Attention', does: 'Stop the eye on something that already matters to the reader.', src: 'forWhom', ask: 'What thought or situation is in this person’s head before they arrive?' },
			{ code: 'I', name: 'Interest', does: 'Give a reason to read on: new knowledge, an open question.', src: 'item', ask: 'What about this offer did the reader not know, and will want to?' },
			{ code: 'D', name: 'Desire', does: 'Show the result so that the reader wants it.', src: 'itemText', ask: 'What does the reader’s life look like once this is done?' },
			{ code: 'A', name: 'Action', does: 'Name one next step.', src: 'action', ask: 'What exactly should they do now, and what happens after?' }
		]
	},
	{
		id: 'aidca',
		name: 'AIDCA',
		blocks: [
			{ code: 'A', name: 'Attention', does: 'Stop the eye.', src: 'forWhom', ask: 'What is in the reader’s head before the visit?' },
			{ code: 'I', name: 'Interest', does: 'Give a reason to read on.', src: 'item', ask: 'What about the offer did they not know?' },
			{ code: 'D', name: 'Desire', does: 'Show the result they want.', src: 'itemText', ask: 'What does their life look like when it is all done?' },
			{ code: 'C', name: 'Conviction', does: 'Answer the doubt “is it true?”: a document, a number, a case, stated terms.', src: 'proof', ask: 'How can this be checked, not just said?' },
			{ code: 'A', name: 'Action', does: 'One next step.', src: 'action', ask: 'What do they do now?' }
		]
	},
	{
		id: 'acca',
		name: 'ACCA',
		blocks: [
			{ code: 'A', name: 'Awareness', does: 'Say that such a solution or offer exists.', src: 'item', ask: 'Does the reader know this can be done at all, and what it is called?' },
			{ code: 'C', name: 'Comprehension', does: 'Explain in plain words how it works.', src: 'sections', ask: 'What steps does a person go through from the first contact to the result?' },
			{ code: 'C', name: 'Conviction', does: 'Show grounds for belief.', src: 'proof', ask: 'Which facts support it?' },
			{ code: 'A', name: 'Action', does: 'Invite a step.', src: 'action', ask: 'Which first step is the easiest?' }
		]
	},
	{
		id: 'pas',
		name: 'PAS',
		blocks: [
			{ code: 'P', name: 'Problem', does: 'Name the reader’s problem in their words.', src: 'forWhom', ask: 'What trouble does this person arrive with, and what do they call it themselves?' },
			{ code: 'A', name: 'Agitate', does: 'Honestly show the cost of doing nothing: what happens if nothing is done. Facts only, no scaremongering.', src: 'none', ask: 'What will really happen to the timing, the money, the nerves if it is put off?' },
			{ code: 'S', name: 'Solve', does: 'Show how the offer removes the problem.', src: 'item', ask: 'Which step of your offer closes exactly this trouble?' }
		]
	},
	{
		id: 'paso',
		name: 'PASO',
		blocks: [
			{ code: 'P', name: 'Problem', does: 'The reader’s problem in their words.', src: 'forWhom', ask: 'What trouble do they arrive with?' },
			{ code: 'A', name: 'Agitate', does: 'The honest cost of doing nothing, with no scaremongering.', src: 'none', ask: 'What happens if nothing is done?' },
			{ code: 'S', name: 'Solution', does: 'How the offer removes the problem.', src: 'item', ask: 'Which step closes the trouble?' },
			{ code: 'O', name: 'Offer', does: 'Specific terms: what, for how much, how to start.', src: 'price', ask: 'Which terms can you keep, and state plainly?' }
		]
	},
	{
		id: 'slap',
		name: 'SLAP',
		blocks: [
			{ code: 'S', name: 'Stop', does: 'Stop them: one short line about what matters to the reader.', src: 'forWhom', ask: 'Which line will make this particular person stop?' },
			{ code: 'L', name: 'Look', does: 'Give them something to look at: the point of the offer and a fact.', src: 'item', ask: 'What is the main thing in the offer, and can it be shown as a number?' },
			{ code: 'A', name: 'Act', does: 'Call them to act.', src: 'action', ask: 'Which verb and which button?' },
			{ code: 'P', name: 'Purchase', does: 'State the terms of getting in touch: price, time, how to order.', src: 'price', ask: 'What will the person get, and on what terms?' }
		]
	},
	{
		id: 'bab',
		name: 'BAB',
		blocks: [
			{ code: 'B', name: 'Before', does: 'Describe the reader’s position now.', src: 'forWhom', ask: 'What does the day of a person whose task is unsolved look like?' },
			{ code: 'A', name: 'After', does: 'Describe the position once the task is solved. The reader’s result, not your product.', src: 'itemText', ask: 'What can they do that they couldn’t before?' },
			{ code: 'B', name: 'Bridge', does: 'Show how to get from “before” to “after”.', src: 'action', ask: 'Which action takes them across the bridge, and what is in it, step by step?' }
		]
	},
	{
		id: 'fourp',
		name: '4P: Picture, Promise, Prove, Push',
		blocks: [
			{ code: 'Pic', name: 'Picture', does: 'Paint a picture of the reader’s wanted or unwanted position.', src: 'forWhom', ask: 'Which scene will the reader recognize as their own?' },
			{ code: 'Pro', name: 'Promise', does: 'Make an honest promise that you can keep.', src: 'item', ask: 'What can you really promise without guaranteeing the outcome?' },
			{ code: 'Prv', name: 'Prove', does: 'Back the promise with facts.', src: 'proof', ask: 'What supports the promise?' },
			{ code: 'Psh', name: 'Push', does: 'Nudge toward one action.', src: 'action', ask: 'Which step is the simplest?' }
		]
	},
	{
		id: 'fab',
		name: 'FAB',
		blocks: [
			{ code: 'F', name: 'Feature', does: 'What the offer has: a fact about the product or service itself.', src: 'itemText', ask: 'What is it, what is it made of, how big, how long?' },
			{ code: 'Ad', name: 'Advantage', does: 'What the feature lets you do better or differently than without it.', src: 'none', ask: 'What does it give compared with the usual way?' },
			{ code: 'B', name: 'Benefit', does: 'What this person gets: “what’s in it for me”.', src: 'forWhom', ask: 'What does it change in the life or work of the person in “for whom”?' }
		]
	},
	{
		id: 'quest',
		name: 'QUEST',
		blocks: [
			{ code: 'Q', name: 'Qualify', does: 'Make clear who the letter or page is for and who it is not for.', src: 'forWhom', ask: 'Who will this suit for certain, and who not?' },
			{ code: 'U', name: 'Understand', does: 'Show that you understand the reader’s situation.', src: 'none', ask: 'Which detail does only someone who has faced this task know?' },
			{ code: 'E', name: 'Educate', does: 'Tell how it works and what can be done.', src: 'sections', ask: 'What is useful for the reader to know in any case, even if they never become a customer?' },
			{ code: 'S', name: 'Stimulate', does: 'Show that the gain is real: proof, terms.', src: 'proof', ask: 'Which fact makes the gain real?' },
			{ code: 'T', name: 'Transition', does: 'Move them to action.', src: 'action', ask: 'What could the next step be?' }
		]
	},
	{
		id: 'sb7',
		name: 'StoryBrand (SB7)',
		blocks: [
			{ code: '1', name: 'A character', does: 'The hero of the page is the visitor, not you.', src: 'forWhom', ask: 'What does this person want? In one phrase, as a goal.' },
			{ code: '2', name: 'Has a problem', does: 'The external, internal and philosophical side of the problem.', src: 'none', ask: 'What stands in their way from outside, what do they feel, and why is it wrong?' },
			{ code: '3', name: 'Meets a guide', does: 'You: empathy and authority together.', src: 'who', ask: 'With which phrase do you show you understand them, and with what do you prove you can cope?' },
			{ code: '4', name: 'Who gives them a plan', does: 'Three simple steps from “I want” to “I got it”.', src: 'sections', ask: 'Which three steps does the person take?' },
			{ code: '5', name: 'And calls them to action', does: 'A direct call and a soft one (“see how it works”).', src: 'action', ask: 'Which button is direct and which is soft?' },
			{ code: '6', name: 'That helps them avoid failure', does: 'What happens if they don’t act. Honest and brief.', src: 'none', ask: 'What real losses will there be if nothing is done?' },
			{ code: '7', name: 'And ends in success', does: 'What comes of it when the hero reaches the end.', src: 'itemText', ask: 'What will their position become?' }
		]
	},
	{
		id: 'hso',
		name: 'Hook, Story, Offer',
		blocks: [
			{ code: 'H', name: 'Hook', does: 'A first line that stops them.', src: 'forWhom', ask: 'What from the reader’s life do you name first?' },
			{ code: 'S', name: 'Story', does: 'A short story, from “before” to “after”, in which the reader recognizes themselves.', src: 'none', ask: 'Which case (anonymized) shows the path from the problem to the result?' },
			{ code: 'O', name: 'Offer', does: 'One clear offer with its terms and one action.', src: 'item', ask: 'What one offer do you make, and how is it accepted?' }
		]
	}
];

export const enGuesses: Record<string, { options: string[]; items: Guess[] }> = {
	attention: {
		options: ['aida', 'aidca', 'acca', 'pas', 'paso', 'slap'],
		items: [
			{
				right: 'aida',
				text: 'Wheel out of true? Don’t panic: tubes and spokes are replaced in 20 minutes, and the rim is trued on a stand. By morning you’ll ride to work on a proper bike instead of walking. Book your bike in for repair.',
				why: 'Attention (the question about the wheel), interest (it is fixed fast), desire (riding to work in the morning) and action. There is no proof and no terms, so it is plain AIDA.'
			},
			{
				right: 'aidca',
				text: 'Wheel out of true? Don’t panic: tubes and spokes are replaced in 20 minutes. By morning you’ll ride to work on a proper bike. Our mechanics trained with the maker, and a 30-day guarantee on the work is printed on your receipt. Book your bike in for repair.',
				why: 'A conviction block was added to AIDA before the action: training with the maker and the guarantee on the receipt. That is AIDCA.'
			},
			{
				right: 'acca',
				text: 'Spring: after winter your bike needs a check. The check covers brakes, chain, wheels and bearings and takes about an hour. Our mechanics trained with the maker, and prices are on the page. Book your spring service.',
				why: 'First awareness, then an explanation of how it works (comprehension), grounds for belief and an action. There is hardly any emotion, so this is ACCA.'
			},
			{
				right: 'pas',
				text: 'Your brakes fade on downhills. Every ride on them is a risk, and the longer you wait the more it costs: a worn rotor has to be replaced whole. We replace the pads and adjust the cables in one visit.',
				why: 'A problem, agitation through honest consequences (risk and cost) and a solution. There is no offer with terms: PAS.'
			},
			{
				right: 'paso',
				text: 'Your brakes fade on downhills. Every ride on them is a risk, and the longer you wait the more it costs: a worn rotor has to be replaced whole. We replace the pads and adjust the cables in one visit. The brake inspection is free with any repair booking.',
				why: 'The same as PAS, plus a specific offer with a condition at the end. That is PASO.'
			},
			{
				right: 'slap',
				text: 'Stop: squealing brakes? Look: new pads, 20 minutes, $25. Call today, bring it in tomorrow. Pay after the repair.',
				why: 'Four short lines for an ad: stop them, show the point and the price, call them, give the terms. SLAP.'
			}
		]
	}
};

export const formulasFor = (l: Locale = getLocale()): Formula[] => (l === 'en' ? enFormulas : ruFormulas);
export const guessesFor = (l: Locale = getLocale()) => (l === 'en' ? enGuesses : ruGuesses);
/** The Russian lists, under their old names. */
export const formulas = ruFormulas;
export const guesses = ruGuesses;
