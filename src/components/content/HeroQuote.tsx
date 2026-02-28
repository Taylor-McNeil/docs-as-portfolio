import { ReactNode } from "react";

interface HeroQuoteProps {
  children: ReactNode;
}

export function HeroQuote({ children }: HeroQuoteProps) {
  return (
    <blockquote className="my-8 pl-6 border-l-4 border-method-put">
      <div className="text-lg md:text-xl italic leading-relaxed dark:text-slate-200 text-slate-800 [&>p]:m-0">
        {children}
      </div>
    </blockquote>
  );
}

/*
 * USAGE EXAMPLE:
 *
 * import { HeroQuote } from "@/components/content/HeroQuote";
 *
 * <HeroQuote>
 *   I was seventeen chapters in when I forgot I had killed a man.
 * </HeroQuote>
 *
 * Props:
 * - children: ReactNode (required) - The quote content
 *
 * ASCII REPRESENTATION:
 *
 * ▌  I was seventeen chapters in when I forgot
 * ▌  I had killed a man.
 *
 * Dark mode: Emerald left border, light slate text
 * Light mode: Orange left border, dark slate text
 */
