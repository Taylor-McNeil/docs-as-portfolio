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