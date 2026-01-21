"use client";

import { useMemo } from "react";
import hljs from "highlight.js/lib/core";

// Register languages you need
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml"; // includes HTML
import yaml from "highlight.js/lib/languages/yaml";
import plaintext from "highlight.js/lib/languages/plaintext";

hljs.registerLanguage("java", java);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("py", python);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("shell", bash);
hljs.registerLanguage("json", json);
hljs.registerLanguage("css", css);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("yml", yaml);
hljs.registerLanguage("plaintext", plaintext);
hljs.registerLanguage("text", plaintext);

interface CodeHighlightProps {
  code: string;
  language?: string;
}

export function CodeHighlight({ code, language }: CodeHighlightProps) {
  const highlighted = useMemo(() => {
    if (language && hljs.getLanguage(language)) {
      try {
        return hljs.highlight(code, { language }).value;
      } catch {
        // Fall back to plain text
      }
    }
    // Auto-detect if no language specified
    try {
      return hljs.highlightAuto(code).value;
    } catch {
      return code;
    }
  }, [code, language]);

  return (
    <code
      className={`hljs ${language ? `language-${language}` : ""}`}
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
}

/*
 * USAGE EXAMPLE:
 *
 * import { CodeHighlight } from "@/components/content/Highlight";
 *
 * <pre>
 *   <CodeHighlight
 *     code={`function hello() {
 *   console.log("Hello, World!");
 * }`}
 *     language="javascript"
 *   />
 * </pre>
 *
 * <CodeHighlight code="print('Hello')" language="python" />
 *
 * Props:
 * - code: string (required) - Code to syntax highlight
 * - language?: string - Language identifier
 *
 * Supported languages:
 * java, javascript/js, typescript/ts, python/py,
 * bash/shell, json, css, html, xml, yaml/yml, plaintext/text
 *
 * ASCII REPRESENTATION:
 *
 * Input:  function hello() { return "hi"; }
 *
 * Output (with colors applied):
 * ┌────────────────────────────────────────┐
 * │ function hello() { return "hi"; }     │
 * │ ~~~~~~~~ ~~~~~      ~~~~~~ ~~~~       │
 * │ keyword  name       keyword string    │
 * └────────────────────────────────────────┘
 *
 * Typically wrapped in <pre> tag.
 * Used internally by CodeBlock and CollapsibleCode.
 * Auto-detects language if not specified.
 */