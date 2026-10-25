import "./style.css";
import { createRecognizer } from "./recognition.ts";
import { setupSettings } from "./settings.ts";
import { getSelectedText, speak, stopSpeaking } from "./speak.ts";

const listenButton = document.querySelector<HTMLButtonElement>("#listen")!;
const status = document.querySelector<HTMLElement>("#status")!;
const interim = document.querySelector<HTMLElement>("#interim")!;
const transcript = document.querySelector<HTMLTextAreaElement>("#transcript")!;

const getSettings = setupSettings(
  document.querySelector<HTMLFormElement>("#settings")!,
  (settings) => recognizer?.setLang(settings.lang),
);

const recognizer = createRecognizer({
  onInterim: (text) => (interim.textContent = text),
  onFinal: (text) => {
    const separator = transcript.value && !transcript.value.endsWith("\n") ? "\n" : "";
    transcript.value += separator + text;
    transcript.scrollTop = transcript.scrollHeight;
  },
  onStatus: (text) => (status.textContent = text),
  onListeningChange: (listening) => {
    // Keep the icon in its own aria-hidden span so screen readers only announce the label.
    const icon = Object.assign(document.createElement("span"), {
      ariaHidden: "true",
      textContent: listening ? "■ " : "● ",
    });
    listenButton.replaceChildren(icon, listening ? "Zuhören stoppen" : "Zuhören starten");
    listenButton.classList.toggle("active", listening);
  },
});

if (recognizer) {
  listenButton.addEventListener("click", () => {
    if (recognizer.listening) recognizer.stop();
    else recognizer.start(getSettings().lang);
  });
} else {
  listenButton.disabled = true;
  status.textContent = "Spracherkennung wird von diesem Browser nicht unterstützt.";
}

document.querySelector("#read")!.addEventListener("click", () => {
  const selected = transcript.value.slice(transcript.selectionStart, transcript.selectionEnd);
  const text = selected || transcript.value;
  if (text.trim()) speak(text, getSettings());
});

document.querySelector("#stop")!.addEventListener("click", stopSpeaking);

document.querySelector("#clear")!.addEventListener("click", () => {
  transcript.value = "";
});

addEventListener("mouseup", (event) => {
  // Using a control must not re-read a selection that is still lingering elsewhere.
  if ((event.target as Element).closest("button, select, input")) return;

  const selectedText = getSelectedText();
  if (selectedText) {
    speak(selectedText, getSettings());
    console.log(`Selected text: ${selectedText}`);
  }
});
