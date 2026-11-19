import type { AampersandTagTone } from "@/data/aampersandEntries";

/** Tag pill: tinted background + text, matching the method-badge colors. */
export const tagToneClasses: Record<AampersandTagTone, string> = {
  purple: "bg-method-patch/10 text-method-patch",
  blue: "bg-method-get/10 text-method-get",
  yellow: "bg-method-put/10 text-method-put",
  pink: "bg-method-head/10 text-method-head",
  green: "bg-method-post/10 text-method-post",
  warning: "bg-[color:var(--color-callout-warn-bg)] text-[color:var(--color-callout-warn)]",
};

/** Text-only version of the same tone, for numbers and small accents. */
export const tagToneTextClasses: Record<AampersandTagTone, string> = {
  purple: "text-method-patch",
  blue: "text-method-get",
  yellow: "text-method-put",
  pink: "text-method-head",
  green: "text-method-post",
  warning: "text-[color:var(--color-callout-warn)]",
};
