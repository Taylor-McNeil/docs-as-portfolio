import { Clock, Eye, Calendar, ExternalLink } from "lucide-react";

interface TutorialHeaderProps {
  title: string;
  description?: string;
  readTime?: string;
  views?: string;
  date?: string;
  source?: {
    name: string;
    url: string;
  };
}

export function TutorialHeader({
  title,
  description,
  readTime,
  views,
  date,
  source,
}: TutorialHeaderProps) {
  return (
    <header className="mt-4 mb-6">
      <h1 className="text-3xl font-bold text-foreground-heading">{title}</h1>
      
      {description && (
        <p className="mt-3 text-lg text-foreground">{description}</p>
      )}

      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-foreground-muted">
        {readTime && (
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>{readTime}</span>
          </div>
        )}
        {views && (
          <div className="flex items-center gap-1.5">
            <Eye size={14} />
            <span>{views}</span>
          </div>
        )}
        {date && (
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span>{date}</span>
          </div>
        )}
        {source && (
         <a 
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-accent hover:underline"
          >
            <ExternalLink size={14} />
            <span>{source.name}</span>
          </a>
        )}
      </div>
    </header>
  );
}