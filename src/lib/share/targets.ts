/**
 * Where a lesson can be shared, as plain URLs each service documents for sharing a link:
 * - Telegram: `t.me/share/url?url=&text=` (core.telegram.org/widgets/share);
 * - VK: `vk.com/share.php?url=&title=` (VK's share button; the preview is read from og: tags);
 * - X: `x.com/intent/post?text=&url=` (the Web Intent; X counts a link as 23 characters);
 * - WhatsApp: `wa.me/?text=` with the address inside the text (faq.whatsapp.com, «click to chat»).
 * Nothing is loaded from any of them until the person follows the link.
 */
export type ShareInput = { url: string; title: string; text: string };
export type Target = { id: 'telegram' | 'vk' | 'x' | 'whatsapp'; name: string; href: string };

const X_LIMIT = 280 - 24; // the link and the space before it

/** The caption for X: the whole text when it fits, else the title alone. */
export const xText = (title: string, text: string) => (text.length <= X_LIMIT ? text : title.slice(0, X_LIMIT));

export function targets({ url, title, text }: ShareInput): Target[] {
	const e = encodeURIComponent;
	return [
		{ id: 'telegram', name: 'Telegram', href: `https://t.me/share/url?url=${e(url)}&text=${e(text)}` },
		{ id: 'vk', name: 'ВКонтакте', href: `https://vk.com/share.php?url=${e(url)}&title=${e(title)}` },
		{ id: 'x', name: 'X', href: `https://x.com/intent/post?text=${e(xText(title, text))}&url=${e(url)}` },
		{ id: 'whatsapp', name: 'WhatsApp', href: `https://wa.me/?text=${e(`${text} ${url}`)}` }
	];
}

/** What a lesson's share says: its title, whose it is, and the definition of its topic. */
export const lessonText = (title: string, definition: string, site: string) => `«${title}», урок учебника «${site}». ${definition}`;
