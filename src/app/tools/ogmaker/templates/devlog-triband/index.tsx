"use client";

import { useLayoutEffect, useRef } from "react";
import { ColorField, Divider, SectionHeading, SelectField, TextField } from "../../ui/controls";
import { highlightLastWord, slugify, stripMarkers } from "../../lib/text";
import { defineTemplate, type ControlsProps, type RenderProps, type SharedText } from "../types";
import { DEVLOG_ICONS, ICON_PATHS, type DevlogIcon } from "./icons";
import { DEVLOG_INDEX, DEVLOG_POSTS, type DevlogPost } from "./posts";

/**
 * The aampersand devlog cover: coloured bands top and bottom, a cream middle
 * with the title between two rules, and a round seal on the bottom band. It
 * mirrors the "fluid" DevlogCover in ampersand-site (the .dv-* rules in its
 * globals.css) at 1200×630, with a bigger title so it reads as a thumbnail.
 */

const CREAM = "#F5F0E4";
const RULE = "#D9D0C0";
const INK = "#2F2E2A";
const AFTER_INK = "#4D5148";
const BAND_HEIGHT = 150;
const SEAL_SIZE = 150;
const SEAL_RISE = 30;
const MID_GAP = 20;
const TITLE_MAX = 108;
const TITLE_MIN = 48;
const DISPLAY = "'Fraunces Variable', 'Fraunces', Georgia, serif";
const UI = "'DM Sans', system-ui, sans-serif";

type Variant = "post" | "index";

type TriBandSettings = {
  variant: Variant;
  number: number;
  months: string;
  color: string;
  icon: DevlogIcon;
  postCount: string;
  latest: string;
  indexUrl: string;
};

const pad = (n: number) => String(n).padStart(2, "0");
const latestPost = DEVLOG_POSTS[DEVLOG_POSTS.length - 1];

function postSettings(post: DevlogPost): Partial<TriBandSettings> {
  return { variant: "post", number: post.number, months: post.months, color: post.color, icon: post.icon };
}

function postText(post: DevlogPost): SharedText {
  return {
    // The last word is marked so the classic devlog template highlights it.
    headline: highlightLastWord(post.title),
    subtitle: post.afterLine ?? "",
    eyebrow: `DEVLOG #${post.number} · ${post.months.toUpperCase()}`,
  };
}

const INDEX_TEXT: SharedText = {
  headline: highlightLastWord(DEVLOG_INDEX.title),
  subtitle: DEVLOG_INDEX.afterLine,
  eyebrow: "AMPERSAND DEVLOG",
};

const INDEX_SETTINGS: Partial<TriBandSettings> = {
  variant: "index",
  color: DEVLOG_INDEX.color,
  icon: DEVLOG_INDEX.icon,
  postCount: `${DEVLOG_POSTS.length} posts`,
  latest: `Latest: No. ${pad(latestPost.number)}`,
  indexUrl: DEVLOG_INDEX.url,
};

function SealIcon({ icon }: { icon: DevlogIcon }) {
  if (icon === "ampersand") return <>&amp;</>;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
      strokeLinecap="round"
      style={{ width: "52%", height: "52%" }}
    >
      {ICON_PATHS[icon]}
    </svg>
  );
}

/** Shrinks the title from TITLE_MAX until it is at most two lines, fits the width, and clears the seal. */
function useFittedTitle(title: string, afterLine: string, fontsReady: boolean) {
  const titleRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = titleRef.current;
    const mid = midRef.current;
    if (!el || !mid) return;
    const styles = getComputedStyle(mid);
    const available = mid.clientHeight - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom) - 16;
    const fits = (size: number) => {
      el.style.fontSize = `${size}px`;
      const lines = Math.round(el.offsetHeight / size);
      const children = Array.from(mid.children) as HTMLElement[];
      const contentHeight = children.reduce((sum, child) => sum + child.offsetHeight, 0) + MID_GAP * (children.length - 1);
      return lines <= 2 && el.scrollWidth <= el.clientWidth + 1 && contentHeight <= available;
    };
    let size = TITLE_MAX;
    while (size > TITLE_MIN && !fits(size)) size -= 2;
  }, [title, afterLine, fontsReady]);

  return { titleRef, midRef };
}

const bandText = {
  color: "#FFFFFF",
  fontFamily: UI,
  fontWeight: 600,
  whiteSpace: "nowrap",
} as const;

const footText = {
  ...bandText,
  position: "absolute",
  bottom: "55px",
  fontSize: "17px",
  letterSpacing: "0.2em",
  lineHeight: 1.5,
  textTransform: "uppercase",
} as const;

