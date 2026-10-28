// Build-time code (Open Graph cards, llms.txt, the sitemap) speaks every edition without a page
// having loaded its catalogue first: this registers them all, synchronously. Server-only, so the
// browser keeps loading English on demand (index.ts loadCatalogue).
import { registerCatalogue } from './index.ts';
import en from './en.json';

registerCatalogue('en', en);
