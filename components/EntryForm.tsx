"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EntryType } from "@/lib/types";

type InputMode = "idle" | "processing" | "review";

interface EntryFormProps {
  mapId: string;
  xAxisLabel: string;
  xAxisLow: string;
  xAxisHigh: string;
  yAxisLabel: string;
  yAxisLow: string;
  yAxisHigh: string;
}

export default function EntryForm({
  mapId,
  xAxisLabel,
  xAxisLow,
  xAxisHigh,
  yAxisLabel,
  yAxisLow,
  yAxisHigh,
}: EntryFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [inputText, setInputText] = useState("");
  const [dragging, setDragging] = useState(false);
  const [mode, setMode] = useState<InputMode>("idle");
  const [processingStatus, setProcessingStatus] = useState("");
  const [notes, setNotes] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<EntryType>("article");
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [topics, setTopics] = useState("");
  const [xSignal, setXSignal] = useState(0);
  const [ySignal, setYSignal] = useState(0);
  const [signalReasoning, setSignalReasoning] = useState("");
  const [agreement, setAgreement] = useState(0);
  const [weight, setWeight] = useState(0.5);
  const [saving, setSaving] = useState(false);

  const isUrl = (text: string) => {
    try {
      const trimmed = text.trim();
      if (trimmed.match(/^https?:\/\//i)) {
        new URL(trimmed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const analyze = useCallback(
    async (params: {
      content?: string;
      title?: string;
      type?: string;
      notes?: string;
      imageBase64?: string;
      imageMimeType?: string;
    }) => {
      setProcessingStatus("Analyzing with AI...");
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, mapId }),
      });
      const data = await res.json();
      setTitle(data.title || params.title || "Untitled");
      setSummary(data.summary || "");
      setXSignal(data.xSignal ?? 0);
      setYSignal(data.ySignal ?? 0);
      setSignalReasoning(data.signalReasoning || "");
      if (data.topics?.length) {
        setTopics(data.topics.join(", "));
      }
      if (data.type) {
        setType(data.type as EntryType);
      }
    },
    [mapId]
  );

  const processUrl = useCallback(
    async (inputUrl: string) => {
      setMode("processing");
      setUrl(inputUrl);
      setProcessingStatus("Fetching URL content...");
      try {
        const fetchRes = await fetch("/api/fetch-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: inputUrl }),
        });
        const fetchData = await fetchRes.json();
        if (fetchData.error) throw new Error(fetchData.error);
        setContent(fetchData.text || "");
        setTitle(fetchData.title || "");
        await analyze({
          content: fetchData.text || "",
          title: fetchData.title || "",
          type: "article",
          notes: notes || undefined,
        });
        setMode("review");
      } catch (err) {
        console.error(err);
        setProcessingStatus(
          "Failed to fetch URL. Try pasting content directly."
        );
        setTimeout(() => setMode("idle"), 2000);
      }
    },
    [analyze, notes]
  );

  const processFile = useCallback(
    async (file: File) => {
      setMode("processing");
      if (file.type === "application/pdf") {
        setProcessingStatus("Extracting PDF text...");
        try {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (data.error) throw new Error(data.error);
          setContent(data.text);
          setType("pdf");
          await analyze({
            content: data.text,
            title: data.title || "",
            type: "pdf",
            notes: notes || undefined,
          });
          setMode("review");
        } catch (err) {
          console.error(err);
          setProcessingStatus("Failed to parse PDF.");
          setTimeout(() => setMode("idle"), 2000);
        }
      } else if (file.type.startsWith("image/")) {
        setProcessingStatus("Analyzing image...");
        try {
          const buffer = await file.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(buffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ""
            )
          );
          setContent(`[Image: ${file.name}]`);
          setType("image");
          await analyze({
            imageBase64: base64,
            imageMimeType: file.type,
            type: "image",
            notes: notes || undefined,
          });
          setMode("review");
        } catch (err) {
          console.error(err);
          setProcessingStatus("Failed to process image.");
          setTimeout(() => setMode("idle"), 2000);
        }
      } else {
        setProcessingStatus("Unsupported file type. Use PDF or images.");
        setTimeout(() => setMode("idle"), 2000);
      }
    },
    [analyze, notes]
  );

  const processRawText = useCallback(async () => {
    if (!inputText.trim()) return;
    setMode("processing");
    setContent(inputText);
    await analyze({
      content: inputText,
      type: "post",
      notes: notes || undefined,
    });
    setMode("review");
  }, [inputText, analyze, notes]);

  const handleSubmitInput = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    if (isUrl(trimmed)) {
      await processUrl(trimmed);
    } else {
      await processRawText();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmitInput();
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) processFile(file);
          return;
        }
      }
    },
    [processFile]
  );

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          type,
          url: url || null,
          summary,
          notes: notes || null,
          agreement,
          weight,
          xSignal,
          ySignal,
          topics,
          mapId,
        }),
      });
      if (res.ok) {
        router.push("/library");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setMode("idle");
    setInputText("");
    setTitle("");
    setContent("");
    setUrl("");
    setSummary("");
    setTopics("");
    setXSignal(0);
    setYSignal(0);
    setSignalReasoning("");
    setAgreement(0);
    setWeight(0.5);
    setNotes("");
    setType("article");
  };

  const agreementLabel = (v: number) => {
    if (v <= -0.7) return "Strongly disagree";
    if (v <= -0.3) return "Disagree";
    if (v < 0.3) return "Neutral";
    if (v < 0.7) return "Agree";
    return "Strongly agree";
  };

  const weightLabel = (v: number) => {
    if (v <= 0.2) return "Negligible";
    if (v <= 0.4) return "Low";
    if (v < 0.6) return "Moderate";
    if (v < 0.8) return "High";
    return "Critical";
  };

  const signalLabel = (v: number, negative: string, positive: string) => {
    if (Math.abs(v) < 0.15) return "Neutral";
    const strength = Math.abs(v) > 0.6 ? "Strongly " : "";
    return v < 0 ? `${strength}${negative}` : `${strength}${positive}`;
  };

  // === IDLE ===
  if (mode === "idle") {
    return (
      <div className="animate-in">
        <div
          ref={dropZoneRef}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onPaste={handlePaste}
          className={`relative rounded-2xl glass transition-all duration-300 ${
            dragging
              ? "border-violet-500/30 bg-violet-500/[0.03] glow-md"
              : ""
          }`}
        >
          <textarea
            placeholder="Paste a URL, drop an image, or write a hot take..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            rows={4}
            className="w-full p-5 pb-3 text-[15px] leading-relaxed bg-transparent border-none outline-none resize-none placeholder:text-zinc-700 text-white/85 rounded-2xl"
          />

          <div className="px-5 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Upload file
              </button>
              <span className="text-[10px] text-zinc-700">PDF or image</span>
            </div>

            <button
              onClick={handleSubmitInput}
              disabled={!inputText.trim()}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-violet-500/90 text-white hover:bg-violet-500 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
            >
              Analyze
            </button>
          </div>
        </div>

        <details className="mt-4">
          <summary className="text-xs text-zinc-600 cursor-pointer hover:text-zinc-400 transition-colors">
            Add notes for the AI to focus on
          </summary>
          <textarea
            placeholder="What do you believe about this? What points should the analysis focus on?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full mt-2 text-sm leading-relaxed glass rounded-lg p-3 outline-none resize-none placeholder:text-zinc-700 text-zinc-300"
          />
        </details>

        <p className="mt-5 text-[11px] text-zinc-700 text-center">
          Paste a URL and hit Analyze &middot; drag &amp; drop a PDF or
          screenshot &middot; or just type
        </p>
      </div>
    );
  }

  // === PROCESSING ===
  if (mode === "processing") {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center animate-in">
        <div className="inline-block w-6 h-6 border-2 border-zinc-800 border-t-violet-400 rounded-full spinner mb-4" />
        <p className="text-sm text-zinc-500">{processingStatus}</p>
      </div>
    );
  }

  // === REVIEW ===
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in">
      <button
        onClick={reset}
        className="text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
      >
        &larr; Start over
      </button>

      {/* Title */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-semibold bg-transparent border-none outline-none placeholder:text-zinc-700 text-white/90"
          placeholder="Title"
        />
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-600 hover:text-violet-400 transition-colors mt-1 inline-block truncate max-w-full"
          >
            {url}
          </a>
        )}
      </div>

      {/* Summary */}
      <div className="p-5 glass rounded-xl">
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-violet-400/60 mb-3">
          AI Summary
        </h3>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={6}
          className="w-full text-sm leading-relaxed bg-transparent border-none outline-none resize-none text-zinc-300"
        />
      </div>

      {/* Signals */}
      <div className="p-5 glass rounded-xl">
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-violet-400/60 mb-4">
          Detected Position Signals
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-zinc-500">{xAxisLabel}</span>
              <span className="font-medium text-white/80 text-xs">
                {signalLabel(xSignal, xAxisLow, xAxisHigh)}
              </span>
            </div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={xSignal}
              onChange={(e) => setXSignal(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-zinc-500">{yAxisLabel}</span>
              <span className="font-medium text-white/80 text-xs">
                {signalLabel(ySignal, yAxisLow, yAxisHigh)}
              </span>
            </div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={ySignal}
              onChange={(e) => setYSignal(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          {signalReasoning && (
            <p className="text-xs text-zinc-600 italic">{signalReasoning}</p>
          )}
        </div>
      </div>

      {/* Topics */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-2">
          Topics
        </label>
        <input
          type="text"
          placeholder="economics, AI, climate (comma separated)"
          value={topics}
          onChange={(e) => setTopics(e.target.value)}
          className="w-full text-sm bg-transparent border-b border-white/[0.06] outline-none pb-2 placeholder:text-zinc-700 text-zinc-300 focus:border-violet-500/30 transition-colors"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-2">
          Your notes (optional)
        </label>
        <textarea
          placeholder="What do you think about this?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full text-sm leading-relaxed glass rounded-lg p-3 outline-none resize-none placeholder:text-zinc-700 text-zinc-300"
        />
      </div>

      {/* Agreement */}
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Agreement
          </label>
          <span className="text-xs text-zinc-400">
            {agreementLabel(agreement)}
          </span>
        </div>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.05"
          value={agreement}
          onChange={(e) => setAgreement(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-zinc-700 mt-1">
          <span>Strongly disagree</span>
          <span>Strongly agree</span>
        </div>
      </div>

      {/* Weight */}
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Weight
          </label>
          <span className="text-xs text-zinc-400">{weightLabel(weight)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={weight}
          onChange={(e) => setWeight(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-zinc-700 mt-1">
          <span>Negligible</span>
          <span>Critical</span>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-4 border-t border-white/[0.04]">
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="px-5 py-2.5 text-sm font-medium rounded-lg bg-violet-500/90 text-white hover:bg-violet-500 disabled:opacity-30 transition-all duration-200 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
        >
          {saving ? "Saving..." : "Save to Library"}
        </button>
      </div>
    </div>
  );
}
