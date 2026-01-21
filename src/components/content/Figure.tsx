import Image from "next/image";

interface FigureProps {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export function Figure({ src, alt, caption, width = 600, height = 400 }: FigureProps) {
  return (
    <figure className="my-6">
      <div className="rounded-lg overflow-hidden border border-border bg-white">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-auto"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-foreground-muted text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/*
 * USAGE EXAMPLE:
 *
 * import { Figure } from "@/components/content/Figure";
 *
 * <Figure
 *   src="/images/diagram.png"
 *   alt="Architecture diagram showing data flow"
 *   caption="Figure 1: System architecture overview"
 *   width={800}
 *   height={500}
 * />
 *
 * <Figure
 *   src="/images/screenshot.png"
 *   alt="Application screenshot"
 * />
 *
 * Props:
 * - src: string (required) - Image path
 * - alt: string (required) - Alt text for accessibility
 * - caption?: string - Caption displayed below image
 * - width?: number - Image width (default: 600)
 * - height?: number - Image height (default: 400)
 *
 * ASCII REPRESENTATION:
 *
 * ┌─────────────────────────────────────┐
 * │                                     │
 * │         ┌───────────────┐           │
 * │         │               │           │
 * │         │    IMAGE      │           │
 * │         │               │           │
 * │         └───────────────┘           │
 * │                                     │
 * └─────────────────────────────────────┘
 *       Figure 1: Caption text here
 *
 * Uses Next.js Image for optimization.
 * White background, bordered, centered caption.
 */