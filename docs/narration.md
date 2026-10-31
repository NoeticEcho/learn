# Narration

Every Russian lesson can be listened to (spec §4.9). The voice is synthetic: Qwen3-TTS 0.6B
CustomVoice, preset speaker `serena`, chosen by Martin on 28.10.2026 after listening to the
spike's samples. It is rendered on the author's machine, never on CI, and served from a
repository of its own. This page is how a lesson's audio is made, published and kept current.

## The pieces

| Where | What |
|---|---|
| `src/lib/narration/script.ts` | a lesson → its narration script, section by section, in spoken form |
| `src/lib/narration/numbers.ts` | numbers in words, in their case: years («в 1995 году» → «в тысяча девятьсот девяносто пятом году»), dates, decimals, ranges, the genitive after «от», «до», «около» |
| `content/narration/ru.yaml` | the course's pronunciation lexicon: letter names, words, stress |
| a lesson's `say:` | the lesson's own pronunciation map; it wins over the lexicon |
| `src/lib/narration/narration.server.ts` | each section's hash; which lessons have audio of their current text |
| `content/narration/ru.json` | the manifest the build reads: lesson → sections → file, duration, hash |
| `scripts/narration.ts` | `npm run narration -- script / wer / status` |
| `tools/narration/render.py` | the renderer (Python, local) |
| `tools/narration/listen.py` | the renderer's ear: is this take the sentence? |
| `tools/narration/transcribe.py` | Whisper's transcript of each rendered section, for the WER report |
| `tools/narration/run.sh`, `publish.sh` | the whole run, part by part, and publishing |
| `src/lib/narration/Listen.svelte`, `Player.svelte` | «Слушать» and the player |
| [NoeticEcho/learn-audio](https://github.com/NoeticEcho/learn-audio) | the audio files and the renderer's manifest |

## What is read

The `intro` section is the title, the «Зачем» and the definition. Then every `##` section of the
body in order: its heading, paragraphs, list items, tables row by row («Тон: деловой; что
чувствуется: собранность, доверие»; a table of numbers is «На странице таблица.»), and each
«Проверьте себя» with its answer («Ответ: …»). Not read: the practice section (its task is on the
page beside the editor), code (a block is «Пример кода.»; inline code is read as its words),
diagrams and other components (the text around them says what they show), the comic, the quiz.

The spoken form is never displayed. In order:
1. the lesson's `say` map, then the lexicon's `words`, longest first, at word boundaries;
2. domains and URLs, with «точка»: `example.ru` → «экзампл точка ру»;
3. numbers (`numbers.ts`), in this order: years in words; dates («с 1 января» → «с первого января», «28.10.2026» → «двадцать
   восьмого октября две тысячи двадцать шестого года»); percents agreeing with their number; units after a number; hex
   colours character by character (`#0b5cad`); then every number left:
   - **a decimal** is «и … десятых», the fraction agreeing («одна десятая», «две десятых») and keeping its leading zeros
     («0,05» → «ноль и пять сотых»). It is written with a comma in the course. With a dot it is a decimal only when it says
     so (a leading zero, three digits after the point, a percent, a value after a colon: `line-height: 1.6`);
   - **a version, an article and a criterion** keep «точка», as people read them: «эйч-ти-ти-пи один точка один»,
     «вкаг два точка два», «статья восемнадцать точка один», «один точка четыре точка три»;
   - **after «от», «до», «около», «из», «без», «для», «у», «больше», «меньше», «более», «менее»** a number is in the genitive
     («от нуля до двухсот пятидесяти пяти», «до одной секунды»), and so between «с … до»;
   - **a range** `45–75 знаков` is «от сорока пяти до семидесяти пяти знаков» (a year range is the years'); **a ratio**
     `4,5 к 1` ends «к одному»;
   - anything else is a nominative cardinal. Other cases (`в 3 раза` is fine, `по 3 штуки` is not) are not parsed;
4. an acronym of 2–6 Latin capitals not mapped is spelt with the lexicon's `letters`: «CSS» →
   «си-эс-эс»;
5. stress (below).

Utterances shorter than 40 characters are joined to a neighbour (alone, the model mangles short
items) and longer than 320 are cut at a semicolon, colon, dash or comma. The heading stays an
utterance of its own, with a longer pause after it.

### Stress

Neither engine the spike tried has a stress dictionary. A word the voice stresses wrongly goes in
the lexicon's `stress:` list, written with a combining acute (U+0301) after the stressed vowel:
`- замо́к`. **The engine is not given the acute**: Qwen3-TTS reads U+0301 as a sound of its own
(«за́мок» came back from Whisper as «заемок», «замо́к» as «замайок»). It is given the stressed
vowel as a capital instead («замОк»), which it reads without damage. Whether a capital moves the
stress could not be measured here: Whisper cannot hear stress, and an acoustic test on isolated
words was inconclusive. So a stress entry is checked by ear, and where the capital does not
help, the word is respelt in the `words` map instead (a spelling that leaves only one reading).

## Hashes, and what re-renders

A section's hash is SHA-256 of its spoken sentences, the voice and `SCRIPT_VERSION`. A file is
named by it: `ru/<lesson>/<section>-<hash>.opus`. So:
- an edit to a lesson re-renders only the sections whose spoken text changed;
- a lexicon entry re-renders only the sections it changes, in every lesson;
- a lesson is offered («Слушать») only when **every** section has audio of its current text. An
  edited lesson goes silent until it is rendered again, rather than reading words the page no
  longer has. `npm run narration -- status` lists the stale ones.

## Rendering

Requirements (all on the author's machine): the venv `~/.cache/learn-tts/venv-qwen-sys` (system
ROCm torch, `qwen-tts` 0.1.1; `private/tts-spike/scripts/install-qwen-sys.sh`), the weights in
`~/.cache/learn-tts/models/Qwen3-TTS-12Hz-0.6B-CustomVoice`, `ffmpeg`, and for the check Lemonade
with `Whisper-Large-v3-Turbo` on `localhost:13305`. A checkout of NoeticEcho/learn-audio beside
this one (`../learn-audio`).

```bash
tools/narration/run.sh 3 4        # parts 3 and 4: render, transcribe, publish, then stop
tools/narration/run.sh            # the whole course
PUBLISH=0 tools/narration/run.sh 2  # render and check only
```

Start it detached (`setsid nohup tools/narration/run.sh > /dev/null 2>&1 &`): it ends by itself. A
render that dies is tried again three times, and one that hangs for 30 minutes exits (`hung:` in the
log) so that it can be.
Progress: `private/narration/run.log` and `render.log` of the main checkout; one line per
section with its real-time factor and the memory available. To resume after a stop, a crash or a
reboot, run the same command again: the manifest is written after every section, and a section
whose file and hash are there is never rendered twice. Two renders never share an audio
directory (`.render.lock`). `kill -TERM <pid>` stops it after the current section.

The renderer loads the model once and renders a section's sentences in one batch (seeded by the
section's hash, so a re-render is reproducible), then **listens to each sentence** (`listen.py`),
trims and spaces the sentences, normalises the section to −16 LUFS (two-pass `loudnorm`), encodes
Opus at 32 kbps mono, records it, and at the end unloads and exits. Nothing stays running.

Listening exists because of what the pilot found. About 1 sentence in 120 **drifts**: the model
starts well or not at all and goes on in fluent syllables of no language, at a plausible length
(«Вы меняете только свою копию…» came out «…только неблизёда, то всё сосужи кости…»). A duration
check cannot see it, and a section-level WER only says the section is bad. So each take is sent to
Whisper and compared with its sentence on content words (Cyrillic, four letters or more, fuzzily;
numbers and the spoken forms of Latin terms left out, because Whisper writes those as digits and
Latin). Recall under 0.7 or precision under 0.5 is a failed take, and the sentence is rendered again
alone with another seed, up to three times; the best take is kept, and a sentence still failing is
logged as `FLAGGED` in `render.log`. These thresholds separated the pilot's drifted sentences from
its other 870. It costs about 0.4 s a sentence. If Whisper is down the run goes on unheard and says
how many at the end.

To render a section again by hand (a mispronunciation only an ear finds):
`render.py --scripts … --audio … --redo <lesson>#<key>,… --salt 2`. The file keeps its name, because
its text did not change.

**Memory.** The GPU's memory is the system's (Strix Halo, 32 GB shared) and does not show in the
process's RSS, and other work runs here. Before every section the renderer reads `MemAvailable`:
below 8 GB, or while a `mix test` or `mix precommit` is running anywhere on the machine (read from
`/proc`, argument by argument, because an agent's prompt may merely mention them), it pauses and
logs that it did. So the wall-clock time of a run depends on what else the machine is doing. Measured
RTF while it runs: 0.25–0.5 per section in batch. `kill -TERM` stops it, even during a pause.

## Checking by ear, without ears

`tools/narration/transcribe.py` sends each section, as served, to Whisper, and
`npm run narration -- wer` scores what it heard against the script, after putting both into
spoken form by the same rules (so «DNS» and «ди-эн-эс» are the same word) and numbers into words.
Sections above 5% are listed with their errors: the candidates for a lexicon entry or a lesson's
`say`. Fix the map, run the same parts again (only the changed sections re-render), re-check.
Whisper is a proxy, and the report is a list to look at, not a verdict. It forgives a wrong stress,
it sometimes mishears a right word, and it writes terms in its own spelling («Let's Encrypt» for
«летс энкрипт»), which counts as an error unless a map folds it. Lessons dense in acronyms score worse
than they sound. Sentence-level drift is the renderer's job above; this report finds what the maps
should say.

## Publishing

Audio first, then the manifest (`tools/narration/publish.sh audio`, then `… manifest`; `run.sh`
does both after every part, so a long run's lessons appear as they are finished). The audio repository is served by GitHub Pages at
`https://open.noeticecho.space/learn-audio/`: the org's custom domain covers project pages, so it
is the textbook's own origin, the CSP's `media-src 'self'` allows it, and no third party is
involved. The manifest step commits `content/narration/ru.json` to this repository's main from a
throwaway worktree; the next Pages build offers «Слушать» on every lesson it covers.

Why a repository of its own: the audio is hundreds of megabytes and changes with the text, and
none of it belongs in this repository's history. Files are immutable (named by hash) and the
renderer deletes the files of a lesson's old sections, so the published tree stays the size of
one copy of the course (about 300 MB at 32 kbps; Pages allows 1 GB). Its history grows with
every re-render; if it ever nears a gigabyte, squash it to one commit and force-push: nothing
refers to a commit of it.

## The player

`Listen.svelte` is in the lesson's header when the page has narration: a button with the length
and the note «Озвучено синтезом речи (Qwen3-TTS), голос не принадлежит человеку». The player is a
chunk of its own, loaded on the first click (the first route's budget does not see it). It plays
the sections in order and marks the one being read on the page (`data-narrating`), lists the
sections to jump to, sets speed 0.8–1.5× (remembered), answers the system's media keys and lock
screen (Media Session), and remembers the section and second reached per lesson in the learner's
store (`narration:<lang>:<lesson>`), so it goes on from there.

Offline only when asked: «Скачать озвучку для офлайна» puts this lesson's files into a cache
named `narration`, which the service worker neither fills nor cleans (its scope is `/learn/`, and
it deletes only `learn-*` caches). A downloaded section plays from a `blob:` URL, hence
`media-src 'self' blob:`.

## English: a sample, not an edition

The English edition has no voice chosen and no audio, and **nothing here publishes it**: there is no English
manifest, so `narration()` is null for `en` and no English lesson offers «Listen». What exists is the means to
hear what a voice would do with it, for the person who chooses one.

| Where | What |
|---|---|
| `content/narration/en.yaml` | the English lexicon: the names of the letters, acronyms read as words (`keep`: `POST`, `SELECT`), terms read in a way the spelling does not show |
| `src/lib/narration/numbers.en.ts` | years in pairs («nineteen ninety-five»), dates with an ordinal day, a decimal digit by digit («zero point zero seven»), ranges, ratios, money |
| `script.ts` (`Lang`, `STRINGS`) | what the script says in its own words («Code example.», «Answer:», «dot», «equals»), per language |

```bash
node scripts/narration.ts script --lang en --speaker serena --out /tmp/en.scripts.json
tools/narration/render.py --scripts /tmp/en.scripts.json --audio /tmp/en-audio \
    --lessons 01-internet/01-history --only 01-internet/01-history#3 --log /tmp/en-render.log
tools/narration/transcribe.py --audio /tmp/en-audio --lang en --out /tmp/en-transcripts.json
```

A speaker is part of the hash, so a sample is never mistaken for the edition's audio, and Russian hashes are what
they were (the English change leaves the Russian scripts byte for byte). `wer`, `status`, `run.sh` and `publish.sh` are
the Russian edition's; the renderer's ear works in English (Latin words of four letters or more; an acronym Whisper
writes in capitals is left out).

The model's presets (`get_supported_speakers()`): `aiden`, `dylan`, `eric`, `ono_anna`, `ryan`, `serena`, `sohee`,
`uncle_fu`, `vivian`. The model card calls `ryan` and `aiden` the English-native ones; the config marks `dylan` and `eric`
as Beijing and Sichuan dialects. `serena` is the Russian voice and reads English too (a sample, not a decision). Measured on 2026-10-31, three sections of 1.2–1.5 thousand characters, listening included: 11.4–12.3 characters
of script per second of audio (`CHARS_PER_SECOND["en"]`), real-time factor 0.41–0.43 on an idle machine (Russian runs
0.37–0.57; 0.7 while another session was using the GPU). The whole English edition is 1.13 million characters, about 27
hours of audio, and so about 11 hours of rendering on an idle machine and more in company. Not checked by ear.
