"use client";

import { useState, useRef, useEffect } from "react";
import { X, Mic, Square, Play, RefreshCw, Check, Loader2 } from "lucide-react";

export default function VoiceRecorderModal({
  onClose,
  onUpload,
}: {
  onClose: () => void;
  onUpload: (audioBase64: string) => Promise<void>;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isSaving, setIsSaving] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // COMPRESSION: Set bits per second to 32kbps (small file size, clear voice)
      const options = { audioBitsPerSecond: 32000 };
      const recorder = new MediaRecorder(stream, options);

      mediaRecorderRef.current = recorder;
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => setBase64(reader.result as string);

        // Stop all tracks to turn off the microphone light
        stream.getTracks().forEach((track) => track.stop());
      };

      // Reset state and start timer BEFORE recorder to ensure sync
      setTimeLeft(15);
      setIsRecording(true);
      recorder.start();

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording(); // This calls recorder.stop()
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      alert("Microphone access denied or not available");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleSave = async () => {
    if (!base64) return;
    setIsSaving(true);
    await onUpload(base64);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
      <div className="bg-white w-full max-w-sm rounded-[40px] p-8 flex flex-col items-center shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="w-full flex justify-end mb-2">
          <button
            onClick={onClose}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <h3 className="text-xl font-black text-slate-800 mb-1">Voice Intro</h3>
        <p className="text-slate-400 text-sm font-bold mb-8 uppercase tracking-tighter">
          Maximum 15 Seconds
        </p>

        <div className="relative w-32 h-32 flex items-center justify-center mb-10">
          {/* Ring visualizer */}
          <div
            className={`absolute inset-0 rounded-full border-4 transition-all duration-500 ${
              isRecording
                ? "border-pink-500 animate-pulse scale-110 opacity-30"
                : "border-slate-100"
            }`}
          />
          <div
            className={`text-4xl font-black transition-colors ${timeLeft <= 3 ? "text-red-500" : "text-slate-800"}`}
          >
            {timeLeft}s
          </div>
        </div>

        {!audioUrl ? (
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-90 ${
              isRecording ? "bg-slate-900 text-white" : "bg-pink-500 text-white"
            }`}
          >
            {isRecording ? (
              <Square fill="currentColor" size={24} />
            ) : (
              <Mic size={32} />
            )}
          </button>
        ) : (
          <div className="flex flex-col w-full gap-4">
            {/* Custom UI for audio player for better speed/look */}
            <audio src={audioUrl} controls className="w-full h-10 mb-2" />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setAudioUrl(null);
                  setTimeLeft(15);
                  setBase64(null);
                }}
                className="flex-1 h-14 bg-slate-100 text-slate-600 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
              >
                <RefreshCw size={18} /> Redo
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 h-14 bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <Check size={18} /> Submit
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
