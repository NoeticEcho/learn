"""The renderer's ear: did the voice say this sentence, or drift off it?

The pilot found the model's real failure: now and then a sentence comes out as fluent syllables of
no language, at a plausible length, so no duration check sees it. Whisper does. A clip is
transcribed (Lemonade's whisper.cpp, http://localhost:13305) and compared with its sentence on
content words only (English: Latin words, with the acronyms it writes in capitals left out): Cyrillic words of four letters or more, fuzzily, so that a wrong ending counts as
heard. Numbers (Whisper writes digits) and the spoken forms of Latin terms (it writes the Latin) are
left out by `ignore`. That is a test for "is this the sentence at all", not a word error rate;
`npm run narration -- wer` is that.
"""
import difflib, json, re, subprocess, tempfile, wave

API = "http://localhost:13305/api/v1/audio/transcriptions"
NUMERAL = re.compile(r"^(ноль|один|одн|дв[аеу]|двух|тр[иеё]|четыр|четв|пят|шест|сем|седьм|восем|восьм|девят|десят|перв|втор|"
                     r"одиннадц|двенадц|тринадц|четырнадц|пятнадц|шестнадц|семнадц|восемнадц|девятнадц|двадц|тридц|"
                     r"сорок|девяност|ст[оа]|сот|двест|трист|тысяч|миллион|миллиард|процент)")
NUMERAL_EN = re.compile(r"^(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|"
                        r"seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|"
                        r"billion|percent|point|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)")
MIN_WORD, HEARD = 4, 0.72  # a word counts as heard above this similarity


def words(text, lang="ru"):
    if lang == "en":
        # Whisper writes an acronym the voice spelt («H T T P S») as «HTTPS»: it is not a word to compare
        text = re.sub(r"\b[A-Z]{2,}[0-9]*\b", " ", text)
        return re.findall(r"[a-z]+(?:'[a-z]+)?", text.lower().replace("’", "'"))
    return re.findall(r"[а-я]+", text.lower().replace("ё", "е").replace("-", " "))


def content(text, ignore=frozenset(), lang="ru"):
    numeral = NUMERAL_EN if lang == "en" else NUMERAL
    return [w for w in words(text, lang) if len(w) >= MIN_WORD and w not in ignore and not numeral.match(w)]


def near(word, candidates):
    return any(difflib.SequenceMatcher(None, word, c).ratio() >= HEARD for c in candidates)


def score(reference, heard, ignore=frozenset(), lang="ru"):
    """(recall, precision, content words): how much of the sentence was heard, how much of what
    was heard belongs to it. Fewer than three content words say nothing: both are 1."""
    ref, hyp = content(reference, ignore, lang), content(heard, ignore, lang)
    if len(ref) < 3:
        return 1.0, 1.0, len(ref)
    all_ref, all_hyp = words(reference, lang), words(heard, lang)
    recall = sum(near(w, all_hyp) for w in ref) / len(ref)
    precision = sum(near(w, all_ref) for w in hyp) / len(hyp) if hyp else 0.0
    return recall, precision, len(ref)


def transcribe_pcm(pcm16, rate, lang="ru"):
    """Whisper's text for mono 16-bit samples (bytes), or None when it did not answer."""
    with tempfile.NamedTemporaryFile(suffix=".wav") as f:
        with wave.open(f.name, "wb") as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate); w.writeframes(pcm16)
        r = subprocess.run(["curl", "-sf", "--max-time", "120", API, "-F", "model=Whisper-Large-v3-Turbo", "-F", f"language={lang}",
                            "-F", "response_format=json", "-F", f"file=@{f.name}"], capture_output=True, text=True)
    if r.returncode:
        return None
    return json.loads(r.stdout)["text"].replace("\n", "").strip()
