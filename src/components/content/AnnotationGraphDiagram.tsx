function TreeList({ items }: { items: string[] }) {
  return (
    <div className="text-[11px] font-mono text-foreground-terminal/80 leading-relaxed">
      {items.map((item, i) => (
        <div key={item}>
          {i < items.length - 1 ? "├── " : "└── "}
          {item}
        </div>
      ))}
    </div>
  );
}

export function AnnotationGraphDiagram() {
  return (
    <div
      className="font-mono text-foreground-terminal"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gridTemplateRows: "auto auto auto auto auto",
        justifyItems: "center",
      }}
    >
      {/* Row 1: Top box spanning all 3 columns */}
      <div
        className="border border-dashed border-foreground-terminal/50 p-5"
        style={{ gridColumn: "1 / -1", justifySelf: "center", maxWidth: "24rem" }}
      >
        <div className="text-[12px] font-bold text-center mb-4">ANNOTATION GRAPH</div>

        <div className="flex justify-center text-[11px] mb-2">
          <span>Sparks</span>
          <span className="text-foreground-terminal/40 mx-4">{"←────→"}</span>
          <span>Etches</span>
        </div>

        <div className="flex justify-center gap-6">
          <div>
            <div className="text-[11px] text-foreground-terminal/50 mb-0.5">{"│"}</div>
            <TreeList items={["plotlines", "facets", "entities", "position"]} />
          </div>
          <div>
            <div className="text-[11px] text-foreground-terminal/50 mb-0.5">{"│"}</div>
            <TreeList items={["pages", "categories", "entities", "position"]} />
          </div>
        </div>
      </div>

      {/* Row 2: Vertical pipe from top box, center column */}
      <div
        className="text-foreground-terminal/40 text-[11px] leading-none text-center"
        style={{ gridColumn: "2" }}
      >
        {"│"}
      </div>

      {/* Row 3: Horizontal branch — one element per column */}
      <div className="w-full flex items-center">
        <div className="flex-1" />
        <div className="flex-1 border-t border-dashed border-foreground-terminal/40" />
      </div>
      <div className="w-full border-t border-dashed border-foreground-terminal/40 flex justify-center">
        <span className="text-foreground-terminal/40 text-[11px] leading-none -translate-y-[5px]">{"┬"}</span>
      </div>
      <div className="w-full flex items-center">
        <div className="flex-1 border-t border-dashed border-foreground-terminal/40" />
        <div className="flex-1" />
      </div>

      {/* Row 4: Vertical pipes dropping into each box */}
      <div className="text-foreground-terminal/40 text-[11px] leading-none text-center">{"│"}</div>
      <div className="text-foreground-terminal/40 text-[11px] leading-none text-center">{"│"}</div>
      <div className="text-foreground-terminal/40 text-[11px] leading-none text-center">{"│"}</div>

      {/* Row 5: Bottom query boxes — one per column */}
      <div className="border border-dashed border-foreground-terminal/50 p-3 mx-1.5 self-stretch">
        <div className="text-[11px] font-bold mb-1.5">CLOTHESLINE</div>
        <div className="text-[10px] text-foreground-terminal/70 leading-snug">
          Query:{"\n"}{`"Show me sparks by chapter & facet"`}
        </div>
      </div>
      <div className="border border-dashed border-foreground-terminal/50 p-3 mx-1.5 self-stretch">
        <div className="text-[11px] font-bold mb-1.5">WIKI PAGE</div>
        <div className="text-[10px] text-foreground-terminal/70 leading-snug">
          Query:{"\n"}{`"Show me everything tagged to character"`}
        </div>
      </div>
      <div className="border border-dashed border-foreground-terminal/50 p-3 mx-1.5 self-stretch">
        <div className="text-[11px] font-bold mb-1.5">BOARDS</div>
        <div className="text-[10px] text-foreground-terminal/70 leading-snug">
          Query:{"\n"}{`"Show me sparks by plotline & status"`}
        </div>
      </div>
    </div>
  );
}
