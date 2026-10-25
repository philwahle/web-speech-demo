import { findVoice, type Settings } from "./settings.ts";

const synth = window.speechSynthesis;

export function getSelectedText() {
  // window.getSelection() does not cover selections inside form fields.
  const active = document.activeElement;
  if (active instanceof HTMLTextAreaElement) {
    return active.value.slice(active.selectionStart, active.selectionEnd);
  }

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }
  return selection.toString();
}

export function speak(text: string, settings: Settings) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = settings.lang;
  utterance.voice = findVoice(settings) ?? null;
  utterance.rate = settings.rate;
  utterance.pitch = settings.pitch;
  utterance.volume = settings.volume;
  synth.cancel();
  synth.speak(utterance);
}

export function stopSpeaking() {
  synth.cancel();
}
