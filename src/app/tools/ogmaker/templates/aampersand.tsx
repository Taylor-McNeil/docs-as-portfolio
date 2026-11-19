/* eslint-disable @next/next/no-img-element -- html-to-image needs a plain <img> it can inline. */
import { HighlightedHeadline } from "../ui/highlighted-headline";
import {
  CheckboxField,
  ColorGrid,
  Divider,
  SectionHeading,
  TextAreaField,
  TextField,
  WatermarkControls,
  HIGHLIGHT_HINT,
  type CardColors,
  type WatermarkSettings,
} from "../ui/controls";
import { slugify, stripMarkers } from "../lib/text";
import { defineTemplate, type ControlsProps, type RenderProps } from "./types";

const LOGO_OPTIONS = [
  { key: "primary", label: "Primary", src: "/brand/svg/ampersand-full-primary.svg" },
  { key: "dark", label: "Dark", src: "/brand/svg/ampersand-full-dark.svg" },
  { key: "light", label: "Light", src: "/brand/svg/ampersand-full-light.svg" },
] as const;

type LogoKey = (typeof LOGO_OPTIONS)[number]["key"];

type AampersandSettings = WatermarkSettings & {
  isHighlightItalic: boolean;
  logo: LogoKey;
  colors: CardColors;
};

const COLORS: CardColors = {
  bg: "#FAFAF8",
  textDark: "#2B2E34",
  textLight: "#6A7179",
  accent: "#C9B458",
  bgAmpersand: "#F0EDE2",
};

const WATERMARK: WatermarkSettings = {
  showBackgroundWatermark: true,
  backgroundWatermarkChar: "&",
  ampersandSize: 950,
  ampersandX: 0,
  ampersandY: 0,
};

function Render({ text, settings }: RenderProps<AampersandSettings>) {
  const { colors } = settings;
  const logo = LOGO_OPTIONS.find((o) => o.key === settings.logo) ?? LOGO_OPTIONS[0];
  return (
    <>
      {settings.showBackgroundWatermark && (
        <div
          style={{
            position: "absolute",
            pointerEvents: "none",
            userSelect: "none",
            fontFamily: "'Fraunces', serif",
            fontWeight: 400,
            fontSize: `${settings.ampersandSize}px`,
            fontStyle: "normal",
            color: colors.bgAmpersand,
            lineHeight: 1,
            top: "50%",
            left: "50%",
            transform: `translate(calc(-50% + ${settings.ampersandX}px), calc(-50% + ${settings.ampersandY}px))`,
            zIndex: 0,
          }}
        >
          {settings.backgroundWatermarkChar}
        </div>
      )}

      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          paddingLeft: "96px",
          paddingRight: "96px",
          textAlign: "center",
        }}
      >
        {text.eyebrow && (
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "15px",
              letterSpacing: "0.22em",
              color: colors.textLight,
              textTransform: "uppercase",
              marginBottom: "32px",
              fontWeight: 500,
            }}
          >
            {text.eyebrow}
          </div>
        )}

        <div style={{ fontSize: "92px", color: colors.textDark, lineHeight: 1.1, marginBottom: "24px", whiteSpace: "pre-wrap" }}>
          <HighlightedHeadline headline={text.headline} accent={colors.accent} italic={settings.isHighlightItalic} />
        </div>

        {text.subtitle && (
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: "34px",
              color: colors.textLight,
              marginTop: "16px",
            }}
          >
            {text.subtitle}
          </div>
        )}
      </div>

      <div style={{ position: "absolute", bottom: "48px", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
        <img src={logo.src} alt="aampersand logo" width={168} height={28} style={{ width: "168px", height: "28px", objectFit: "contain" }} />
      </div>
    </>
  );
}

function Controls({ text, setText, settings, defaults, update }: ControlsProps<AampersandSettings>) {
  return (
    <>
      <div className="space-y-4">
        <SectionHeading icon="type">Content</SectionHeading>
        <TextField label="Eyebrow Text" value={text.eyebrow} onChange={(eyebrow) => setText({ eyebrow })} />
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2">
          <TextAreaField label="Main Headline" value={text.headline} onChange={(headline) => setText({ headline })} hint={HIGHLIGHT_HINT} />
          <CheckboxField label="Italicize the highlight" checked={settings.isHighlightItalic} onChange={(v) => update({ isHighlightItalic: v })} />
        </div>
        <TextField label="Subtitle (Italic)" value={text.subtitle} onChange={(subtitle) => setText({ subtitle })} />
      </div>
      <Divider />
      <ColorGrid colors={settings.colors} showWatermark={settings.showBackgroundWatermark} onChange={(colors) => update({ colors })} />
      <Divider />
      <WatermarkControls settings={settings} defaults={defaults} update={update} />
      <Divider />
      <div>
        <span className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Footer Logo</span>
        <div className="grid grid-cols-3 gap-2">
          {LOGO_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => update({ logo: option.key })}
              className={`flex flex-col items-center gap-2 rounded-md border px-2 py-2 transition-colors ${settings.logo === option.key ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              title={option.label}
            >
              <img src={option.src} alt="" width={84} height={14} className="h-3.5 w-auto object-contain" aria-hidden="true" />
              <span className="text-xs font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

const shared = {
  site: "aampersand" as const,
  background: (s: AampersandSettings) => s.colors.bg,
  baseFont: "'Playfair Display', serif",
  Controls,
  Render,
};

export const aampersandHomepage = defineTemplate<AampersandSettings>({
  ...shared,
  id: "aampersand-homepage",
  label: '"Run Wild"',
  sampleText: {
    eyebrow: "YOUR STORY DOESN'T NEED PERMISSION.",
    headline: "Run *wild.*",
    subtitle: "See your story. Finally.",
  },
  defaults: { ...WATERMARK, isHighlightItalic: true, logo: "primary", colors: COLORS },
  fileName: (text) => `og-aampersand-${slugify(stripMarkers(text.headline)) || "home"}`,
});

/** The original devlog card, kept as it was. */
export const aampersandDevlogClassic = defineTemplate<AampersandSettings>({
  ...shared,
  id: "aampersand-devlog",
  label: "Devlog (classic)",
  sampleText: {
    eyebrow: "DEVLOG #1 · JANUARY 2026",
    headline: "What if Icarus Had *Sunscreen?*",
    subtitle: "Perhaps starting with the second book was not a good idea",
  },
  defaults: { ...WATERMARK, isHighlightItalic: false, logo: "primary", colors: COLORS },
  fileName: (text) => `og-devlog-${slugify(stripMarkers(text.headline)) || "classic"}`,
});
