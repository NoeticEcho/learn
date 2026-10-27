/** «Скачать сайт»: one era's files and a README with deploy guides, zipped in the browser. */
import { zipSync, strToU8 } from 'fflate';
import { t } from '#lib/i18n/index.ts';

export function siteZip(files: Record<string, string>, title: string, era: string): Blob {
	const entries: Record<string, Uint8Array> = { 'README.md': strToU8(t('zip.readme', { title, era })) };
	for (const [name, text] of Object.entries(files)) if (/^[\w.-]+$/.test(name)) entries[name] = strToU8(text);
	const bytes = zipSync(entries, { level: 6 });
	return new Blob([bytes as BlobPart], { type: 'application/zip' });
}

/** Hands the browser a file to save, without a server. */
export function download(blob: Blob, name: string): void {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = name;
	document.body.append(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}
