import Image from "next/image";

export function SceneBreak() {
  return (
    <div className="flex items-center justify-center gap-4 my-12 select-none" aria-hidden="true">
      <span className="h-px w-12 bg-border" />
      <Image
        src="/brand/svg/ampersand-symbol-primary.svg"
        alt=""
        width={36}
        height={36}
        className="h-7 w-auto opacity-80"
      />
      <span className="h-px w-12 bg-border" />
    </div>
  );
}

/*
 * USAGE:
 *
 * <SceneBreak />
 *
 * An in-content scene break — the aampersand brand glyph, faint and centered.
 * Use between scenes/sections where the prose continues. Distinct from `---`
 * (the full-width `~#~` rule), which signals the end of the page.
 *
 * The glyph is the brand symbol from public/brand/svg/. Variants available:
 *   ampersand-symbol-primary.svg  (gold  #C9B458)
 *   ampersand-symbol-dark.svg     (charcoal #2B2E34)
 *   ampersand-symbol-light.svg    (cream #FCFBF8)
 * Because it's referenced as an image it doesn't follow the theme automatically;
 * adjust size via `h-*` and faintness via `opacity-*`.
 */
