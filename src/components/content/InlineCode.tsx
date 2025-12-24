interface InlineCodeProps {
  children: React.ReactNode;
}

export function InlineCode({ children }: InlineCodeProps) {
  return (
    <code className="px-1.5 py-0.5 bg-surface-card border border-border rounded text-sm font-mono">
      {children}
    </code>
  );
}
