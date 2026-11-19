import { parseHeadline } from "../lib/text";

/** Headline runs with a marker-pen bar behind the *highlighted* words. */
export function HighlightedHeadline({ headline, accent, italic }: { headline: string; accent: string; italic: boolean }) {
  return (
    <>
      {parseHeadline(headline).map((segment, i) =>
        segment.highlight ? (
          <span key={i} style={{ position: "relative", display: "inline-block", whiteSpace: "nowrap" }}>
            <span
              style={{
                position: "absolute",
                backgroundColor: accent,
                height: "42%",
                bottom: "6%",
                left: "-3%",
                width: "106%",
                zIndex: -1,
              }}
            />
            <span style={{ fontStyle: italic ? "italic" : "normal" }}>{segment.text}</span>
          </span>
        ) : (
          <span key={i}>{segment.text}</span>
        ),
      )}
    </>
  );
}
