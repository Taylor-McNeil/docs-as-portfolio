import type { ReactNode } from "react";

/*
 * A short chat transcript between me and an agent, styled as a conversation.
 *
 * <Conversation caption="A conversation I've had more than once">
 *   <ChatMessage from="me">Bro, these are different colors.</ChatMessage>
 *   <ChatMessage from="claude" interrupted>These seem to match, the creams are--</ChatMessage>
 * </Conversation>
 */

type Speaker = "me" | "claude";

const speakerLabels: Record<Speaker, string> = {
  me: "Me",
  claude: "Claude",
};

export function Conversation({ caption, children }: { caption?: string; children: ReactNode }) {
  return (
    <figure className="not-prose my-6 overflow-hidden rounded-lg border border-border">
      {caption ? (
        <figcaption className="border-b border-border bg-surface-card px-4 py-2 font-mono text-xs text-foreground-muted">
          {caption}
        </figcaption>
      ) : null}
      <ol className="m-0 flex list-none flex-col gap-3 bg-surface-terminal p-4 sm:px-6">{children}</ol>
    </figure>
  );
}

export function ChatMessage({
  from,
  interrupted = false,
  children,
}: {
  from: Speaker;
  /** Show Claude Code's "Interrupted by user" marker under the message. */
  interrupted?: boolean;
  children: ReactNode;
}) {
  const isMe = from === "me";

  return (
    <li className={`m-0 flex max-w-[85%] flex-col gap-1 sm:max-w-[75%] ${isMe ? "items-end self-end" : "items-start self-start"}`}>
      <span className="flex items-center gap-1 px-1 font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
        {isMe ? null : (
          <span aria-hidden="true" className="text-[13px] leading-none text-[#d97757]">
            ✻
          </span>
        )}
        {speakerLabels[from]}
      </span>
      <p
        className={`m-0 rounded-2xl px-4 py-2 text-[15px] leading-6 ${
          isMe
            ? "rounded-br-sm border border-accent/30 bg-accent/15 text-foreground"
            : "rounded-bl-sm border border-border bg-surface-card text-foreground"
        }`}
      >
        <span className="sr-only">{speakerLabels[from]}: </span>
        {children}
      </p>
      {interrupted ? (
        <span className="px-1 font-mono text-[11px] text-foreground-muted">
          <span aria-hidden="true">⎿ </span>Interrupted by user
        </span>
      ) : null}
    </li>
  );
}
