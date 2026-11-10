// The English house style's rules, shared by the lessons' test and the catalog's (style-en.test.ts,
// courses.test.ts).
// Words that keep their capital mid-heading. Add a name here when a lesson needs one.
export const NAMES = new Set([
	'Echo', 'Iskin', 'Runet', 'Russia', 'Russian', 'English', 'Google', 'Yandex', 'Tilda', 'Wix', 'Squarespace', 'Shopify',
	'Bitrix', 'Kubernetes', 'Docker', 'Compose', 'Markdown', 'Flexbox', 'Grid', 'Jamstack', 'Ogilvy', 'Cialdini', 'Fogg',
	'Freytag', 'Duarte', 'Harmon', 'Campbell', 'Vogler', 'Pixar', 'Schwartz', 'Goodhart', 'Lighthouse', 'Postgres',
	'Material', 'Apple', 'Fluent', 'Carbon', 'Atlassian', 'Polaris', 'Primer', 'Radix', 'Tailwind', 'Telegram', 'Netscape',
	'Mosaic', 'Figma', 'Drupal', 'Joomla', 'Jekyll', 'Hugo', 'Eleventy', 'Astro', 'Strapi', 'Directus', 'Sanity',
	'Contentful', 'Decap', 'Vercel', 'Netlify', 'Pages', 'GitHub', 'Lovable', 'Metrica', 'Europe', 'European', 'UK',
	'Web', 'World', 'Wide', 'I', 'Story', 'Brand', 'Canvas', 'Value', 'Proposition', 'Metric', 'Star', 'North', 'Svelte'
]);

// Added by part 16: names of AI tools that a heading carries.
for (const n of ['Framer']) NAMES.add(n);

// Added by part 12 (storytelling): the storytellers and schools a heading names.
for (const n of ['Freytag’s', 'Duarte’s', 'Aristotle', 'Aristotle’s', 'Harmon’s', 'Vonnegut', 'Vonnegut’s']) NAMES.add(n);

// Added by parts 13 and 14 (growth and metrics): the products and places a heading names.
for (const n of ['Bing', 'Facebook', 'Instagram', 'Reddit', 'Mailchimp', 'Klaviyo', 'Meta', 'Microsoft', 'Hotjar', 'Clarity', 'Analytics', 'Console', 'Webmaster', 'Tools', 'Search', 'Yandex', 'Wikipedia', 'Marketo', 'HubSpot', 'Amazon', 'Netflix', 'Facebook’s', 'Google’s', 'Meta’s', 'Goodhart’s', 'Simpson’s', 'Simpson', 'Goodhart', 'Ries', 'Ries’s', 'Nielsen', 'Cohen’s']) NAMES.add(n);

// Added by part 15 (quality and law): the names a heading carries.
for (const n of ['Core', 'Vitals']) NAMES.add(n);

// Added by the AI course (content/courses/ai/en/): the programs and people a heading names.
for (const n of ['Logic', 'Theorist', 'Turing', 'Dartmouth']) NAMES.add(n);

/** The words of a heading that break sentence case. */
export function notSentenceCase(heading: string): string[] {
	return heading
		.split(/(?<=:)\s+|\s+/)
		.slice(1)
		.filter((w, i, all) => {
			const word = w.replace(/^[“"(«]+|[”"),.:;!?»’']+$/g, '');
			if (!/^[A-Z][a-z]/.test(word)) return false;
			if (i > 0 && all[i - 1].endsWith(':')) return false; // never mind: the next check catches a capital after a colon
			return !NAMES.has(word) && !/[A-Z]/.test(word.slice(1));
		});
}

/** British spellings that have an American form. A stem or a whole word; add to it when a lesson shows another. */
const BRITISH = new RegExp(
	'\\b(?:' +
		[
			'colour\\w*', 'behaviour\\w*', 'favour\\w*', 'honour\\w*', 'humour\\w*', 'flavour\\w*', 'neighbour\\w*', 'labour\\w*', 'rumour\\w*',
			'centres?', 'centred', 'centring', 'metres?', 'litres?', 'theatres?', 'fibres?', 'calibres?',
			'licences?', 'licencing', 'defence\\w*', 'offence\\w*', 'pretence', 'catalogue[sd]?', 'dialogues?', 'analogues?', 'programmes?',
			'grey\\w*', 'artefacts?', 'judgement\\w*', 'ageing', 'sceptic\\w*', 'whilst', 'amongst', 'learnt', 'spelt', 'fulfil', 'enrol', 'cheques?', 'tyres?', 'plough\\w*', 'mould\\w*',
			'cancell(?:ed|ing)', 'labell(?:ed|ing)', 'modell(?:ed|ing)', 'travell(?:ed|ing|er|ers)', 'signall(?:ed|ing)', 'fuell(?:ed|ing)', 'levell(?:ed|ing)',
			'(?:organ|recogn|real|summar|custom|optim|initial|normal|local|person|priorit|visual|util|standard|memor|special|general|serial|final|apolog|critic|categor|capital|author|synchron|minim|maxim|monet|digit|sanit|stabil|character|mobil|neutral|legal|modern|commercial|item|jeopard|fertil|hospital|colon|ration|emphas|itemi|harmon|fantas|theor|sympath|vandal|burglar|privat|publicis|globalis|industrial|memoris|familiar|centralis|decentral|pasteur|equal|tokenis|containeris|virtualis|parameteris|generalis|randomis|sanitis|prioritis|minimis|maximis|finalis|materialis|capitalis)is(?:e|es|ed|ing|ation|ations|er|ers)',
			'analys(?:e|es|ed|ing)', 'paralys(?:e|ed|ing)'
		].join('|') +
		')\\b',
	'gi'
);

/** Names that are spelled the British way by their owners; the course writes them as they are. */
const BRITISH_NAMES = /Open Government Licence/g;

/** The British spellings in a text. */
export function britishSpellings(text: string): string[] {
	return [...text.replace(BRITISH_NAMES, ' ').matchAll(BRITISH)].map((m) => m[0]);
}

