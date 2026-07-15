"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────
interface OriginalStyles {
  [key: string]: string;
}

interface FallingElement {
  id: number;
  char: string;
  left: number;
  duration: number;
  size: number;
}

interface MySpaceCustomizerProps {
  scope?: "page" | "container";
}

interface BackgroundPreset {
  label: string;
  value: string;
  text: string;
  heading: string;
}

// ─── Presets ─────────────────────────────────────────────────────
const BG_PRESETS: BackgroundPreset[] = [
  { label: "Hot Pink", value: "#FF69B4", text: "#000000", heading: "#2b0014" },
  { label: "Lime", value: "#32CD32", text: "#000000", heading: "#003300" },
  { label: "Void", value: "#000000", text: "#00ff00", heading: "#00ff00" },
  { label: "Ocean", value: "#000080", text: "#ffffff", heading: "#87CEEB" },
  { label: "Peach", value: "#FFDAB9", text: "#333333", heading: "#8B4513" },
];

const CONTAINER_BG_PRESETS: BackgroundPreset[] = [
  { label: "Midnight", value: "#111827", text: "#f9fafb", heading: "#ffffff" },
  { label: "Aubergine", value: "#2e1065", text: "#f5f3ff", heading: "#ffffff" },
  { label: "Deep Sea", value: "#083344", text: "#ecfeff", heading: "#ffffff" },
  { label: "Pine", value: "#052e16", text: "#f0fdf4", heading: "#ffffff" },
  { label: "Ember", value: "#431407", text: "#fff7ed", heading: "#ffffff" },
];

const ACCENT_PRESETS = [
  { label: "🔥", value: "#ff4500" },
  { label: "💜", value: "#8A2BE2" },
  { label: "💚", value: "#00ff88" },
  { label: "💛", value: "#FFD700" },
  { label: "🩵", value: "#00CED1" },
];

const FONT_PRESETS = [
  { label: "Comic Sans", value: '"Comic Sans MS", "Comic Sans", cursive' },
  { label: "Papyrus", value: '"Papyrus", fantasy' },
  { label: "Times", value: '"Times New Roman", "Times", serif' },
  { label: "Courier", value: '"Courier New", "Courier", monospace' },
  { label: "Impact", value: '"Impact", "Haettenschweiler", sans-serif' },
];

const FALLING_TYPES = [
  { label: "✦ Stars", chars: ["✦", "★", "☆", "✧", "⋆"] },
  { label: "♥ Hearts", chars: ["♥", "♡", "❤", "💕", "💖"] },
  { label: "✿ Flowers", chars: ["✿", "❀", "🌸", "🌺", "💮"] },
  { label: "❄ Snow", chars: ["❄", "❅", "❆", "✻", "•"] },
];

const CSS_VARS = [
  "--color-surface-bg",
  "--color-foreground",
  "--color-foreground-heading",
  "--color-accent",
  "--color-border",
  "--font-sans",
] as const;

