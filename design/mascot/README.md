# Эхо, the course's guide

`echo.svg` is the full mascot: the hooded traveller, the echo-light face, the brass
clasp-clock, the echo waves, and the ring of eight eras. `echo-mark.svg` is the
tight-cropped compact mark, for the favicon and anything under 64 px. Open
`preview.html` to see every state, every era and every size.

- **States:** set one class on the `<svg>`: `mood-idle`, `mood-explain`, `mood-hint`, `mood-cheer` or `mood-hmm`.
- **Era:** `era-1` … `era-8` lights that era's dot on the ring. The eras are 1991, 1996, 2000, 2005, 2014, 2019, 2025 and Искин.
- **Compact:** `compact` hides the ring, the waves and the folds; use it with the viewBox `36 24 88 108`.
- **Colours** are NoeticEcho tokens (`--ink-*`, `--brass-*`, `--echo-*`, `--saffron`, `--bruise-300`), with fallbacks, so the file also works on its own.
- **Motion** honours `prefers-reduced-motion`: under it, every animation stops and the state shows as a still pose.
- **Accessibility:** the SVG has `role="img"` and a `<title>`. Where Эхо speaks, its words go to an `aria-live` region beside it, never into the SVG.

Drawn by hand in SVG for «Сеть насквозь» (NoeticEcho), 27.10.2026. Apache-2.0, like the code.
