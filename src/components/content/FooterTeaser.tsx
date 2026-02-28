import { ArrowRight } from "lucide-react";

interface FooterTeaserProps {
  text: string;
  href?: string;
}

export function FooterTeaser({ text, href }: FooterTeaserProps) {
  const content = (
    <div className="flex items-center gap-3 font-mono text-sm dark:text-slate-400 text-slate-600">
      <ArrowRight size={16} className="dark:text-slate-500 text-orange-500 shrink-0" />
      <span>{text}</span>
    </div>
  );

  return (
    <div className="my-10 pt-6 border-t dark:border-slate-700 border-slate-200">
      {href ? (
        <a href={href} className="block hover:opacity-80 transition-opacity">
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}

/*
 * USAGE EXAMPLE:
 *
 * import { FooterTeaser } from "@/components/content/FooterTeaser";
 *
 * <FooterTeaser
 *   text="Next month, we need to talk to the Automata…"
 *   href="/aampersand/automata"
 * />
 *
 * Props:
 * - text: string (required) - The teaser text
 * - href?: string - Optional link for the teaser
 *
 * ASCII REPRESENTATION:
 *
 * ────────────────────────────────────────
 *  →  Next month, we need to talk to the Automata…
 *
 * Dark mode: Slate border and text, slate arrow
 * Light mode: Light gray border, slate text, orange arrow
 */