// ─── Keyframes ───────────────────────────────────────────────────
const KEYFRAMES = `
@keyframes myspace-fall {
  0% { transform: translateY(-5vh) rotate(0deg); opacity: 1; }
  70% { opacity: 1; }
  100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
}
@keyframes myspace-shimmer {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
@keyframes myspace-sparkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.3); }
}
@media (prefers-reduced-motion: reduce) {
  .myspace-customizer * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

// ─── Component ───────────────────────────────────────────────────
export function MySpaceCustomizer({ scope = "page" }: MySpaceCustomizerProps) {
  const [skin, setSkin] = useState<"maximalist" | "minimal">("maximalist");
  const containerRef = useRef<HTMLDivElement>(null);
  const originals = useRef<OriginalStyles | null>(null);
  const [activeFont, setActiveFont] = useState<string | null>(null);
  const [activeBg, setActiveBg] = useState<string | null>(null);
  const [activeAccent, setActiveAccent] = useState<string | null>(null);
  const [fallingType, setFallingType] = useState<number | null>(null);
  const [fallingElements, setFallingElements] = useState<FallingElement[]>([]);
  const [isModified, setIsModified] = useState(false);
  const fallingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const idCounter = useRef(0);
  const styleTag = useRef<HTMLStyleElement | null>(null);
  const backgroundPresets = scope === "container" ? CONTAINER_BG_PRESETS : BG_PRESETS;
  const accentVariable = scope === "container" ? "--color-border" : "--color-accent";

  const getStyleTarget = useCallback(
    () => (scope === "container" ? containerRef.current : document.documentElement),
    [scope]
  );

  // Capture originals on mount
  useEffect(() => {
    const root = getStyleTarget();
    if (!root) return;
    const computed = getComputedStyle(root);
    const orig: OriginalStyles = {};
    CSS_VARS.forEach((v) => {
      orig[v] = computed.getPropertyValue(v).trim();
    });
    originals.current = orig;

    const style = document.createElement("style");
    style.textContent = KEYFRAMES;
    document.head.appendChild(style);
    styleTag.current = style;

    return () => {
      if (styleTag.current) document.head.removeChild(styleTag.current);
      if (fallingInterval.current) clearInterval(fallingInterval.current);
      // Remove inline overrides so inherited theme values take over again.
      CSS_VARS.forEach((v) => {
        root.style.removeProperty(v);
      });
    };
  }, [getStyleTarget]);

  const setVar = useCallback((prop: string, value: string) => {
    getStyleTarget()?.style.setProperty(prop, value);
    setIsModified(true);
  }, [getStyleTarget]);

  const applyBg = useCallback(
    (preset: BackgroundPreset) => {
      if (activeBg === preset.value) {
        if (originals.current) {
          setVar("--color-surface-bg", originals.current["--color-surface-bg"]);
          setVar("--color-foreground", originals.current["--color-foreground"]);
          setVar("--color-foreground-heading", originals.current["--color-foreground-heading"]);
        }
        setActiveBg(null);
      } else {
        setVar("--color-surface-bg", preset.value);
        setVar("--color-foreground", preset.text);
        setVar("--color-foreground-heading", preset.heading);
        setActiveBg(preset.value);
      }
    },
    [activeBg, setVar]
  );

  const applyAccent = useCallback(
    (preset: (typeof ACCENT_PRESETS)[number]) => {
      if (activeAccent === preset.value) {
        if (originals.current) setVar(accentVariable, originals.current[accentVariable]);
        setActiveAccent(null);
      } else {
        setVar(accentVariable, preset.value);
        setActiveAccent(preset.value);
      }
    },
    [accentVariable, activeAccent, setVar]
  );

  const applyFont = useCallback(
    (preset: (typeof FONT_PRESETS)[number]) => {
      if (activeFont === preset.value) {
        if (originals.current) setVar("--font-sans", originals.current["--font-sans"]);
        setActiveFont(null);
      } else {
        setVar("--font-sans", preset.value);
        setActiveFont(preset.value);
      }
    },
    [activeFont, setVar]
  );

  const startFalling = useCallback(
    (index: number) => {
      if (fallingType === index) {
        if (fallingInterval.current) clearInterval(fallingInterval.current);
        fallingInterval.current = null;
        setFallingElements([]);
        setFallingType(null);
        return;
      }
      if (fallingInterval.current) clearInterval(fallingInterval.current);
      setFallingElements([]);
      setFallingType(index);
      setIsModified(true);
      const chars = FALLING_TYPES[index].chars;
      fallingInterval.current = setInterval(() => {
        const el: FallingElement = {
          id: idCounter.current++,
          char: chars[Math.floor(Math.random() * chars.length)],
          left: Math.random() * 100,
          duration: 3 + Math.random() * 4,
          size: 12 + Math.random() * 18,
        };
        setFallingElements((prev) => {
          const filtered = prev.length > 40 ? prev.slice(-30) : prev;
          return [...filtered, el];
        });
      }, 200);
    },
    [fallingType]
  );

  const chaos = useCallback(() => {
    const bg = backgroundPresets[Math.floor(Math.random() * backgroundPresets.length)];
    const accent = ACCENT_PRESETS[Math.floor(Math.random() * ACCENT_PRESETS.length)];
    const font = FONT_PRESETS[Math.floor(Math.random() * FONT_PRESETS.length)];
    const fall = Math.floor(Math.random() * FALLING_TYPES.length);
    setVar("--color-surface-bg", bg.value);
    setVar("--color-foreground", bg.text);
    setVar("--color-foreground-heading", bg.heading);
    setVar(accentVariable, accent.value);
    setVar("--font-sans", font.value);
    setActiveBg(bg.value);
    setActiveAccent(accent.value);
    setActiveFont(font.value);
    startFalling(fall);
  }, [accentVariable, backgroundPresets, setVar, startFalling]);

  const reset = useCallback(() => {
    if (!originals.current) return;
    const target = getStyleTarget();
    CSS_VARS.forEach((v) => {
      target?.style.removeProperty(v);
    });
    if (fallingInterval.current) clearInterval(fallingInterval.current);
    fallingInterval.current = null;
    setFallingElements([]);
    setActiveBg(null);
    setActiveAccent(null);
    setActiveFont(null);
    setFallingType(null);
    setIsModified(false);
  }, [getStyleTarget]);

  return (
    <div
      ref={containerRef}
      className={
        scope === "container"
          ? "myspace-customizer relative isolate overflow-hidden rounded-lg font-sans text-foreground"
          : "myspace-customizer"
      }
    >
      {/* Falling elements fill either the page or the contained preview. */}
      {fallingElements.length > 0 && (
        <div
          style={{
            position: scope === "container" ? "absolute" : "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 9999,
            overflow: "hidden",
          }}
        >
          {fallingElements.map((el) => (
            <span
              key={el.id}
              style={{
                position: "absolute",
                left: `${el.left}%`,
                top: -20,
                fontSize: el.size,
                animation: `myspace-fall ${el.duration}s linear forwards`,
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              {el.char}
            </span>
          ))}
        </div>
      )}

      {/* ═══ MAXIMALIST SKIN ═══ */}
      {skin === "maximalist" && (
        <div
          style={{
            margin: "2rem 0",
            background: scope === "container" && activeBg ? activeBg : "#000000",
            borderWidth: 2,
            borderStyle: "solid",
            borderColor:
              scope === "container" && activeAccent
                ? activeAccent
                : "transparent",
            borderImageSource:
              scope === "container" && activeAccent
                ? "none"
                : "linear-gradient(135deg, #ff00ff, #00ffff, #ff00ff, #ffff00, #ff00ff)",
            borderImageSlice: 1,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Sparkle corners */}
          <span style={{ position: "absolute", top: 4, left: 8, fontSize: 10, opacity: 0.6, animation: "myspace-sparkle 2s ease-in-out infinite" }}>✦</span>
          <span style={{ position: "absolute", top: 4, right: 8, fontSize: 10, opacity: 0.6, animation: "myspace-sparkle 2s ease-in-out infinite 0.5s" }}>✦</span>

          {/* Header */}
          <div
            style={{
              background: "linear-gradient(90deg, #1a0025, #0d001a, #1a0025)",
              padding: "8px 14px",
              borderBottom: "1px solid #ff00ff44",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: "bold",
                letterSpacing: "0.08em",
                background:
                  "linear-gradient(90deg, #ff00ff, #00ffff, #ffff00, #ff00ff)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "myspace-shimmer 3s linear infinite",
              }}
            >
              ☆ CuStOmIzE tHiS pAgE ☆
            </span>
            <span
              style={{
                fontSize: 9,
                color: "#ff00ff88",
                fontFamily: "monospace",
              }}
            >
              ♫ now playing: CSS variables ♫
            </span>
          </div>

          {/* Body */}
          <div
            style={{
              padding: "14px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              background:
                scope === "container" && activeBg
                  ? activeBg
                  : "repeating-linear-gradient(0deg, #0a0a0a 0px, #0a0a0a 2px, #0d0d0d 2px, #0d0d0d 4px)",
            }}
          >
            {/* Background */}
            <div>
              <div style={{ fontSize: 10, fontWeight: "bold", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8, color: "#ff69b4", textShadow: "0 0 8px #ff69b466" }}>
                ·˚✧ background ✧˚·
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {backgroundPresets.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => applyBg(p)}
                    title={p.label}
                    style={{
                      width: 36, height: 36, background: p.value,
                      cursor: "pointer", borderRadius: "50%",
                      border: activeBg === p.value ? "2px solid #fff" : "1px solid #333",
                      boxShadow: activeBg === p.value ? `0 0 12px ${p.value}, inset 0 0 6px rgba(255,255,255,0.3)` : "none",
                      transition: "all 0.2s ease",
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ textAlign: "center", fontSize: 8, letterSpacing: 6, color: "#ffffff33", userSelect: "none" }}>·:*¨¨*:·.·:*¨¨*:·.·:*¨¨*:·.</div>

            {/* Accent */}
            <div>
              <div style={{ fontSize: 10, fontWeight: "bold", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8, color: "#00ffff", textShadow: "0 0 8px #00ffff66" }}>
                ·˚✧ {scope === "container" ? "accent color" : "link color"} ✧˚·
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {ACCENT_PRESETS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => applyAccent(p)}
                    style={{
                      width: 36, height: 36, background: p.value,
                      cursor: "pointer", borderRadius: "50%",
                      border: activeAccent === p.value ? "2px solid #fff" : "1px solid #333",
                      boxShadow: activeAccent === p.value ? `0 0 12px ${p.value}` : "none",
                      fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ textAlign: "center", fontSize: 8, letterSpacing: 6, color: "#ffffff33", userSelect: "none" }}>·:*¨¨*:·.·:*¨¨*:·.·:*¨¨*:·.</div>

            {/* Font */}
            <div>
              <div style={{ fontSize: 10, fontWeight: "bold", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8, color: "#ffff00", textShadow: "0 0 8px #ffff0066" }}>
                ·˚✧ font ✧˚·
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {FONT_PRESETS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => applyFont(p)}
                    style={{
                      padding: "4px 10px", fontSize: 11, fontFamily: p.value,
                      cursor: "pointer", borderRadius: 20,
                      background: activeFont === p.value ? "#ff00ff" : "transparent",
                      color: activeFont === p.value ? "#000" : "#ccc",
                      border: `1px solid ${activeFont === p.value ? "#ff00ff" : "#444"}`,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ textAlign: "center", fontSize: 8, letterSpacing: 6, color: "#ffffff33", userSelect: "none" }}>·:*¨¨*:·.·:*¨¨*:·.·:*¨¨*:·.</div>

            {/* Falling */}
            <div>
              <div style={{ fontSize: 10, fontWeight: "bold", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8, color: "#00ff88", textShadow: "0 0 8px #00ff8866" }}>
                ·˚✧ falling things ✧˚·
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {FALLING_TYPES.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => startFalling(i)}
                    style={{
                      padding: "4px 10px", fontSize: 11, cursor: "pointer",
                      borderRadius: 20,
                      background: fallingType === i ? "#00ffff" : "transparent",
                      color: fallingType === i ? "#000" : "#ccc",
                      border: `1px solid ${fallingType === i ? "#00ffff" : "#444"}`,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap", alignItems: "center" }}>
              <button
                onClick={chaos}
                style={{
                  padding: "6px 16px", fontSize: 11, fontWeight: "bold",
                  cursor: "pointer", borderRadius: 20, border: "none",
                  background: "linear-gradient(135deg, #ff00ff, #ff4500, #ffff00)",
                  color: "#000", textTransform: "uppercase", letterSpacing: "0.1em",
                  boxShadow: "0 0 15px rgba(255,0,255,0.4)",
                }}
              >
                🎲 chaos mode
              </button>
              <button
                onClick={reset}
                disabled={!isModified}
                style={{
                  padding: "6px 16px", fontSize: 11, borderRadius: 20,
                  cursor: isModified ? "pointer" : "default",
                  background: "transparent",
                  color: isModified ? "#888" : "#333",
                  border: `1px solid ${isModified ? "#555" : "#222"}`,
                }}
              >
                ↩ reset
              </button>
              <button
                onClick={() => setSkin("minimal")}
                style={{
                  marginLeft: "auto", padding: "4px 10px",
                  fontSize: 9, cursor: "pointer", borderRadius: 20,
                  background: "transparent", color: "#ffffff44",
                  border: "1px solid #ffffff22",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff88")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#ffffff44")}
              >
                too much? →
              </button>
            </div>

            <div style={{ fontSize: 8, color: "#ffffff44", textAlign: "center", marginTop: 2, letterSpacing: "0.05em" }}>
              every element in this {scope === "container" ? "preview" : "page"} is listening to the same CSS variables ♥
            </div>
          </div>
        </div>
      )}

      {/* ═══ MINIMAL SKIN ═══ */}
      {skin === "minimal" && (
        <div
          style={{
            margin: "2rem 0",
            background: scope === "container" && activeBg ? activeBg : "#18181b",
            border: `1px solid ${
              scope === "container" && activeAccent ? activeAccent : "#27272a"
            }`,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "10px 16px",
              borderBottom: "1px solid #27272a",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>🎨</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#e4e4e7", letterSpacing: "-0.01em" }}>
                Customize This Page
              </span>
            </div>
            <span
              style={{
                fontSize: 10, color: "#71717a", fontFamily: "monospace",
                padding: "2px 8px", background: "#27272a", borderRadius: 10,
              }}
            >
              CSS variables
            </span>
          </div>

          {/* Body */}
          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Background */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#a1a1aa", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Background</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {backgroundPresets.map((p, i) => (
                  <button key={i} onClick={() => applyBg(p)} title={p.label} style={{
                    width: 36, height: 36, background: p.value, cursor: "pointer", borderRadius: 8,
                    border: `2px solid ${activeBg === p.value ? "#fff" : "#333"}`,
                    transition: "all 0.15s ease",
                    transform: activeBg === p.value ? "scale(1.1)" : "scale(1)",
                  }} />
                ))}
              </div>
            </div>

            {/* Accent */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#a1a1aa", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Accent</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {ACCENT_PRESETS.map((p, i) => (
                  <button key={i} onClick={() => applyAccent(p)} style={{
                    width: 36, height: 36, background: p.value, cursor: "pointer", borderRadius: 8,
                    border: `2px solid ${activeAccent === p.value ? "#fff" : "#333"}`,
                    fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s ease",
                    transform: activeAccent === p.value ? "scale(1.1)" : "scale(1)",
                  }}>{p.label}</button>
                ))}
              </div>
            </div>

            {/* Font */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#a1a1aa", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Typography</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {FONT_PRESETS.map((p, i) => (
                  <button key={i} onClick={() => applyFont(p)} style={{
                    padding: "5px 12px", fontSize: 12, fontFamily: p.value, cursor: "pointer",
                    background: activeFont === p.value ? "#fff" : "#27272a",
                    color: activeFont === p.value ? "#000" : "#a1a1aa",
                    border: `1px solid ${activeFont === p.value ? "#fff" : "#3f3f46"}`,
                    borderRadius: 6, transition: "all 0.15s ease",
                  }}>{p.label}</button>
                ))}
              </div>
            </div>

            {/* Falling */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#a1a1aa", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Flair</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {FALLING_TYPES.map((t, i) => (
                  <button key={i} onClick={() => startFalling(i)} style={{
                    padding: "5px 12px", fontSize: 12, cursor: "pointer",
                    background: fallingType === i ? "#fff" : "#27272a",
                    color: fallingType === i ? "#000" : "#a1a1aa",
                    border: `1px solid ${fallingType === i ? "#fff" : "#3f3f46"}`,
                    borderRadius: 6, transition: "all 0.15s ease",
                  }}>{t.label}</button>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: "#27272a" }} />

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <button
                onClick={chaos}
                style={{
                  padding: "6px 16px", fontSize: 12, fontWeight: 600,
                  cursor: "pointer", borderRadius: 8, border: "none",
                  background: "linear-gradient(135deg, #ec4899, #8b5cf6, #06b6d4)",
                  color: "#fff",
                }}
              >
                🎲 Chaos
              </button>
              <button
                onClick={reset}
                disabled={!isModified}
                style={{
                  padding: "6px 16px", fontSize: 12, borderRadius: 8,
                  cursor: isModified ? "pointer" : "default",
                  background: "transparent",
                  color: isModified ? "#a1a1aa" : "#3f3f46",
                  border: `1px solid ${isModified ? "#3f3f46" : "#27272a"}`,
                }}
              >
                ↩ Reset
              </button>
              <button
                onClick={() => setSkin("maximalist")}
                style={{
                  marginLeft: "auto", padding: "4px 10px",
                  fontSize: 10, cursor: "pointer", borderRadius: 6,
                  background: "transparent", color: "#52525b",
                  border: "1px solid #27272a",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#a1a1aa")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#52525b")}
              >
                ☆ bring the chaos
              </button>
              <span style={{ fontSize: 10, color: "#52525b" }}>CSS variables ♥</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
