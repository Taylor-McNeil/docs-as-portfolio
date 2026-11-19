"use client";

import { useState, type ReactNode } from "react";
import { Palette, RotateCcw, Type } from "lucide-react";

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white";

export function SectionHeading({ icon, children }: { icon: "type" | "palette"; children: ReactNode }) {
  const Icon = icon === "type" ? Type : Palette;
  return (
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-4 h-4 text-gray-500" />
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{children}</h2>
    </div>
  );
}

export function Divider() {
  return <hr className="border-gray-100" />;
}

export function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-medium text-gray-500 mb-1">
      {children}
    </label>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  mono = false,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  mono?: boolean;
  hint?: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-500 mb-1">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} ${mono ? "font-mono" : ""}`}
      />
      {hint && <span className="block text-[11px] text-gray-400 mt-1">{hint}</span>}
    </label>
  );
}

/** A multi-line field: Enter adds a line break, which templates honour. */
export function TextAreaField({
  label,
  value,
  onChange,
  hint,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: ReactNode;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-500 mb-1">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} resize-y leading-snug`}
      />
      {hint && <span className="block text-[11px] text-gray-400 mt-1">{hint}</span>}
    </label>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-500 mb-1">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)} className={inputClass}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded text-indigo-600 focus:ring-indigo-500"
      />
      {label}
    </label>
  );
}

const HEX = /^#[0-9a-f]{6}$/i;

/** A colour swatch plus an editable hex field. */
export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [draft, setDraft] = useState(value);
  const [shown, setShown] = useState(value);
  if (value !== shown) {
    setShown(value);
    setDraft(value);
  }
  return (
    <div>
      <span className="block text-xs text-gray-500 mb-1">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} colour`}
          value={HEX.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="w-8 h-8 shrink-0 rounded cursor-pointer border-0 p-0"
        />
        <input
          type="text"
          aria-label={`${label} hex`}
          value={draft}
          spellCheck={false}
          onChange={(e) => {
            let next = e.target.value.trim();
            if (next && !next.startsWith("#")) next = `#${next}`;
            setDraft(next);
            if (HEX.test(next)) onChange(next.toUpperCase());
          }}
          onBlur={() => setDraft(value)}
          className={`w-[5.5rem] px-1.5 py-1 text-xs font-mono uppercase border rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${HEX.test(draft) ? "border-gray-300 text-gray-600" : "border-red-300 text-red-600"}`}
        />
      </div>
    </div>
  );
}

export type CardColors = {
  bg: string;
  textDark: string;
  textLight: string;
  accent: string;
  bgAmpersand: string;
};

/** The colour grid the classic templates share. */
export function ColorGrid({
  colors,
  showWatermark,
  onChange,
}: {
  colors: CardColors;
  showWatermark: boolean;
  onChange: (colors: CardColors) => void;
}) {
  const fields: { label: string; key: keyof CardColors }[] = [
    { label: "Background", key: "bg" },
    { label: "Accent", key: "accent" },
    { label: "Main Text", key: "textDark" },
    { label: "Subtext", key: "textLight" },
  ];
  if (showWatermark) fields.push({ label: "Watermark", key: "bgAmpersand" });
  return (
    <div className="space-y-4">
      <SectionHeading icon="palette">Colors</SectionHeading>
      <div className="grid grid-cols-2 gap-4">
        {fields.map((f) => (
          <ColorField key={f.key} label={f.label} value={colors[f.key]} onChange={(v) => onChange({ ...colors, [f.key]: v })} />
        ))}
      </div>
    </div>
  );
}

export function SliderWithInput({
  label,
  value,
  defaultValue,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const isDefault = value === defaultValue;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="block text-xs text-gray-500">{label}</span>
        {!isDefault && (
          <button
            type="button"
            onClick={() => onChange(defaultValue)}
            className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
            title={`Reset to ${defaultValue}`}
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="grow accent-indigo-600"
        />
        <input
          type="number"
          aria-label={`${label} value`}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!Number.isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
          }}
          className="w-16 px-1.5 py-1 text-xs font-mono text-gray-600 border border-gray-300 rounded text-right focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>
  );
}

export type WatermarkSettings = {
  showBackgroundWatermark: boolean;
  backgroundWatermarkChar: string;
  ampersandSize: number;
  ampersandX: number;
  ampersandY: number;
};

export function WatermarkControls<S extends WatermarkSettings>({
  settings,
  defaults,
  update,
}: {
  settings: S;
  defaults: S;
  update: (patch: Partial<WatermarkSettings>) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="block text-sm font-semibold text-gray-700">Background Watermark</span>
        <CheckboxField label="Show" checked={settings.showBackgroundWatermark} onChange={(v) => update({ showBackgroundWatermark: v })} />
      </div>
      {settings.showBackgroundWatermark && (
        <>
          <TextField label="Character" value={settings.backgroundWatermarkChar} onChange={(v) => update({ backgroundWatermarkChar: v })} />
          <SliderWithInput label="Size" value={settings.ampersandSize} defaultValue={defaults.ampersandSize} min={200} max={1600} step={10} onChange={(v) => update({ ampersandSize: v })} />
          <SliderWithInput label="Horizontal Offset" value={settings.ampersandX} defaultValue={defaults.ampersandX} min={-500} max={500} step={5} onChange={(v) => update({ ampersandX: v })} />
          <SliderWithInput label="Vertical Offset" value={settings.ampersandY} defaultValue={defaults.ampersandY} min={-300} max={300} step={5} onChange={(v) => update({ ampersandY: v })} />
        </>
      )}
    </div>
  );
}

export const HIGHLIGHT_HINT = (
  <>
    Wrap the highlighted words in asterisks: <code className="font-mono">Run *wild.*</code>
  </>
);
