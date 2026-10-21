import "./style.css";
import { setupRecognition } from "./recognition.ts";
import { getSelectedText, speak } from "./speak.ts";

setupRecognition(document.querySelector<HTMLButtonElement>("#speak")!);

addEventListener("mouseup", () => {
  const selectedText = getSelectedText();
  if (selectedText) {
    speak(selectedText);
    console.log(`Selected text: ${selectedText}`);
  }
});
