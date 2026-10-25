// lib.dom ships the SpeechRecognition event types but not the recognizer itself.
interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  addEventListener(type: "start" | "end", listener: (event: Event) => void): void;
  addEventListener(type: "result", listener: (event: SpeechRecognitionEvent) => void): void;
  addEventListener(type: "error", listener: (event: SpeechRecognitionErrorEvent) => void): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

interface Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}
