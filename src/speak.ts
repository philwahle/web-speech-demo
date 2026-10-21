const synth = window.speechSynthesis;

export function getSelectedText() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }
  return selection.toString();
}

export function speak(text: string) {
  let utterance = new SpeechSynthesisUtterance(text);
  synth.speak(utterance);
}