function Render({ text, settings, fontsReady }: RenderProps<TriBandSettings>) {
  const title = stripMarkers(text.headline).trim();
  const afterLine = text.subtitle.trim();
  const { titleRef, midRef } = useFittedTitle(title, afterLine, fontsReady);
  const band = settings.color;
  const isIndex = settings.variant === "index";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        background: CREAM,
        border: `1px solid ${RULE}`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          ...bandText,
          flex: "none",
          height: `${BAND_HEIGHT}px`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 56px",
          background: band,
          fontSize: "20px",
          letterSpacing: "0.28em",
        }}
      >
        <span>AMPERSAND DEVLOG</span>
        <span>{isIndex ? settings.postCount : `No. ${pad(settings.number)}`}</span>
      </div>

      {/* Centred in the cream that stays visible above the seal. */}
      <div
        ref={midRef}
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: `${MID_GAP}px`,
          padding: `0 80px ${SEAL_RISE}px`,
          textAlign: "center",
        }}
      >
        <div style={{ width: "520px", height: "2px", flex: "none", background: band }} />
        <div
          ref={titleRef}
          style={{
            maxWidth: "100%",
            fontFamily: DISPLAY,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: INK,
            textWrap: "balance",
          }}
        >
          {title}
        </div>
        {afterLine && (
          <div style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontStyle: "italic", fontWeight: 400, fontSize: "30px", lineHeight: 1.25, color: AFTER_INK }}>
            {afterLine}
          </div>
        )}
        <div style={{ width: "520px", height: "2px", flex: "none", background: band }} />
      </div>

      <div style={{ position: "relative", flex: "none", height: `${BAND_HEIGHT}px`, background: band }}>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: `-${SEAL_RISE}px`,
            transform: "translateX(-50%)",
            width: `${SEAL_SIZE}px`,
            height: `${SEAL_SIZE}px`,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: CREAM,
            border: `4px solid ${band}`,
            color: band,
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: "66px",
            lineHeight: 1,
          }}
        >
          <SealIcon icon={settings.icon} />
        </div>
        {isIndex ? (
          <>
            <span style={{ ...footText, left: "56px" }}>{settings.indexUrl}</span>
            <span style={{ ...footText, right: "56px" }}>{settings.latest}</span>
          </>
        ) : (
          <span style={{ ...footText, right: "56px" }}>{settings.months}</span>
        )}
      </div>
    </div>
  );
}

const ICON_LABELS: Record<DevlogIcon, string> = {
  sunscreen: "Sunscreen (#1)",
  yarn: "Yarn (#2)",
  horns: "Horns (#3)",
  "baby-oil": "Baby oil (#4)",
  puddle: "Puddle (#5)",
  silhouette: "Silhouette (#6)",
  column: "Column (#7)",
  ampersand: "Ampersand (index)",
};

function Controls({ text, setText, settings, update }: ControlsProps<TriBandSettings>) {
  const isIndex = settings.variant === "index";

  const fill = (value: string) => {
    if (value === "index") {
      setText(INDEX_TEXT);
      update(INDEX_SETTINGS);
      return;
    }
    const post = DEVLOG_POSTS.find((p) => String(p.number) === value);
    if (!post) return;
    setText(postText(post));
    update(postSettings(post));
  };

  return (
    <>
      <div className="space-y-3">
        <SectionHeading icon="type">Post</SectionHeading>
        <label className="block">
          <span className="block text-xs font-medium text-gray-500 mb-1">Fill from a post</span>
          <select
            value=""
            onChange={(e) => fill(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="" disabled>
              Choose a post to fill every field…
            </option>
            {DEVLOG_POSTS.map((p) => (
              <option key={p.number} value={String(p.number)}>
                #{p.number} {p.title}
              </option>
            ))}
            <option value="index">Index (aampersand.com/devlog)</option>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="Layout">
          {(["post", "index"] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={settings.variant === v}
              onClick={() => update({ variant: v })}
              className={`py-1.5 text-xs rounded-md border transition-colors ${settings.variant === v ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-medium" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              {v === "post" ? "Post cover" : "Index cover"}
            </button>
          ))}
        </div>
      </div>
      <Divider />
      <div className="space-y-4">
        <SectionHeading icon="type">Content</SectionHeading>
        <TextField
          label="Title"
          value={stripMarkers(text.headline)}
          onChange={(headline) => setText({ headline })}
          hint="Shrinks automatically to stay within two lines."
        />
        <TextField label="After line (italic, optional)" value={text.subtitle} onChange={(subtitle) => setText({ subtitle })} />
        {isIndex ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Top right" value={settings.postCount} onChange={(postCount) => update({ postCount })} />
              <TextField label="Bottom right" value={settings.latest} onChange={(latest) => update({ latest })} />
            </div>
            <TextField label="Bottom left" value={settings.indexUrl} onChange={(indexUrl) => update({ indexUrl })} />
          </>
        ) : (
          <div className="grid grid-cols-[5rem_1fr] gap-3">
            <label className="block">
              <span className="block text-xs font-medium text-gray-500 mb-1">No.</span>
              <input
                type="number"
                min={0}
                max={99}
                value={settings.number}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (Number.isInteger(n) && n >= 0) update({ number: n });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </label>
            <TextField label="Months" value={settings.months} onChange={(months) => update({ months })} placeholder="July–August 2026" />
          </div>
        )}
      </div>
      <Divider />
      <div className="space-y-4">
        <SectionHeading icon="palette">Cover</SectionHeading>
        <div className="grid grid-cols-2 gap-4 items-end">
          <ColorField label="Band colour" value={settings.color} onChange={(color) => update({ color })} />
          <SelectField
            label="Seal icon"
            value={settings.icon}
            options={DEVLOG_ICONS.map((icon) => ({ value: icon, label: ICON_LABELS[icon] }))}
            onChange={(icon) => update({ icon })}
          />
        </div>
      </div>
    </>
  );
}

export const devlogTriBand = defineTemplate<TriBandSettings>({
  id: "aampersand-devlog-triband",
  site: "aampersand",
  label: "Devlog (tri-band)",
  sampleText: postText(latestPost),
  defaults: {
    ...(postSettings(latestPost) as Pick<TriBandSettings, "variant" | "number" | "months" | "color" | "icon">),
    postCount: INDEX_SETTINGS.postCount as string,
    latest: INDEX_SETTINGS.latest as string,
    indexUrl: DEVLOG_INDEX.url,
  },
  background: () => CREAM,
  baseFont: UI,
  fileName: (_text, s) => (s.variant === "index" ? "devlog" : `devlog-${slugify(s.months) || pad(s.number)}`),
  Controls,
  Render,
});
