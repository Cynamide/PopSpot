declare module "react-speech-recognition" {
  // Optionally, you can provide minimal type definitions here if you want:

  import { ComponentType } from "react";

  interface SpeechRecognitionOptions {
    continuous?: boolean;
    language?: string;
  }

  export interface UseSpeechRecognitionOptions {
    commands?: any[];
  }

  export interface SpeechRecognition {
    startListening: (options?: SpeechRecognitionOptions) => void;
    stopListening: () => void;
    abortListening: () => void;
  }

  export interface SpeechRecognitionHook {
    transcript: string;
    listening: boolean;
    resetTranscript: () => void;
    browserSupportsSpeechRecognition: boolean;
    interimTranscript: string;
    finalTranscript: string;
  }

  export function useSpeechRecognition(
    options?: UseSpeechRecognitionOptions
  ): SpeechRecognitionHook;

  const SpeechRecognition: SpeechRecognition;

  export default SpeechRecognition;
}
