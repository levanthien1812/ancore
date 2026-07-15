import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AudioStore = {
  isAudioOn: boolean;
  toggleAudio: () => void;
  setAudio: (value: boolean) => void;
};

export const useAudioStore = create<AudioStore>()(
  persist(
    (set, get) => ({
      isAudioOn: true,

      toggleAudio: () => {
        const { isAudioOn } = get();
        toast.success(isAudioOn ? "Audio disabled" : "Audio enabled");
        set((state) => ({
          isAudioOn: !state.isAudioOn,
        }));
      },

      setAudio: (value: boolean) => {
        toast.success(value ? "Audio enabled" : "Audio disabled");
        set({
          isAudioOn: value,
        });
      },
    }),
    {
      name: "audio",
    },
  ),
);
