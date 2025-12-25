interface ExampleProps {
  label?: string;
  children: React.ReactNode;
}

export function Example({ label, children }: ExampleProps) {
  return (
    <div className="my-3">
      {label && (
        <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wide">
          {label}
        </span>
      )}
      <div className="mt-1 px-3 py-1.5 bg-surface-terminal border border-border rounded-md font-mono text-sm text-foreground-terminal leading-normal [&>p]:m-0 [&>p]:leading-normal [&>p]:text-foreground-terminal">
        {children}
      </div>
    </div>
  );
}