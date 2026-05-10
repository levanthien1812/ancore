"use client";
import { useEffect, useState, useRef, useTransition } from "react";
import { Mic, Send, Trash, Square, Loader2, Check } from "lucide-react";
import IconDisplay from "../shared/icon-display";
import { transcribeAudio } from "@/lib/actions/ai.actions";
import { MAXIMUM_RECORDING_TIME } from "@/lib/constants/constant";

const Recording = ({
  onTranscriptionComplete,
  isProcessing,
  isLimitReached,
}: {
  onTranscriptionComplete: (text: string) => void;
  isProcessing: boolean;
  isLimitReached?: boolean;
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordingBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setAudioUrl(null);
      setRecordingBlob(null);
      setTranscribedText(null);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleDiscard = () => {
    setAudioUrl(null);
    setRecordingBlob(null);
    setRecordingTime(0);
    setTranscribedText(null);
  };

  const handleSend = async () => {
    if (recordingBlob) {
      startTransition(async () => {
        const formData = new FormData();
        // OpenAI expects a file with a supported extension (e.g., .webm)
        const file = new File([recordingBlob], "recording.webm", {
          type: "audio/webm",
        });
        formData.append("file", file);

        const result = await transcribeAudio(formData);
        if (result.success && result.text) {
          setTranscribedText(result.text);
        } else {
          console.error(result.message);
        }
      });
    }
  };

  useEffect(() => {
    if (isRecording && recordingTime >= MAXIMUM_RECORDING_TIME) {
      stopRecording();
    }
  }, [isRecording, recordingTime]);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const handleConfirmMessage = () => {
    if (transcribedText) {
      onTranscriptionComplete(transcribedText);
      handleDiscard(); // Clear recorder for next turn
    }
  };

  return (
    <div className="flex flex-col border rounded-md bg-muted/30 p-4 gap-4">
      {isRecording && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-6 h-6 bg-red-500 rounded-full" />
          </div>
          <p className="text-3xl font-mono font-bold text-red-500">
            00:{recordingTime.toString().padStart(2, "0")} / 00:
            {MAXIMUM_RECORDING_TIME}
          </p>
        </div>
      )}
      {!isRecording && (audioUrl || transcribedText || isPending) && (
        <div className="flex flex-col items-center gap-4 w-full">
          {audioUrl && !transcribedText && (
            <audio src={audioUrl} controls className="w-full max-w-xs" />
          )}
          {isPending && (
            <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
              <Loader2 className="animate-spin" />
              <span>Transcribing...</span>
            </div>
          )}
          {transcribedText && (
            <div className="w-full flex items-center gap-2">
              <div className="flex-1 p-3 bg-white rounded-lg border italic text-sm">
                &quot;{transcribedText}&quot;
              </div>
              <button
                onClick={handleConfirmMessage}
                disabled={isProcessing}
                className="p-3 bg-primary text-white rounded-full hover:opacity-90 disabled:opacity-50"
              >
                <Check size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col justify-center items-center gap-4">
        <div className="flex justify-center items-center gap-8">
          <IconDisplay
            asButton
            icon={Trash}
            bgClass="bg-red-500"
            iconSize={20}
            onClick={handleDiscard}
            disabled={(!audioUrl && !isRecording) || isProcessing}
          />
          <IconDisplay
            asButton
            icon={isRecording ? Square : Mic}
            bgClass={isRecording ? "bg-red-500" : "bg-green-500"}
            iconSize={isRecording ? 20 : 36}
            additionalClasses="p-3"
            onClick={handleToggleRecording}
            disabled={isProcessing || isLimitReached}
          />
          <IconDisplay
            asButton
            icon={isPending ? Loader2 : Send}
            bgClass="bg-blue-500"
            iconSize={20}
            additionalClasses={isPending ? "animate-spin" : ""}
            onClick={handleSend}
            disabled={
              !audioUrl ||
              isRecording ||
              isPending ||
              isProcessing ||
              !!transcribedText
            }
          />
        </div>
        <p className="text-center text-muted-foreground text-sm">
          {isRecording
            ? "Recording..."
            : isLimitReached
              ? "Message limit reached. Save this session to start a new one!"
              : audioUrl
                ? "Recording ready to send"
                : "Say anything in English with AI"}
        </p>
      </div>
    </div>
  );
};

export default Recording;
