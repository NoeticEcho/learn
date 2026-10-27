// wawoff2 ships no types. The one call lib/seo/og.server.ts makes: WOFF2 bytes in, TTF bytes out.
declare module 'wawoff2' {
	const wawoff2: { decompress(woff2: Uint8Array): Promise<Uint8Array>; compress(ttf: Uint8Array): Promise<Uint8Array> };
	export default wawoff2;
}
