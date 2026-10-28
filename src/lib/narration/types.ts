/** What a lesson page gets about its audio (narration.server.ts): enough to play, highlight and remember. */
export type Narration = {
	/** Where the files are served from, from the site's origin: `/learn-audio/`. */
	base: string;
	sections: { key: string; heading: string; file: string; duration: number }[];
	/** The whole lesson, in seconds. */
	duration: number;
};
