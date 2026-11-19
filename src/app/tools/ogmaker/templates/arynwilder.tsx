import type { CSSProperties } from "react";
import { ColorGrid, Divider, SectionHeading, SelectField, TextAreaField, TextField, type CardColors } from "../ui/controls";
import { slugify, splitStacked } from "../lib/text";
import { defineTemplate, type ControlsProps, type RenderProps } from "./types";

type Part1Style = "italic" | "normal";
type Part2Style = "bold-caps" | "normal" | "italic";

type ArynSettings = {
  headlinePart1Style: Part1Style;
  headlinePart2Style: Part2Style;
  footerText: string;
  colors: CardColors;
};

function part1Style(style: Part1Style, colors: CardColors): CSSProperties {
  return style === "italic"
    ? { fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 400, color: colors.accent, fontSize: "75px" }
    : { fontFamily: "'Playfair Display', serif", fontStyle: "normal", fontWeight: 400, color: colors.textDark, fontSize: "75px" };
}

function part2Style(style: Part2Style, colors: CardColors): CSSProperties {
  switch (style) {
    case "bold-caps":
      return { fontFamily: "'Playfair Display', serif", fontStyle: "normal", fontWeight: 900, color: colors.textDark, fontSize: "100px", textTransform: "uppercase", letterSpacing: "0.04em" };
    case "italic":
      return { fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 400, color: colors.accent, fontSize: "95px", textTransform: "none", letterSpacing: "normal" };
    default:
      return { fontFamily: "'Playfair Display', serif", fontStyle: "normal", fontWeight: 400, color: colors.textDark, fontSize: "95px", textTransform: "none", letterSpacing: "normal" };
  }
}

function Render({ text, settings }: RenderProps<ArynSettings>) {
  const { colors } = settings;
  const [top, bottom] = splitStacked(text.headline);
  return (
    <>
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
              fontFamily: "'DM Sans', 'Inter', sans-serif",
              fontSize: "15px",
              letterSpacing: "0.22em",
              color: colors.accent,
              textTransform: "uppercase",
              marginBottom: "32px",
              fontWeight: 400,
            }}
          >
            {text.eyebrow}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", marginBottom: "24px" }}>
          {top && <div style={{ lineHeight: 1.1, ...part1Style(settings.headlinePart1Style, colors) }}>{top}</div>}
          {bottom && <div style={{ lineHeight: 1.1, ...part2Style(settings.headlinePart2Style, colors) }}>{bottom}</div>}
        </div>

        {text.subtitle && (
          <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "30px", color: colors.textLight, marginTop: "16px" }}>
            {text.subtitle}
          </div>
        )}
      </div>

      {settings.footerText && (
        <div
          style={{
            position: "absolute",
            bottom: "48px",
            fontFamily: "'DM Sans', 'Inter', sans-serif",
            fontSize: "16px",
            color: colors.textLight,
            letterSpacing: "0.15em",
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

function Controls({ text, setText, settings, update }: ControlsProps<ArynSettings>) {
  return (
    <>
      <div className="space-y-4">
        <SectionHeading icon="type">Content</SectionHeading>
        <TextField label="Eyebrow Text" value={text.eyebrow} onChange={(eyebrow) => setText({ eyebrow })} />
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
          <TextAreaField
            label="Main Headline (stacked)"
            value={text.headline}
            onChange={(headline) => setText({ headline })}
            hint={
              <>
                Line 1 sits on top and line 2 is the big bottom line. On one line, the <code className="font-mono">*marked*</code> words go to the bottom.
              </>
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Top Line Style"
            value={settings.headlinePart1Style}
            options={[
              { value: "italic", label: "Italic Serif" },
              { value: "normal", label: "Normal" },
            ]}
            onChange={(v) => update({ headlinePart1Style: v })}
          />
          <SelectField
            label="Bottom Line Style"
            value={settings.headlinePart2Style}
            options={[
              { value: "bold-caps", label: "Bold Caps" },
              { value: "normal", label: "Normal" },
              { value: "italic", label: "Italic" },
            ]}
            onChange={(v) => update({ headlinePart2Style: v })}
          />
        </div>
        <TextField label="Subtitle (Italic)" value={text.subtitle} onChange={(subtitle) => setText({ subtitle })} />
      </div>
      <Divider />
      <ColorGrid colors={settings.colors} showWatermark={false} onChange={(colors) => update({ colors })} />
      <Divider />
      <TextField label="Footer Text" value={settings.footerText} onChange={(footerText) => update({ footerText })} />
    </>
  );
}

export const arynwilderBrand = defineTemplate<ArynSettings>({
  id: "arynwilder-brand",
  site: "arynwilder",
  label: "Author Brand",
  sampleText: {
    eyebrow: "UNLICENSED GREMLIN",
    headline: "Aryn\nWILDER.",
    subtitle: "Stories about people who have absolutely no business falling in love",
  },
  defaults: {
    headlinePart1Style: "italic",
    headlinePart2Style: "bold-caps",
    footerText: "ARYN WILDER",
    colors: { bg: "#1A1210", textDark: "#F0E6DC", textLight: "#9B8B7A", accent: "#D4765B", bgAmpersand: "#231C18" },
  },
  background: (s) => s.colors.bg,
  baseFont: "'Playfair Display', serif",
  fileName: (text) => `og-arynwilder-${slugify(splitStacked(text.headline).join(" ")) || "brand"}`,
  Controls,
  Render,
});
