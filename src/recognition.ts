type RecognitionCallbacks = {
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onStatus: (status: string) => void;
  onListeningChange: (listening: boolean) => void;
};

// Errors after which restarting is pointless until the user intervenes.
const FATAL_ERRORS = new Set(["not-allowed", "service-not-allowed", "language-not-supported"]);
const RESTART_DELAY_MS = 300;

export function createRecognizer(callbacks: RecognitionCallbacks) {
  const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  if (!Recognition) return null;

  const recognition = new Recognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  // Whether the user wants to listen; the browser ends sessions on its own
  // (silence, network, time limits), so "end" restarts while this is set.
  let listening = false;

  function setListening(value: boolean) {
    listening = value;
    callbacks.onListeningChange(value);
  }

  function startSession() {
    try {
      recognition.start();
    } catch (error) {
      console.error(error);
    }
  }

  recognition.addEventListener("start", () => {
    callbacks.onStatus(`Hört zu (${recognition.lang}) …`);
  });

  recognition.addEventListener("result", (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript.trim();
      if (result.isFinal) {
        if (transcript) callbacks.onFinal(transcript);
      } else {
        interim += result[0].transcript;
      }
    }
    callbacks.onInterim(interim.trim());
  });

  recognition.addEventListener("error", (event) => {
    console.error(`Speech recognition error: ${event.error}`);
    if (FATAL_ERRORS.has(event.error)) {
      setListening(false);
      callbacks.onStatus(`Gestoppt: ${event.error}`);
    } else {
      callbacks.onStatus(`Fehler: ${event.error} – starte neu …`);
    }
  });

  recognition.addEventListener("end", () => {
    callbacks.onInterim("");
    if (!listening) return;
    setTimeout(() => listening && startSession(), RESTART_DELAY_MS);
  });

  return {
    start(lang: string) {
      recognition.lang = lang;
      setListening(true);
      startSession();
    },
    stop() {
      setListening(false);
      recognition.stop();
      callbacks.onStatus("Gestoppt");
    },
    setLang(lang: string) {
      if (recognition.lang === lang) return;
      recognition.lang = lang;
      // Aborting triggers "end", which restarts with the new language.
      if (listening) recognition.abort();
    },
    get listening() {
      return listening;
    },
  };
}
