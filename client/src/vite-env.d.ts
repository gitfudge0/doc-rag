/// <reference types="vite/client" />

// Speech Recognition API interfaces
interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
  speechSynthesis: SpeechSynthesis;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  interpretation: any;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare class SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  grammars: any;

  constructor();
  start(): void;
  stop(): void;
  abort(): void;

  onstart: (ev: Event) => any;
  onend: (ev: Event) => any;
  onerror: (ev: SpeechRecognitionErrorEvent) => any;
  onresult: (ev: SpeechRecognitionEvent) => any;
  onnomatch: (ev: SpeechRecognitionEvent) => any;
  onaudiostart: (ev: Event) => any;
  onaudioend: (ev: Event) => any;
  onsoundstart: (ev: Event) => any;
  onsoundend: (ev: Event) => any;
  onspeechstart: (ev: Event) => any;
  onspeechend: (ev: Event) => any;
}

// Speech Synthesis API interfaces
interface SpeechSynthesisUtterance extends EventTarget {
  text: string;
  lang: string;
  voice: SpeechSynthesisVoice | null;
  volume: number;
  rate: number;
  pitch: number;

  onstart: (event: Event) => void;
  onend: (event: Event) => void;
  onerror: (event: Event) => void;
  onpause: (event: Event) => void;
  onresume: (event: Event) => void;
  onboundary: (event: Event) => void;
  onmark: (event: Event) => void;
}

interface SpeechSynthesisVoice {
  default: boolean;
  lang: string;
  localService: boolean;
  name: string;
  voiceURI: string;
}

interface SpeechSynthesis {
  pending: boolean;
  speaking: boolean;
  paused: boolean;

  onvoiceschanged: (event: Event) => void;
  
  speak(utterance: SpeechSynthesisUtterance): void;
  cancel(): void;
  pause(): void;
  resume(): void;
  getVoices(): SpeechSynthesisVoice[];
}

declare var SpeechSynthesisUtterance: {
  prototype: SpeechSynthesisUtterance;
  new(text?: string): SpeechSynthesisUtterance;
};
