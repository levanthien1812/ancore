import { useAudioStore } from "../stores/audio-store";

export const handlePlayPronunciation = (text: string) => {
  const isAudioOn = useAudioStore.getState().isAudioOn;
  if (!isAudioOn) return;
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  if (text.length === 0) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.volume = 1;
  utterance.rate = 1;
  utterance.pitch = 1;
  speechSynthesis.speak(utterance);
};

export const handlePlayAudio = (audio: HTMLAudioElement) => {
  const isAudioOn = useAudioStore.getState().isAudioOn;
  if (!isAudioOn) return;
  audio.currentTime = 0;
  audio.play().catch((err) => console.error("Audio play failed:", err));
};
