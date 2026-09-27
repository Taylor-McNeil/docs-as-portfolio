export interface MermaidIssue {
  line: number | null;
  summary: string;
  hint: string | null;
  excerpt: string | null;
}

export interface MermaidChartSource {
  chart: string;
  diagram: number;
}

interface MermaidParseError {
  message?: unknown;
  str?: unknown;
  hash?: {
    text?: unknown;
    loc?: {
      first_line?: unknown;
    };
  };
}

const closingDelimiter: Record<string, string> = {
  "[": "]",
  "(": ")",
  "{": "}",
};

function delimiterHint(chart: string): string | null {
  const stack: Array<{ delimiter: string; line: number }> = [];
  let quote: "\"" | "'" | null = null;
  let escaped = false;
  let line = 1;

  for (const character of chart) {
    if (character === "\n") {
      line += 1;
      escaped = false;
      continue;
    }
    if (escaped) {
      escaped = false;
      continue;
    }
    if (character === "\\") {
      escaped = true;
      continue;
    }
    if (quote) {
      if (character === quote) quote = null;
      continue;
    }
    if (character === "\"" || character === "'") {
      quote = character;
      continue;
    }
    if (character in closingDelimiter) {
      stack.push({ delimiter: character, line });
      continue;
    }
    if (!Object.values(closingDelimiter).includes(character)) continue;

    const opening = stack.at(-1);
    if (!opening) {
      return `There is a closing ${character} on Mermaid line ${line} without a matching opening delimiter.`;
    }
    const expected = closingDelimiter[opening.delimiter];
    if (character !== expected) {
      return `The ${opening.delimiter} opened on Mermaid line ${opening.line} needs ${expected}, but Mermaid found ${character}.`;
    }
    stack.pop();
  }

  const opening = stack.at(-1);
  if (!opening) return null;
  return `The ${opening.delimiter} opened on Mermaid line ${opening.line} is missing its closing ${closingDelimiter[opening.delimiter]}.`;
}

function parseLine(error: MermaidParseError, message: string): number | null {
  const locationLine = error.hash?.loc?.first_line;
  if (typeof locationLine === "number" && Number.isFinite(locationLine)) return locationLine;
  const messageLine = /(?:parse|lexical) error on line (\d+)/i.exec(message)?.[1];
  return messageLine ? Number(messageLine) : null;
}

export function formatMermaidIssue(chart: string, error: unknown): MermaidIssue {
  const normalizedChart = chart.replace(/\r\n/g, "\n").trim();
  const parsed = error && typeof error === "object" ? error as MermaidParseError : {};
  const messageValue = typeof parsed.message === "string"
    ? parsed.message
    : typeof parsed.str === "string"
      ? parsed.str
      : String(error);
  const line = parseLine(parsed, messageValue);
  const nearbyText = typeof parsed.hash?.text === "string" ? parsed.hash.text.trim() : "";
  const excerpt = line ? normalizedChart.split("\n")[line - 1]?.trim() || null : null;

  let summary = "Mermaid could not parse this diagram.";
  if (/no diagram type detected|unknown diagram/i.test(messageValue)) {
    summary = "Mermaid does not recognize the diagram type. Start with something like `flowchart TD`, `graph LR`, or `sequenceDiagram`.";
  } else if (/lexical error/i.test(messageValue)) {
    summary = nearbyText
      ? `Mermaid found text it does not recognize near \`${nearbyText}\`.`
      : "Mermaid found text it does not recognize on this line.";
  } else if (/parse error/i.test(messageValue)) {
    summary = nearbyText
      ? `Mermaid found invalid syntax near \`${nearbyText}\`.`
      : "Mermaid found invalid syntax on this line.";
  } else {
    const firstLine = messageValue.split("\n").find((candidate) => candidate.trim());
    if (firstLine && firstLine !== "[object Object]") summary = firstLine.trim();
  }

  return {
    line,
    summary,
    hint: delimiterHint(normalizedChart),
    excerpt,
  };
}

export function extractMermaidCharts(source: string): MermaidChartSource[] {
  const charts: string[] = [];
  const templatePattern = /\bchart\s*=\s*\{\s*`([\s\S]*?)`\s*\}/g;
  const arrayPattern = /\bchart\s*=\s*\{\s*\[\s*([\s\S]*?)\s*\]\.join\(\s*["']\\n["']\s*\)\s*\}/g;

  for (const match of source.matchAll(templatePattern)) {
    charts.push(match[1].replace(/\r\n/g, "\n").trim());
  }

  for (const match of source.matchAll(arrayPattern)) {
    const lines: string[] = [];
    for (const serialized of match[1].match(/"(?:\\.|[^"\\])*"/g) ?? []) {
      try {
        lines.push(JSON.parse(serialized) as string);
      } catch {
        lines.length = 0;
        break;
      }
    }
    if (lines.length) charts.push(lines.join("\n").trim());
  }

  return charts.map((chart, index) => ({ chart, diagram: index + 1 }));
}
