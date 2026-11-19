import type { ComponentType } from "react";

export type SiteId = "aampersand" | "taylormcneil" | "arynwilder";

/**
 * The words on the card. Shared by every template, so switching site or
 * template keeps what you typed. The headline marks its highlight with
 * asterisks ("Run *wild.*"); see lib/text.ts.
 */
export type SharedText = {
  eyebrow: string;
  headline: string;
  subtitle: string;
};

export type TemplateSettings = Record<string, unknown>;

export type ControlsProps<S extends TemplateSettings> = {
  text: SharedText;
  setText: (patch: Partial<SharedText>) => void;
  settings: S;
  defaults: S;
  update: (patch: Partial<S>) => void;
};

export type RenderProps<S extends TemplateSettings> = {
  text: SharedText;
  settings: S;
  /** True once every font is loaded; templates that measure text re-measure then. */
  fontsReady: boolean;
};

/**
 * One OG template. To add one: write a module that exports an OgTemplate and
 * list it in templates/index.ts. Each template owns its settings (colours,
 * layout options); the words live in SharedText.
 */
export type OgTemplate<S extends TemplateSettings = TemplateSettings> = {
  id: string;
  site: SiteId;
  label: string;
  /** The template's example words, used on first load and by "Reset text to template". */
  sampleText: SharedText;
  defaults: S;
  /** Background of the 1200×630 node; also what html-to-image paints behind it. */
  background: (settings: S) => string;
  /** The font family the card inherits. */
  baseFont: string;
  /** The default download name, without ".png" or the version suffix. */
  fileName: (text: SharedText, settings: S) => string;
  Controls: ComponentType<ControlsProps<S>>;
  Render: ComponentType<RenderProps<S>>;
};

/** Erases a template's settings type so templates can share one list. */
export function defineTemplate<S extends TemplateSettings>(template: OgTemplate<S>): OgTemplate {
  return template as unknown as OgTemplate;
}
