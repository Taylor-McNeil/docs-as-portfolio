function ChapterColumn({ label, sparks }: { label: string; sparks: (string | null)[] }) {
  return (
    <div className="flex flex-col items-center gap-0">
      <div className="border border-foreground-terminal rounded px-3 py-1.5 text-[11px] font-mono text-foreground-terminal">
        {label}
      </div>
      <div className="w-px h-4 bg-foreground-terminal" />
      <div className="flex flex-col items-center gap-1.5">
        {sparks.map((spark, i) =>
          spark ? (
            <div
              key={i}
              className="border border-foreground-terminal rounded px-2 py-1 text-[10px] font-mono text-foreground-terminal text-center min-w-[72px]"
            >
              {spark}
            </div>
          ) : (
            <div key={i} className="text-[10px] font-mono text-foreground-terminal/40 py-1 text-center">
              ·<br />(gap)
            </div>
          )
        )}
      </div>
    </div>
  );
}

export function ClotheslineDiagram() {
  const columns: { label: string; sparks: (string | null)[] }[] = [
    { label: "Ch 1", sparks: ["CLUE", "FORESHADOW"] },
    { label: "Ch 2", sparks: ["BEAT", "FORESHADOW"] },
    { label: "Ch 3", sparks: ["CLUE"] },
    { label: "Ch 4", sparks: [null] },
    { label: "Ch 5", sparks: ["CLUE", "BEAT"] },
  ];

  return (
    <div className="font-mono text-foreground-terminal">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        {columns.map((col) => (
          <ChapterColumn key={col.label} label={col.label} sparks={col.sparks} />
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-foreground-terminal/20 space-y-2">
        <div className="flex flex-wrap gap-2 text-[11px] items-center">
          <span>Filter:</span>
          <span className="border border-foreground-terminal/40 rounded px-2 py-0.5">Clue ✓</span>
          <span className="border border-foreground-terminal/40 rounded px-2 py-0.5">Foreshadow ✓</span>
          <span className="text-foreground-terminal/40">+ Add filter</span>
        </div>
        <p className="text-[11px] italic text-foreground-terminal/60">
          &quot;Show me every clue and every promise, in order.&quot;
        </p>
      </div>
    </div>
  );
}
