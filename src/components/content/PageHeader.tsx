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

/*
 * USAGE EXAMPLE:
 *
 * import { PageHeader } from "@/components/content/PageHeader";
 *
 * <PageHeader
 *   method="POST"
 *   endpoint="/v1/messages"
 *   title="Create a Message"
 *   description="Send a structured message to Claude and receive a response."
 * />
 *
 * <PageHeader
 *   method="GET"
 *   endpoint="/v1/models"
 *   title="List Models"
 * />
 *
 * Props:
 * - method: "GET" | "POST" | "PUT" | "PATCH" (required)
 * - endpoint: string (required) - API path
 * - title: string (required) - Page title
 * - description?: string - Optional subtitle
 *
 * ASCII REPRESENTATION:
 *
 * ┌──────┐
 * │ POST │  /v1/messages
 * └──────┘
 *
 * Create a Message
 *
 * Send a structured message to Claude and receive a response.
 *
 * Simpler than GuideHeader - no copy/live doc buttons.
 * Use for API reference pages.
 */