export type Settings = {
  lang: string;
  voiceName: string | null;
  rate: number;
  pitch: number;
  volume: number;
};

const STORAGE_KEY = "speech-settings";

const DEFAULT_SETTINGS: Settings = {
  lang: "de-DE",
  voiceName: null,
  rate: 1,
  pitch: 1,
  volume: 1,
};

const languageNames = new Intl.DisplayNames(["de"], { type: "language" });

function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return { ...DEFAULT_SETTINGS, ...(stored ? JSON.parse(stored) : {}) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(settings: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage may be unavailable (private mode); settings then last for the session only.
  }
}

// Some platforms (e.g. Android) report "de_DE" instead of "de-DE".
function normalizeLang(lang: string) {
  return lang.replace("_", "-");
}

function voicesFor(lang: string) {
  return speechSynthesis
    .getVoices()
    .filter((voice) => normalizeLang(voice.lang) === lang);
}

export function findVoice(settings: Settings) {
  const voices = voicesFor(settings.lang);
  return voices.find((voice) => voice.name === settings.voiceName) ?? voices[0];
}

function availableLanguages() {
  const langs = speechSynthesis.getVoices().map((voice) => normalizeLang(voice.lang));
  return [...new Set(langs)].sort();
}

function languageLabel(lang: string) {
  try {
    return `${languageNames.of(lang)} (${lang})`;
  } catch {
    return lang;
  }
}

export function setupSettings(
  form: HTMLFormElement,
  onChange: (settings: Settings) => void,
) {
  const langSelect = form.elements.namedItem("lang") as HTMLSelectElement;
  const voiceSelect = form.elements.namedItem("voice") as HTMLSelectElement;
  const sliders = ["rate", "pitch", "volume"] as const;

  let settings = loadSettings();

  function render() {
    const langs = availableLanguages();
    // Voices load asynchronously; until then keep the stored language as-is.
    if (langs.length > 0 && !langs.includes(settings.lang)) {
      const prefix = settings.lang.split("-")[0];
      settings.lang = langs.find((lang) => lang.startsWith(prefix)) ?? langs[0];
    }

    langSelect.replaceChildren(
      ...(langs.length > 0 ? langs : [settings.lang]).map(
        (lang) => new Option(languageLabel(lang), lang, false, lang === settings.lang),
      ),
    );

    const selectedVoice = findVoice(settings);
    voiceSelect.replaceChildren(
      ...voicesFor(settings.lang).map(
        (voice) =>
          new Option(
            voice.localService ? voice.name : `${voice.name} · online`,
            voice.name,
            false,
            voice === selectedVoice,
          ),
      ),
    );
    voiceSelect.disabled = voiceSelect.options.length === 0;
    settings.voiceName = selectedVoice?.name ?? settings.voiceName;

    for (const name of sliders) {
      const input = form.elements.namedItem(name) as HTMLInputElement;
      input.value = String(settings[name]);
      form.querySelector(`output[for="${name}"]`)!.textContent = settings[name].toFixed(1);
    }
  }

  function update(next: Settings) {
    const langChanged = next.lang !== settings.lang;
    settings = next;
    if (langChanged) settings.voiceName = null;
    render();
    saveSettings(settings);
    onChange(settings);
  }

  form.addEventListener("input", () => {
    update({
      lang: langSelect.value,
      voiceName: voiceSelect.value || null,
      rate: Number((form.elements.namedItem("rate") as HTMLInputElement).value),
      pitch: Number((form.elements.namedItem("pitch") as HTMLInputElement).value),
      volume: Number((form.elements.namedItem("volume") as HTMLInputElement).value),
    });
  });

  form.addEventListener("reset", (event) => {
    event.preventDefault();
    update({ ...DEFAULT_SETTINGS });
  });

  speechSynthesis.addEventListener("voiceschanged", () => {
    const lang = settings.lang;
    render();
    if (settings.lang !== lang) onChange(settings);
  });

  render();

  return () => settings;
}
