function initializeRecognition() {
  if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
    console.error("Speech recognition is not supported in this browser.");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "de-DE";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.addEventListener("start", () => {
    console.log("Speech recognition started.");
  });

  recognition.addEventListener(
    "error",
    (event: SpeechRecognitionErrorEvent) => {
      console.error(`Speech recognition error: ${event.error}`);
    },
  );

  recognition.addEventListener("result", (event: SpeechRecognitionEvent) => {
    const transcript = event.results[0][0].transcript;
    console.log(`Recognized speech: ${transcript}`);
  });

  recognition.addEventListener("end", () => {
    console.log("Speech recognition ended.");
  });

  return recognition;
}

export function setupRecognition(element: HTMLButtonElement) {
  const recognition = initializeRecognition();
  if (!recognition) return;

  element.addEventListener("click", () => recognition.start());
}
