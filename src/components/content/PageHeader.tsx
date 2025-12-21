import { MethodBadge } from "../navigation/MethodBadge";

type Method = "GET" | "POST" | "PUT" | "PATCH";

interface PageHeaderProps {
  method: Method;
  endpoint: string;
  title: string;
  description?: string;
}

export function PageHeader({ method, endpoint, title, description }: PageHeaderProps) {
  return (
    <header className="space-y-4">
      <div className="flex items-center gap-3">
        <MethodBadge method={method} active size="md" />
        <span className="font-mono text-sm text-foreground-muted">{endpoint}</span>
      </div>

      <h1 className="text-3xl font-bold text-foreground-heading">{title}</h1>

      {description && (
        <p className="text-lg text-foreground">{description}</p>
      )}
    </header>
  );
}