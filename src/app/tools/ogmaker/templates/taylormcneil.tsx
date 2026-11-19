import { HighlightedHeadline } from "../ui/highlighted-headline";
import {
  CheckboxField,
  ColorGrid,
  Divider,
  SectionHeading,
  SelectField,
  TextAreaField,
  TextField,
  WatermarkControls,
  HIGHLIGHT_HINT,
  type CardColors,
  type WatermarkSettings,
} from "../ui/controls";
import { slugify, stripMarkers } from "../lib/text";
import { defineTemplate, type ControlsProps, type RenderProps } from "./types";

const HTTP_METHODS = ["GET", "PUT", "POST", "PATCH", "HEAD", "DELETE"] as const;
type HttpMethod = (typeof HTTP_METHODS)[number] | "";

const METHOD_COLORS: Record<string, { bg: string; text: string }> = {
  GET: { bg: "#1B3A4B", text: "#4ECDC4" },
  PUT: { bg: "#3A2E1B", text: "#E5A84B" },
  POST: { bg: "#1B3A2E", text: "#4ECD7D" },
  PATCH: { bg: "#3A1B2E", text: "#CD4E8F" },
  HEAD: { bg: "#2E1B3A", text: "#8F4ECD" },
  DELETE: { bg: "#3A1B1B", text: "#CD4E4E" },
};

const METHOD_COLORS_LIGHT: Record<string, { bg: string; text: string }> = {
  GET: { bg: "#E0F5F2", text: "#1B7A6E" },
  PUT: { bg: "#FFF0DB", text: "#9E6B1B" },
  POST: { bg: "#E0F5E8", text: "#1B7A3E" },
  PATCH: { bg: "#F5E0EE", text: "#7A1B5E" },
  HEAD: { bg: "#EAE0F5", text: "#5E1B7A" },
  DELETE: { bg: "#F5E0E0", text: "#7A1B1B" },
};

type TaylorSettings = WatermarkSettings & {
  dark: boolean;
  httpMethod: HttpMethod;
  routePath: string;
  footerText: string;
  isHighlightItalic: boolean;
  colors: CardColors;
};

function Render({ text, settings }: RenderProps<TaylorSettings>) {
  const { colors } = settings;
  const mc = settings.httpMethod ? (settings.dark ? METHOD_COLORS : METHOD_COLORS_LIGHT)[settings.httpMethod] : null;

  return (
    <>
      {settings.showBackgroundWatermark && (
        <div
          style={{
            position: "absolute",
            pointerEvents: "none",
            userSelect: "none",
            fontFamily: "'JetBrains Mono', 'Inter', monospace",
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
        {settings.httpMethod && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "14px",
                fontWeight: 700,
                textTransform: "uppercase",
                color: mc?.text || colors.textDark,
                backgroundColor: mc?.bg || colors.bgAmpersand,
                padding: "6px 12px",
                borderRadius: "6px",
                letterSpacing: "0.05em",
              }}
            >
              {settings.httpMethod}
            </span>
            {settings.routePath && (
              <span style={{ fontFamily: "'JetBrains Mono', 'Inter', monospace", fontSize: "16px", color: colors.textLight }}>
                {settings.routePath}
              </span>
            )}
          </div>
        )}

        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: "92px",
            color: colors.textDark,
            lineHeight: 1.1,
            marginBottom: "24px",
            whiteSpace: "pre-wrap",
          }}
        >
          <HighlightedHeadline headline={text.headline} accent={colors.accent} italic={settings.isHighlightItalic} />
        </div>

        {text.subtitle && (
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontStyle: "italic",
              fontSize: "30px",
              color: colors.textLight,
              marginTop: "16px",
              fontWeight: 400,
            }}
          >
            {text.subtitle}
          </div>
        )}
      </div>

      {settings.footerText && (
        <div
          style={{
            position: "absolute",
            bottom: "48px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "18px",
            color: colors.textLight,
            fontWeight: 400,
            zIndex: 10,
          }}
        >
          {settings.footerText}
        </div>
      )}
    </>
  );
}

function Controls({ text, setText, settings, defaults, update }: ControlsProps<TaylorSettings>) {
  return (
    <>
      <div className="space-y-4">
        <SectionHeading icon="type">Content</SectionHeading>
        <SelectField
          label="HTTP Method"
          value={settings.httpMethod}
          options={[{ value: "" as HttpMethod, label: "None" }, ...HTTP_METHODS.map((m) => ({ value: m as HttpMethod, label: m }))]}
          onChange={(httpMethod) => update({ httpMethod })}
        />
        <TextField label="Route Path" value={settings.routePath} onChange={(routePath) => update({ routePath })} placeholder="/api/v1/users" mono />
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
      <TextField label="Footer Text" value={settings.footerText} onChange={(footerText) => update({ footerText })} />
    </>
  );
}

const WATERMARK: WatermarkSettings = {
  showBackgroundWatermark: false,
  backgroundWatermarkChar: "{ }",
  ampersandSize: 800,
  ampersandX: 0,
  ampersandY: 0,
};

const fileName = (text: { headline: string }) => `og-taylormcneil-${slugify(stripMarkers(text.headline)) || "page"}`;

export const taylorDocsDark = defineTemplate<TaylorSettings>({
  id: "taylormcneil-docs-dark",
  site: "taylormcneil",
  label: "Docs Dark",
  sampleText: { eyebrow: "", headline: "A Broken *Astrolabe*", subtitle: "This is the design companion to Stranded in Crete" },
  defaults: {
    ...WATERMARK,
    dark: true,
    httpMethod: "PUT",
    routePath: "/aampersand/a-broken-astrolabe",
    footerText: "Taylor McNeil · docs-as-portfolio v1.10",
    isHighlightItalic: false,
    colors: { bg: "#0F1419", textDark: "#E8ECF1", textLight: "#8B95A3", accent: "#4A9EE5", bgAmpersand: "#1A2030" },
  },
  background: (s) => s.colors.bg,
  baseFont: "'Inter', sans-serif",
  fileName,
  Controls,
  Render,
});

export const taylorDevlogLight = defineTemplate<TaylorSettings>({
  id: "taylormcneil-devlog-light",
  site: "taylormcneil",
  label: "Devlog Light",
  sampleText: { eyebrow: "", headline: "Dust on the *Glass*", subtitle: "Somewhere around day 15, my left navbar changed color." },
  defaults: {
    ...WATERMARK,
    dark: false,
    httpMethod: "PUT",
    routePath: "/aampersand/march-2026",
    footerText: "Taylor McNeil · docs-as-portfolio v1.10",
    isHighlightItalic: false,
    colors: { bg: "#FDF8F0", textDark: "#2C2C2C", textLight: "#6B6B6B", accent: "#D4882A", bgAmpersand: "#F0EBE3" },
  },
  background: (s) => s.colors.bg,
  baseFont: "'Inter', sans-serif",
  fileName,
  Controls,
  Render,
});
