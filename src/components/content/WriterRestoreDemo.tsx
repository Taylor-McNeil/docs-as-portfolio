"use client";

import { FileText, LoaderCircle, RotateCcw, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

const fullText = [
  "Azim stopped at the threshold and counted the torches before stepping into the hall.",
  "He already knew the room was wrong; the silence had reached him before the light did.",
  "By the time Mira spoke, he had decided this was the moment the story split in two.",
].join("\n\n");

type Phase = "drafting" | "restoring" | "restored";

export function WriterRestoreDemo() {
  const [phase, setPhase] = useState<Phase>("drafting");
  const [charCount, setCharCount] = useState(0);

  const resetDemo = () => {
    setPhase("drafting");
    setCharCount(0);
  };

  useEffect(() => {
    if (phase !== "drafting") return;

    if (charCount >= fullText.length) {
      const holdTimer = window.setTimeout(() => {
        setPhase("restoring");
      }, 900);

      return () => window.clearTimeout(holdTimer);
    }

    const typingTimer = window.setTimeout(() => {
      setCharCount((current) => Math.min(current + 4, fullText.length));
    }, 28);

    return () => window.clearTimeout(typingTimer);
  }, [charCount, phase]);

  useEffect(() => {
    if (phase !== "restoring") return;

    const restoreTimer = window.setTimeout(() => {
      setPhase("restored");
      setCharCount(fullText.length);
    }, 2200);

    return () => window.clearTimeout(restoreTimer);
  }, [phase]);

  const visibleText = fullText.slice(0, charCount);
  const visibleParagraphs = visibleText.length > 0 ? visibleText.split("\n\n") : [""];
  const showCaret = phase !== "restoring";
  const phaseLabel =
    phase === "restoring" ? "Rebuilding" : phase === "restored" ? "Restored" : "Drafting";
  const statusLabel =
    phase === "restoring" ? "Reconnecting" : phase === "restored" ? "Restored" : "Draft ready";
  // Colours switch on the theme class in CSS ([.dark_&]), not in JS, so the server
  // render matches the browser's before the theme is known.
  const shellClass =
    "bg-[#fff8ee] shadow-[0_18px_50px_-30px_rgba(15,23,42,0.14)] [.dark_&]:bg-[#132036] [.dark_&]:shadow-[0_18px_50px_-30px_rgba(15,23,42,0.45)]";
  const headerClass = "bg-[#fff4df] [.dark_&]:bg-[#18243a]";
  const editorBodyClass = "bg-[#fffdf7] [.dark_&]:bg-[#132036]";
  const overlayVeilClass = "bg-[rgba(255,248,231,0.58)] [.dark_&]:bg-[rgba(19,32,54,0.46)]";
  const overlayCardClass =
    "bg-[#fffdf8] shadow-[0_24px_60px_-28px_rgba(15,23,42,0.18)] [.dark_&]:bg-[#142138] [.dark_&]:shadow-[0_24px_60px_-28px_rgba(15,23,42,0.52)]";
  const overlayIconClass = "bg-[#fff4df] [.dark_&]:bg-[#1a2740]";

  return (
    <div className={`mt-[30px] border border-border-card ${shellClass}`}>
      <div className={`flex items-center justify-between gap-3 border-b border-border-card px-4 py-2.5 ${headerClass}`}>
        <div className="flex min-w-0 items-center gap-2">
          <FileText size={14} className="shrink-0 text-foreground-muted" />
          <span className="truncate font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-muted">
            What The Writer Sees
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-foreground-muted">
            <WifiOff size={13} className={phase === "restoring" ? "text-accent" : ""} />
            <span>{statusLabel}</span>
          </div>
          {phase === "restored" ? (
            <button
              type="button"
              onClick={resetDemo}
              className="inline-flex items-center gap-1 border border-border-card px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-muted transition-colors hover:bg-surface-card hover:text-foreground"
              aria-label="Reset writer restore demo"
            >
              <RotateCcw size={11} />
              Reset
            </button>
          ) : null}
        </div>
      </div>

      <div className={`relative min-h-[320px] overflow-hidden ${editorBodyClass}`}>
        <div className="relative px-6 py-6 sm:px-8">
          <div className="mb-5 flex items-center justify-between gap-3 whitespace-nowrap border-b border-border-card/60 pb-3 font-mono text-[8px] uppercase tracking-[0.12em] text-foreground-muted/70">
            <span>Chapter 12</span>
            <span>Scene 3</span>
            <span>{phaseLabel}</span>
          </div>

          <div className="space-y-6 font-serif text-[17px] leading-8 text-foreground">
            {visibleParagraphs.map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 12)}`} className="m-0 min-h-[2rem]">
                <span className="mr-4 inline-block w-6 select-none text-right font-mono text-[11px] text-foreground-muted/55">
                  {index + 1}
                </span>
                <span>{paragraph}</span>
                {showCaret && index === visibleParagraphs.length - 1 ? (
                  <span className="ml-1 inline-block h-[1.1em] w-[0.6ch] animate-pulse bg-accent align-[-0.12em]" />
                ) : null}
              </p>
            ))}
          </div>
        </div>

        {phase === "restoring" ? (
          <div className={`absolute inset-0 flex items-center justify-center backdrop-blur-[1.5px] ${overlayVeilClass}`}>
            <div className={`mx-4 w-full max-w-sm border border-border p-5 ${overlayCardClass}`}>
              <div className="mb-4 flex items-start gap-3">
                <div className={`mt-0.5 rounded-full border border-border-card p-2 ${overlayIconClass}`}>
                  <LoaderCircle size={18} className="animate-spin text-accent" />
                </div>
                <div>
                  <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-muted">
                    Restoring
                  </div>
                  <h4 className="mt-1 text-base font-semibold text-foreground">
                    Restoring your offline work
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-foreground-muted">
                    1 chapter · 2 scenes · 3 saves
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-2.5 overflow-hidden bg-surface-sidebar">
                  <div className="writer-restore-progress h-full w-[62%] bg-accent" />
                </div>
                <p className="text-xs leading-5 text-foreground-muted">
                  Hold the screen until the sync is complete.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
