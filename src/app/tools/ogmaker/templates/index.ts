import { aampersandDevlogClassic, aampersandHomepage } from "./aampersand";
import { arynwilderBrand } from "./arynwilder";
import { devlogTriBand } from "./devlog-triband";
import { taylorDevlogLight, taylorDocsDark } from "./taylormcneil";
import type { OgTemplate, SiteId } from "./types";

/** Every template, in sidebar order. The first one for a site is its default. */
export const TEMPLATES: OgTemplate[] = [
  aampersandHomepage,
  devlogTriBand,
  aampersandDevlogClassic,
  taylorDocsDark,
  taylorDevlogLight,
  arynwilderBrand,
];

export const TEMPLATES_BY_ID: Record<string, OgTemplate> = Object.fromEntries(TEMPLATES.map((t) => [t.id, t]));

export const SITES: { id: SiteId; label: string }[] = [
  { id: "aampersand", label: "ampersand" },
  { id: "taylormcneil", label: "taylormcneil" },
  { id: "arynwilder", label: "arynwilder" },
];

export type { OgTemplate, SharedText, SiteId } from "./types";
