"use client";
import { useEffect, useState, useRef, useTransition, useCallback } from "react";
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
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [isPending, startTransition] = useTransition();
  const [transcriptionError, setTranscriptionError] = useState<string | null>(
    null,
  );

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
        setRecordingBlob(blob); // Keep blob to enable discard if transcription fails
        transcribeAndSend(blob); // Directly transcribe and send
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setTranscriptionError(null);

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
      // Transcription is now triggered in mediaRecorder.onstop
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
      // Transcription will be handled in mediaRecorder.onstop
    } else {
      startRecording();
    }
  };

  const handleDiscard = useCallback(() => {
    setRecordingBlob(null);
    setRecordingTime(0);
    setTranscriptionError(null);
  }, []);

  const transcribeAndSend = useCallback(
    async (blob: Blob) => {
      startTransition(async () => {
        const formData = new FormData();
        const file = new File([blob], "recording.webm", {
          type: "audio/webm",
        });
        formData.append("file", file);

        const result = await transcribeAudio(formData);
        if (result.success && result.text) {
          onTranscriptionComplete(result.text); // Directly send the text
          handleDiscard(); // Clear recorder for next turn
        } else {
          console.error(result.message);
          setTranscriptionError(
            result.message || "Failed to transcribe audio.",
          );
        }
      });
    },
    [onTranscriptionComplete, handleDiscard],
  );

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
      {!isRecording &&
        isPending && ( // Only show transcribing when it's actually pending
          <div className="flex flex-col items-center gap-4 w-full">
            {isPending && (
              <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                <Loader2 className="animate-spin" />
                <span>Transcribing...</span>
              </div>
            )}
          </div>
        )}
      {transcriptionError && !isRecording && (
        <p className="text-red-500 text-sm text-center">{transcriptionError}</p>
      )}

      <div className="flex flex-col justify-center items-center gap-4">
        <div className="flex justify-center items-center gap-8">
          <IconDisplay
            asButton
            icon={Trash}
            bgClass="bg-red-500"
            iconSize={20}
            onClick={handleDiscard} // Discard is still useful if transcription fails or before sending
            disabled={
              isRecording ||
              isProcessing ||
              (!recordingBlob && !transcriptionError)
            }
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
        </div>
        <p className="text-center text-muted-foreground text-sm">
          {isRecording
            ? "Recording..."
            : isLimitReached
              ? "Message limit reached. Save this session to start a new one!"
              : isPending
                ? "Transcribing audio..."
                : recordingBlob && !transcriptionError
                  ? "Audio recorded, sending..." // This state should be very brief
                  : transcriptionError
                    ? "Transcription failed."
                    : "Say anything in English with AI"}
        </p>
      </div>
    </div>
  );
};

export default Recording;
