'use client';

import { useState, useRef, useMemo, useCallback, useEffect } from "react";

const BLOCK_TYPES = {
  prose: { label: "Prose", color: "#e8e8e8", textColor: "#333" },
  thought: { label: "Thought", color: "#e8d5f5", textColor: "#5b21b6" },
  "text-received": { label: "Text ←", color: "#e5e5ea", textColor: "#1a1a1a" },
  "text-sent": { label: "Text →", color: "#3a7bd5", textColor: "#fff" },
  "slack-message": { label: "Slack", color: "#2c2c2c", textColor: "#d4d4d4" },
  "slack-typing": { label: "Slack ···", color: "#3a3a3a", textColor: "#888" },
  "bt-notify": { label: "BT Notify", color: "#e6e0d8", textColor: "#444" },
  "system-message": { label: "System", color: "#1a1a2e", textColor: "#8ac4ff" },
  "system-error": { label: "System !", color: "#1a1a2e", textColor: "#ff6b6b" },
  "sticky-note": { label: "Sticky", color: "#fef3a7", textColor: "#5a4a12" },
  "handwritten-note": { label: "Note", color: "#ffffff", textColor: "#555" },
  email: { label: "Email", color: "#f3f3f3", textColor: "#444" },
  "phone-badge": { label: "Phone", color: "#f0f0f0", textColor: "#555" },
  "red-ink": { label: "Red Ink", color: "#fbe4df", textColor: "#c0392b" },
  "grade-mark": { label: "Grade", color: "#f6d9d5", textColor: "#c0392b" },
  "grade-comment": { label: "Grade Note", color: "#f6d9d5", textColor: "#c0392b" },
  "scene-break": { label: "· · ·", color: "#f0f0f0", textColor: "#999" },
  "scene-break-noodles": { label: "∞ 🍜 ∞", color: "#f4eee4", textColor: "#8a673d" },
  skip: { label: "Skip", color: "#f5f5f5", textColor: "#bbb" },
};

const SLACK_SPEAKERS = [
  { name: "Bekki Selestra", userClass: "user-bekki", short: "Bekki" },
  { name: "Kirowagi Kenjaku", userClass: "user-kenjaku", short: "Kenjaku" },
  { name: "Gushiken Banari", userClass: "user-advisor1", short: "Gushiken" },
  { name: "Tenkai Fumiaki", userClass: "user-advisor2", short: "Tenkai" },
  { name: "Amami Shiori", userClass: "user-advisor3", short: "Amami" },
];

const TEXT_SPEAKERS = [
  { name: "Fire Him", direction: "received" },
  { name: "The Beast", direction: "received" },
  { name: "The Dictator", direction: "received" },
  { name: "Number One Baddie", direction: "received" },
  { name: "Gumi Bear", direction: "received" },
  { name: "The Roomate??", direction: "received" },
  { name: "Unknown Number", direction: "received" },
  { name: "Yuuji", direction: "sent" },
  { name: "Number One Baddie", direction: "sent" },
  { name: "Gumi Bear", direction: "sent" },
  { name: "Sukuna", direction: "sent" },
  { name: "Turkey Boy", direction:"received"},
];

const SLACK_COLORS = {
  "user-bekki": "#e06c75",
  "user-kenjaku": "#61afef",
  "user-advisor1": "#98c379",
  "user-advisor2": "#d19a66",
  "user-advisor3": "#c678dd",
};

const AO3_SKIN_CSS = `
  /* TEXT MESSAGES */
  #workskin .text-thread { display: flex; flex-direction: column; margin-top: 1em; margin-bottom: 1em; }
  #workskin .text-msg { max-width: 78%; padding: 10px 16px; font-size: 15px; line-height: 1.55; margin-bottom: 8px; margin-left: 0; margin-right: 0; margin-top: 0; border: none; border-left: none; }
  #workskin .text-msg p { margin-bottom: 0; margin-top: 0; }
  #workskin .text-msg strong { font-weight: normal; }
  #workskin .text-msg em { font-style: normal; }
  #workskin .text-msg .msg-label { font-family: 'Courier New', Courier, monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 2px; opacity: 0.7; }
  #workskin .text-msg .msg-dir { font-size: 0; line-height: 0; overflow: hidden; }
  #workskin .text-msg.received { background-color: #e5e5ea; color: #1a1a1a; align-self: flex-start; border-radius: 18px 18px 18px 6px; }
  #workskin .text-msg.received .msg-label { color: #555; }
  #workskin .text-msg.sent { background-color: #3a7bd5; color: #fff; align-self: flex-end; border-radius: 18px 18px 6px 18px; }
  #workskin .text-msg.sent .msg-label { color: rgba(255,255,255,0.7); }

  /* BLUETOOTH SPEAKER */
  #workskin .bt-notify { text-align: center; margin-top: 1.4em; margin-bottom: 1.4em; padding: 8px 20px; font-family: 'Courier New', Courier, monospace; font-size: 13px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #444; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; background: linear-gradient(to right, transparent, rgba(0,0,0,0.02), transparent); }

  /* SLACK — Option D Light Theme */
  #workskin .slack-workspace { background-color: #fafafa; border: 1px solid #ddd; border-left: 1px solid #ddd; border-radius: 6px; margin-top: 1.2em; margin-bottom: 1.2em; margin-left: 0; margin-right: 0; padding: 0; overflow: hidden; }
  #workskin .slack-channel { background-color: #f0f0f0; border-bottom: 1px solid #ddd; padding: 9px 18px; font-family: 'Courier New', Courier, monospace; font-size: 13px; font-weight: bold; color: #555; letter-spacing: 0.3px; }
  #workskin .slack-channel em { font-style: normal; }
  #workskin .slack-channel-hash { margin-right: 4px; opacity: 0.5; }
  #workskin .slack-messages { padding: 8px 18px 14px; list-style-type: none; }
  #workskin .slack-messages dt { font-family: 'Courier New', Courier, monospace; font-size: 13px; font-weight: bold; margin-top: 12px; margin-bottom: 2px; border-top: none; padding-top: 0; }
  #workskin .slack-messages dt:first-of-type { margin-top: 0; }
  #workskin .slack-messages dt em { font-style: normal; }
  #workskin .slack-messages dd { font-family: Verdana, Geneva, Tahoma, sans-serif; font-size: 14px; line-height: 1.6; color: #333; margin-left: 0; margin-bottom: 4px; padding-left: 12px; border-left: 3px solid #ddd; }
  #workskin .slack-messages dd em { font-style: normal; }
  #workskin .msg-bekki { border-left-color: #b91c1c; }
  #workskin .msg-kenjaku { border-left-color: #1d4ed8; }
  #workskin .msg-advisor1 { border-left-color: #15803d; }
  #workskin .msg-advisor2 { border-left-color: #b45309; }
  #workskin .msg-advisor3 { border-left-color: #7c3aed; }
  #workskin .slack-typing { font-family: 'Courier New', Courier, monospace; font-size: 11px; font-style: italic; color: #999; padding-top: 8px; padding-bottom: 4px; margin-top: 6px; opacity: 0.5; }
  #workskin .slack-time { font-weight: 600; font-size: 10px; margin-left: 6px; opacity: 0.72; }
  #workskin .user-bekki { color: #b91c1c; }
  #workskin .user-kenjaku { color: #1d4ed8; }
  #workskin .user-advisor1 { color: #15803d; }
  #workskin .user-advisor2 { color: #b45309; }
  #workskin .user-advisor3 { color: #7c3aed; }

  /* STICKY NOTE */
  #workskin .sticky-note { background: #fef3a7; color: #2a2a2a; padding: 22px 26px; margin: 1.8em auto; max-width: 340px; font-family: 'Comic Sans MS', 'Marker Felt', cursive; font-size: 21px; font-weight: 700; line-height: 1.5; transform: rotate(-1.2deg); box-shadow: 2px 3px 8px rgba(0,0,0,0.12), inset 0 -2px 4px rgba(0,0,0,0.04); border-bottom-right-radius: 12px 8px; position: relative; }
  #workskin .sticky-note::after { content: ''; position: absolute; bottom: 0; right: 0; width: 20px; height: 20px; background: linear-gradient(135deg, #fef3a7 45%, #e8d98a 50%, #d4c472 100%); border-bottom-right-radius: 6px; }
  #workskin .sticky-note .fallback-bracket { display: none; }
  #workskin .handwritten-note { background-color: #fff; color: #2a2a2a; padding: 18px 22px; margin-top: 1.2em; margin-bottom: 1.2em; margin-left: auto; margin-right: auto; max-width: 360px; font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-size: 18px; line-height: 1.6; border: 1px solid #ddd; box-shadow: 1px 2px 6px rgba(0,0,0,0.08); }
  #workskin .handwritten-note .fallback-bracket { display: none; }
  #workskin .phone-badge { font-family: 'Courier New', Courier, monospace; font-size: 13px; font-weight: bold; color: #555; background-color: #f0f0f0; padding: 6px 14px; border-radius: 12px; display: inline-block; margin-top: 0.6em; margin-bottom: 0.6em; }
  #workskin .email-block { background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 4px; padding: 16px 20px; margin-top: 1em; margin-bottom: 1em; }
  #workskin .email-block p { margin-top: 0; }
  #workskin .email-block strong { font-weight: normal; }
  #workskin .email-subject { font-family: 'Courier New', Courier, monospace; font-size: 13px; font-weight: bold; color: #333; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #eee; }
  #workskin .email-subject strong { font-weight: bold; }
  #workskin .email-body { font-family: Verdana, Geneva, Tahoma, sans-serif; font-size: 14px; line-height: 1.6; color: #444; margin-bottom: 0.8em; }
  #workskin .email-body:last-child { margin-bottom: 0; }
  #workskin .math-exp { white-space: nowrap; }
  #workskin .math-caret { display: none; }
  #workskin .math-power { font-size: 0.72em; vertical-align: super; line-height: 0; }
  #workskin ul { list-style-type: disc; margin-top: 0.8em; margin-bottom: 1em; margin-left: 1.3em; padding-left: 1.1em; }
  #workskin ol { list-style-type: decimal; margin-top: 0.8em; margin-bottom: 1em; margin-left: 1.3em; padding-left: 1.2em; }
  #workskin li { margin-bottom: 0.45em; }
  #workskin li:last-child { margin-bottom: 0; }

  /* RED INK + GRADE */
  #workskin .red-ink { font-family: 'Comic Sans MS', 'Marker Felt', cursive; font-size: 19px; font-weight: 700; color: #c0392b; margin-top: 0.5em; margin-bottom: 0.5em; padding-left: 1.2em; line-height: 1.6; }
  #workskin .red-ink::before { content: '✗'; margin-right: 8px; font-size: 14px; opacity: 0.6; }
  #workskin .red-ink p { display: inline; margin: 0; }
  #workskin .grade-mark { text-align: center; margin-top: 1.5em; margin-bottom: 0.4em; font-family: 'Comic Sans MS', 'Marker Felt', cursive; font-weight: 700; font-size: 42px; color: #c0392b; line-height: 1; }
  #workskin .grade-comment { text-align: center; font-family: 'Comic Sans MS', 'Marker Felt', cursive; font-size: 18px; color: #c0392b; margin-bottom: 1.5em; opacity: 0.85; }
  #workskin .scene-break-noodles { text-align: center; margin-top: 2.3em; margin-bottom: 2.3em; font-size: 15px; color: #8a673d; }

  /* SYSTEM */
  #workskin .tablet-display { margin-top: 1.2em; margin-bottom: 1.2em; padding: 12px 20px; background-color: #1a1a2e; color: #e0e0e0; font-family: 'Courier New', Courier, monospace; font-size: 14px; font-weight: bold; border-radius: 6px; border: 1px solid #333; text-align: left; }
  #workskin .tablet-error { color: #ff6b6b; border-left: 3px solid #ff4444; }
  #workskin .tablet-instruction { color: #8ac4ff; border-left: 3px solid #5a9fd4; }
`;

const AO3_BASE_CSS = `
  #workskin .slack-workspace { margin-top: 1.2em; margin-bottom: 1.2em; }
  #workskin .slack-channel { margin-bottom: 0.5em; }
  #workskin blockquote { margin: 1.2em 2.5em; border-left: 3px solid #ccc; padding-left: 1em; padding-top: 0.3em; padding-bottom: 0.3em; }
  #workskin blockquote + blockquote { margin-top: 1.5em; }
  #workskin dl { margin: 0; }
  #workskin dt { margin-top: 1.2em; padding-top: 0.5em; border-top: 1px solid #e0e0e0; }
  #workskin dt:first-of-type { margin-top: 0; padding-top: 0; border-top: none; }
  #workskin dd { margin-left: 0; margin-bottom: 0.6em; }
  #workskin ul { list-style-type: disc; margin-top: 0.8em; margin-bottom: 1em; margin-left: 1.3em; padding-left: 1.1em; }
  #workskin ol { list-style-type: decimal; margin-top: 0.8em; margin-bottom: 1em; margin-left: 1.3em; padding-left: 1.2em; }
  #workskin li { margin-bottom: 0.45em; }
  #workskin li:last-child { margin-bottom: 0; }
  #workskin .scene-break-noodles { text-align: center; margin-top: 2.3em; margin-bottom: 2.3em; }
`;

const DRAFT_KEY = "ao3-formatter-draft-v1";

let idCounter = 0;

function readSavedDraft() {
  if (typeof window === "undefined") return null;

  try {
    const savedDraft = window.localStorage.getItem(DRAFT_KEY);
    if (!savedDraft) return null;

    const draft = JSON.parse(savedDraft);
    if (!draft || draft.version !== 1) return null;

    if (Array.isArray(draft.paragraphs) && draft.paragraphs.length > 0) {
      idCounter = Math.max(idCounter, ...draft.paragraphs.map((paragraph) => paragraph.id));
    }

    return draft;
  } catch {
    return null;
  }
}

function makeId() {
  return ++idCounter;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatBracketedFallbackText(value) {
  const text = formatInlineMarkup(value);
  const match = text.match(/^\[(.*)\]$/s);
  if (!match) return text;

  return `<span class="fallback-bracket">[</span>${match[1]}<span class="fallback-bracket">]</span>`;
}

function formatInlineMarkup(value) {
  return escapeHtml(value)
    .replace(/&lt;(\/?)(sup|sub)&gt;/gi, "<$1$2>")
    .replace(/\^(\{[^}]+\}|\([^)]+\)|[A-Za-z0-9+\-]+)/g, (_, exponent) => {
      const normalized = exponent.replace(/^[({]/, "").replace(/[)}]$/, "");
      return `<span class="math-exp"><span class="math-caret">^</span><span class="math-power">${normalized}</span></span>`;
    });
}

function cleanLine(line) {
  return line.replace(/^(?:\s*>\s*)+/, "").trim();
}

function cleanText(raw) {
  return raw.split("\n")
    .map(cleanLine)
    .join(" ")
    .replace(/\*\*\*(.*?)\*\*\*/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .trim();
}

function stripHtmlTags(value) {
  return String(value)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractInlineMarkup(node) {
  if (!node) return "";

  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  if (node.nodeName === "BR") {
    return "\n";
  }

  const tagName = node.nodeName.toLowerCase();
  const children = Array.from(node.childNodes).map(extractInlineMarkup).join("");

  if (tagName === "sup" || tagName === "sub") {
    return `<${tagName}>${children}</${tagName}>`;
  }

  return children;
}

function stripWrappingAsterisks(value) {
  return value.replace(/^\*(.*?)\*$/s, "$1").trim();
}

function parseListLine(line) {
  const orderedMatch = line.match(/^\d+[.)]\s+(.+)$/);
  if (orderedMatch) {
    return { kind: "ol", text: orderedMatch[1].trim() };
  }

  const unorderedMatch = line.match(/^(?:[-+*•])\s+(.+)$/);
  if (unorderedMatch) {
    return { kind: "ul", text: unorderedMatch[1].trim() };
  }

  return null;
}

function parseMarkdownListItem(raw) {
  const cleanedLine = cleanLine(raw).trim();
  const parsedLine = parseListLine(cleanedLine);
  if (!parsedLine) return null;

  const unwrapped = stripWrappingAsterisks(parsedLine.text);
  if (!unwrapped || /^([*•·\-=\s]|&nbsp;)+$/i.test(unwrapped)) return null;

  const isItalic = /^\*(.+)\*$/.test(parsedLine.text);

  return {
    kind: parsedLine.kind,
    text: unwrapped,
    type: isItalic ? "thought" : "prose",
  };
}

function parseMarkdownListSequence(lines) {
  const normalizedLines = lines
    .map((line) => line.replace(/<br\s*\/?>/gi, "\n"))
    .join("\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (normalizedLines.length < 2) return null;

  const items = normalizedLines.map((line) => {
    const parsed = parseMarkdownListItem(line);
    return parsed ? { ...parsed, raw: line } : null;
  });

  if (items.some((item) => item == null)) return null;
  return items;
}

function parseBasicList(raw) {
  const htmlListSource = raw.match(/<(ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/i)?.[0] ?? raw;
  if (/<li\b/i.test(htmlListSource)) {
    const listKindMatch = raw.match(/<(ul|ol)\b/i);
    const kind = listKindMatch?.[1]?.toLowerCase() ?? "ul";
    const itemMatches = [...htmlListSource.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)];
    if (itemMatches.length > 0) {
      return {
        kind,
        items: itemMatches
          .map((match) => stripWrappingAsterisks(stripHtmlTags(match[1])))
          .filter(Boolean),
      };
    }
  }

  const markdownItalicItems = [
    ...raw.matchAll(/(^|[\n\r]|<br\s*\/?>)\s*\*(.+?)\*\s*(?=$|[\n\r]|<br\s*\/?>)/gi),
  ].map((match) => stripWrappingAsterisks(stripHtmlTags(match[2])));

  if (markdownItalicItems.length >= 2) {
    return {
      kind: "ul",
      items: markdownItalicItems.filter(Boolean),
    };
  }

  const cleanedLines = raw
    .replace(/<br\s*\/?>/gi, "\n")
    .split("\n")
    .map(cleanLine)
    .map((line) => line.trim())
    .filter(Boolean);

  if (cleanedLines.length < 2) return null;

  const parsedLines = cleanedLines.map(parseListLine);
  if (parsedLines.some((item) => item == null)) return null;

  return {
    kind: parsedLines.every((item) => item.kind === "ol") ? "ol" : "ul",
    items: parsedLines.map((item) => stripWrappingAsterisks(item.text)),
  };
}

function parseLabel(rawText) {
  const cleaned = cleanText(rawText);
  const from = cleaned.match(/^From:\s*(.+?)\.?\s*$/i);
  if (from) {
    return {
      speaker: from[1].replace(/\.$/, "").trim(),
      direction: "received",
      prefix: "From: ",
    };
  }

  const to = cleaned.match(/^To:\s*(.+?)\.?\s*$/i);
  if (to) {
    return {
      speaker: to[1].replace(/\.$/, "").trim(),
      direction: "sent",
      prefix: "To: ",
    };
  }

  return null;
}

function parseSlackChannel(text) {
  const match = text.match(/^#\s*(.+)$/);
  return match ? match[1].trim() : null;
}

function parseSlackSpeakerLine(text) {
  const match = text.match(/^(.+?):\s*(\d{1,2}:\d{2})$/);
  if (!match) return null;

  return {
    speakerName: match[1].trim(),
    timestamp: match[2],
  };
}

function isEmailSubjectLine(text) {
  return text.startsWith("[") || /^Subject:/i.test(text);
}

function findSlackSpeakerByName(name) {
  const normalizedName = name.trim().toLowerCase();
  return SLACK_SPEAKERS.find((speaker) => speaker.name.toLowerCase() === normalizedName) ?? null;
}

function getSlackSpeakerKey(speaker) {
  if (!speaker) return "";
  return speaker.userClass || speaker.name || "";
}

function isBlockquoted(raw) {
  return raw.split("\n").some((line) => line.trimStart().startsWith(">"));
}

function getSelectionOffsetWithinElement(element) {
  if (!element || typeof window === "undefined") return null;

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (!element.contains(range.startContainer)) return null;

  const preRange = range.cloneRange();
  preRange.selectNodeContents(element);
  preRange.setEnd(range.startContainer, range.startOffset);
  return preRange.toString().length;
}

export default function AO3Formatter() {
  const [phase, setPhase] = useState("import");
  const [paragraphs, setParagraphs] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [previewMode, setPreviewMode] = useState("skin-on");
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedCss, setCopiedCss] = useState(false);
  const [importMode, setImportMode] = useState("raw");
  const [rawInput, setRawInput] = useState("");
  const [importFileName, setImportFileName] = useState("");
  const [pendingScrollId, setPendingScrollId] = useState(null);
  const [draftStatus, setDraftStatus] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [lastDeletedRows, setLastDeletedRows] = useState(null);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [stickyHeaderHeight, setStickyHeaderHeight] = useState(70);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const previewPaneRef = useRef(null);
  const editInputRef = useRef(null);
  const stickyHeaderRef = useRef(null);
  const selectedRows = useMemo(
    () => paragraphs.filter((paragraph) => selected.has(paragraph.id)),
    [paragraphs, selected]
  );
  const editingParagraph = useMemo(
    () => paragraphs.find((paragraph) => paragraph.id === editingId) ?? null,
    [editingId, paragraphs]
  );

  const handleImport = () => {
    const raw = rawInput;
    const lines = raw.split("\n");
    const nextParagraphs = [];
    let buffer = [];

    const pushParagraph = ({
      raw: paragraphRaw,
      text,
      type,
      speaker = "",
      timestamp = "",
      slackSpeaker = null,
      isLabel = false,
      labelPrefix = "",
      listKind = "",
      wasBlockquoted = false,
      isChannelHeader = false,
    }) => {
      nextParagraphs.push({
        id: makeId(),
        raw: paragraphRaw,
        text,
        type,
        speaker,
        timestamp,
        slackSpeaker,
        isLabel,
        labelPrefix,
        listKind,
        wasBlockquoted,
        isChannelHeader,
      });
    };

    const flush = () => {
      if (buffer.length === 0) return;

      const markdownListSequence = parseMarkdownListSequence(buffer);
      if (markdownListSequence) {
        markdownListSequence.forEach((item) => {
          pushParagraph({
            raw: item.raw,
            text: item.text,
            type: item.type,
            listKind: item.kind,
          });
        });
        buffer = [];
        return;
      }

      const joined = buffer.join("\n");
      const rawTrimmed = joined.trim();
      const cleaned = cleanText(joined);
      if (cleaned === "") {
        buffer = [];
        return;
      }

      const markdownListItem = parseMarkdownListItem(joined);
      let type = "prose";
      let text = markdownListItem?.text ?? cleaned;
      let speaker = "";
      let timestamp = "";
      let slackSpeaker = null;
      let isLabel = false;
      let labelPrefix = "";
      let isChannelHeader = false;
      let listKind = markdownListItem?.kind ?? "";
      const wasBlockquoted = isBlockquoted(joined);

      if (rawTrimmed === "* * *" || rawTrimmed === "· · ·" || rawTrimmed === "---") {
        type = "scene-break";
      } else if (/^(USER INPUT|WARNING|SIMULATION|A CRITI)/.test(cleaned)) {
        type = cleaned.includes("WARNING") || cleaned.includes("CRITI")
          ? "system-error"
          : "system-message";
      } else if (markdownListItem) {
        type = markdownListItem.type;
      } else if (joined.trim().startsWith("*") && joined.trim().endsWith("*") && !joined.trim().startsWith("**")) {
        type = "thought";
      }

      const label = parseLabel(joined);
      if (label) {
        type = label.direction === "sent" ? "text-sent" : "text-received";
        speaker = label.speaker;
        isLabel = true;
        labelPrefix = label.prefix;
        listKind = "";
      } else if (wasBlockquoted && type === "prose") {
        type = "text-received";
        listKind = "";
      }

      if (parseSlackChannel(cleaned)) {
        isChannelHeader = true;
      }

      pushParagraph({
        raw: joined,
        text,
        type,
        speaker,
        timestamp,
        slackSpeaker,
        isLabel,
        labelPrefix,
        listKind,
        wasBlockquoted,
        isChannelHeader,
      });
      buffer = [];
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed === "" || /^>(\s*>)*\s*$/.test(trimmed)) {
        flush();
      } else {
        buffer.push(line);
      }
    });

    flush();
    setParagraphs(nextParagraphs);
    setSelected(new Set());
    setShowPreview(false);
    setPreviewMode("skin-on");
    setPhase("tag");
  };

  const handleHtmlImport = useCallback(() => {
    if (typeof window === "undefined" || rawInput.trim().length === 0) return;

    const parser = new window.DOMParser();
    const doc = parser.parseFromString(rawInput, "text/html");
    const nextParagraphs = [];

    const pushParagraph = ({
      raw: paragraphRaw,
      text,
      type,
      speaker = "",
      timestamp = "",
      slackSpeaker = null,
      isLabel = false,
      labelPrefix = "",
      listKind = "",
      wasBlockquoted = false,
      isChannelHeader = false,
    }) => {
      const cleanedText = text?.trim() ?? "";
      if (!cleanedText && type !== "scene-break" && type !== "scene-break-noodles") return;

      nextParagraphs.push({
        id: makeId(),
        raw: paragraphRaw ?? cleanedText,
        text: cleanedText,
        type,
        speaker,
        timestamp,
        slackSpeaker,
        isLabel,
        labelPrefix,
        listKind,
        wasBlockquoted,
        isChannelHeader,
      });
    };

    const getText = (node) => node?.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    const getMarkupText = (node) => extractInlineMarkup(node).replace(/\u00a0/g, " ").trim();

    const parseTextThread = (threadNode) => {
      threadNode.querySelectorAll(":scope > blockquote.text-msg").forEach((bubble) => {
        const direction = bubble.classList.contains("sent") ? "sent" : "received";
        const type = direction === "sent" ? "text-sent" : "text-received";
        const labelNode = bubble.querySelector(":scope > .msg-label");

        if (labelNode) {
          const prefixNode = labelNode.querySelector(".msg-dir");
          const prefix = prefixNode ? getText(prefixNode) : "From: ";
          const labelText = getText(labelNode);
          const speaker = labelText.replace(prefix, "").trim();
          pushParagraph({
            raw: labelNode.outerHTML,
            text: labelText,
            type,
            speaker,
            isLabel: true,
            labelPrefix: prefix || "From: ",
            wasBlockquoted: true,
          });
        }

        bubble.querySelectorAll(":scope > p:not(.msg-label)").forEach((messageNode) => {
          pushParagraph({
            raw: messageNode.outerHTML,
            text: getMarkupText(messageNode),
            type,
            speaker: "",
            wasBlockquoted: true,
          });
        });
      });
    };

    const parseSlackWorkspace = (workspaceNode) => {
      const channelNode = workspaceNode.querySelector(":scope > .slack-channel");
      if (channelNode) {
        const hashNode = channelNode.querySelector(".slack-channel-hash");
        const hashText = hashNode ? getText(hashNode) : "#";
        const channelText = getText(channelNode).replace(hashText, "").trim();
        pushParagraph({
          raw: channelNode.outerHTML,
          text: `#${channelText}`,
          type: "slack-message",
          isChannelHeader: true,
        });
      }

      let currentSpeaker = null;
      let currentTimestamp = "";

      workspaceNode.querySelectorAll(":scope > .slack-messages > *").forEach((node) => {
        if (node.matches("dt")) {
          const timeNode = node.querySelector(".slack-time");
          const timestamp = timeNode ? getText(timeNode) : "";
          const fullText = getText(node);
          const speakerName = timestamp ? fullText.replace(timestamp, "").trim() : fullText;
          const slackSpeaker = findSlackSpeakerByName(speakerName) ?? (speakerName
            ? { name: speakerName, userClass: node.className || "" }
            : null);

          currentSpeaker = slackSpeaker;
          currentTimestamp = timestamp;

          pushParagraph({
            raw: node.outerHTML,
            text: timestamp ? `${speakerName}: ${timestamp}` : speakerName,
            type: "slack-message",
            slackSpeaker,
            timestamp,
          });
          return;
        }

        if (node.matches("dd")) {
          const slackSpeaker = currentSpeaker ?? null;
          pushParagraph({
            raw: node.outerHTML,
            text: getMarkupText(node),
            type: "slack-message",
            slackSpeaker,
            timestamp: currentTimestamp,
          });
          return;
        }

        if (node.matches(".slack-typing")) {
          pushParagraph({
            raw: node.outerHTML,
            text: getText(node),
            type: "slack-typing",
          });
        }
      });
    };

    const parseList = (listNode) => {
      const listKind = listNode.tagName.toLowerCase();
      listNode.querySelectorAll(":scope > li").forEach((itemNode) => {
        const hasEmphasis = Boolean(itemNode.querySelector("em"));
        pushParagraph({
          raw: itemNode.outerHTML,
          text: getMarkupText(itemNode),
          type: hasEmphasis ? "thought" : "prose",
          listKind,
        });
      });
    };

    const parseEmail = (emailNode) => {
      emailNode.querySelectorAll(":scope > p").forEach((lineNode) => {
        pushParagraph({
          raw: lineNode.outerHTML,
          text: getMarkupText(lineNode),
          type: "email",
        });
      });
    };

    const parseParagraphNode = (node) => {
      const text = getMarkupText(node);
      if (!text) return;

      if (node.querySelector(".phone-badge")) {
        pushParagraph({ raw: node.outerHTML, text, type: "phone-badge" });
        return;
      }

      if (node.classList.contains("bt-notify")) {
        pushParagraph({ raw: node.outerHTML, text, type: "bt-notify" });
        return;
      }

      if (node.classList.contains("tablet-error")) {
        pushParagraph({ raw: node.outerHTML, text, type: "system-error" });
        return;
      }

      if (node.classList.contains("tablet-display") || node.classList.contains("tablet-instruction")) {
        pushParagraph({ raw: node.outerHTML, text, type: "system-message" });
        return;
      }

      if (node.classList.contains("scene-break-noodles")) {
        pushParagraph({ raw: node.outerHTML, text: "∞ 🍜 ∞", type: "scene-break-noodles" });
        return;
      }

      if (text === "· · ·") {
        pushParagraph({ raw: node.outerHTML, text, type: "scene-break" });
        return;
      }

      const hasOnlyEmphasis = Boolean(node.querySelector("em")) && !node.querySelector("strong");
      pushParagraph({
        raw: node.outerHTML,
        text,
        type: hasOnlyEmphasis ? "thought" : "prose",
      });
    };

    const visitNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim() ?? "";
        if (text) {
          pushParagraph({ raw: text, text, type: "prose" });
        }
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return;

      if (node.matches(".text-thread")) {
        parseTextThread(node);
        return;
      }

      if (node.matches(".slack-workspace")) {
        parseSlackWorkspace(node);
        return;
      }

      if (node.matches("ul, ol")) {
        parseList(node);
        return;
      }

      if (node.matches("blockquote.email-block, .email-block")) {
        parseEmail(node);
        return;
      }

      if (node.matches(".sticky-note")) {
        pushParagraph({ raw: node.outerHTML, text: getMarkupText(node), type: "sticky-note" });
        return;
      }

      if (node.matches(".handwritten-note")) {
        pushParagraph({ raw: node.outerHTML, text: getMarkupText(node), type: "handwritten-note" });
        return;
      }

      if (node.matches(".red-ink")) {
        pushParagraph({ raw: node.outerHTML, text: getMarkupText(node), type: "red-ink" });
        return;
      }

      if (node.matches(".grade-mark")) {
        pushParagraph({ raw: node.outerHTML, text: getMarkupText(node), type: "grade-mark" });
        return;
      }

      if (node.matches(".grade-comment")) {
        pushParagraph({ raw: node.outerHTML, text: getMarkupText(node), type: "grade-comment" });
        return;
      }

      if (node.matches("p")) {
        parseParagraphNode(node);
        return;
      }

      Array.from(node.childNodes).forEach(visitNode);
    };

    Array.from(doc.body.childNodes).forEach(visitNode);

    setParagraphs(nextParagraphs);
    setSelected(new Set());
    setShowPreview(false);
    setPreviewMode("skin-on");
    setPhase("tag");
    setDraftStatus("HTML re-imported");
  }, [rawInput]);

  const handleFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    setRawInput(text);
    setImportFileName(file.name);

    // Allow re-selecting the same file later.
    event.target.value = "";
  };

  const toggleSelect = useCallback((id, event) => {
    setSelected((previous) => {
      const next = new Set(previous);

      if (event.shiftKey && previous.size > 0) {
        const ids = paragraphs.map((paragraph) => paragraph.id);
        const last = [...previous].pop();
        const from = ids.indexOf(last);
        const to = ids.indexOf(id);
        const [start, end] = from < to ? [from, to] : [to, from];
        for (let index = start; index <= end; index += 1) {
          next.add(ids[index]);
        }
      } else if (event.metaKey || event.ctrlKey) {
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
      } else if (next.size === 1 && next.has(id)) {
        next.clear();
      } else {
        next.clear();
        next.add(id);
      }

      return next;
    });
  }, [paragraphs]);

  const scrollPreviewToParagraph = useCallback((paragraphId) => {
    const scrollToTarget = () => {
      const target = previewPaneRef.current?.querySelector(`[data-preview-id="${paragraphId}"]`);
      if (!target) return false;

      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
      return true;
    };

    if (!showPreview) {
      setPendingScrollId(paragraphId);
      setPreviewMode("skin-on");
      setShowPreview(true);
      return;
    }

    if (previewMode === "html") {
      setPendingScrollId(paragraphId);
      setPreviewMode("skin-on");
      return;
    }

    if (!scrollToTarget()) {
      setPendingScrollId(paragraphId);
    }
  }, [previewMode, showPreview]);

  const handleParagraphClick = useCallback((paragraphId, event) => {
    const isMultiSelectGesture = event.shiftKey || event.metaKey || event.ctrlKey || selected.size > 1;
    toggleSelect(paragraphId, event);

    if (!isMultiSelectGesture) {
      scrollPreviewToParagraph(paragraphId);
    }
  }, [scrollPreviewToParagraph, selected.size, toggleSelect]);

  const applyType = (type) => {
    if (selected.size === 0) return;

    setParagraphs((current) => current.map((paragraph) => {
      if (!selected.has(paragraph.id)) return paragraph;
      if (paragraph.type === type) {
        return { ...paragraph, type: "prose", speaker: "", slackSpeaker: null, isLabel: false };
      }
      const clearsList = type !== "prose" && type !== "thought";
      return {
        ...paragraph,
        type,
        listKind: clearsList ? "" : paragraph.listKind,
      };
    }));
  };

  const applyListKind = (kind) => {
    if (selected.size === 0) return;

    const selectedRows = paragraphs.filter((paragraph) => selected.has(paragraph.id));
    const eligibleRows = selectedRows.filter((paragraph) => paragraph.type === "prose" || paragraph.type === "thought");
    if (eligibleRows.length === 0) return;

    const shouldClearList = eligibleRows.every((paragraph) => paragraph.listKind === kind);

    setParagraphs((current) => current.map((paragraph) => {
      if (!selected.has(paragraph.id)) return paragraph;
      if (paragraph.type !== "prose" && paragraph.type !== "thought") return paragraph;

      return {
        ...paragraph,
        listKind: shouldClearList ? "" : kind,
      };
    }));
  };

  const applySlackSpeaker = (speaker) => {
    if (selected.size === 0) return;

    setParagraphs((current) => current.map((paragraph) =>
      selected.has(paragraph.id) && paragraph.type === "slack-message"
        ? { ...paragraph, slackSpeaker: speaker }
        : paragraph
    ));
  };

  const applyTextSpeaker = (name, direction) => {
    if (selected.size === 0) return;

    const nextType = direction === "sent" ? "text-sent" : "text-received";
    setParagraphs((current) => {
      const next = current.map((paragraph) => ({ ...paragraph }));

      const syncPrecedingLabel = (startIndex) => {
        for (let index = startIndex - 1; index >= 0; index -= 1) {
          const candidate = next[index];
          const isTextParagraph = candidate.type === "text-received" || candidate.type === "text-sent";
          if (!isTextParagraph) break;

          if (candidate.isLabel) {
            candidate.type = nextType;
            const existingLabel = parseLabel(candidate.raw || candidate.text);
            if (existingLabel?.prefix === "To: ") {
              candidate.speaker = existingLabel.speaker;
              candidate.labelPrefix = "To: ";
            } else {
              candidate.speaker = name;
              candidate.labelPrefix = "From: ";
            }
            return;
          }
        }
      };

      next.forEach((paragraph, index) => {
        if (!selected.has(paragraph.id)) return;
        if (paragraph.type !== "text-received" && paragraph.type !== "text-sent") return;

        const label = parseLabel(paragraph.raw || paragraph.text);
        if (label) {
          paragraph.type = nextType;
          paragraph.isLabel = true;
          if (label.prefix === "To: ") {
            paragraph.speaker = label.speaker;
            paragraph.labelPrefix = "To: ";
          } else {
            paragraph.speaker = name;
            paragraph.labelPrefix = "From: ";
          }
          return;
        }

        paragraph.speaker = name;
        paragraph.type = nextType;
        paragraph.isLabel = false;
        paragraph.labelPrefix = "";
        syncPrecedingLabel(index);
      });

      return next;
    });
  };

  const applyTimestamp = (timestamp) => {
    if (selected.size === 0) return;
    setParagraphs((current) => current.map((paragraph) =>
      selected.has(paragraph.id) ? { ...paragraph, timestamp } : paragraph
    ));
  };

  const startEditingParagraph = useCallback((paragraph) => {
    setEditingId(paragraph.id);
    setEditingValue(paragraph.raw || paragraph.text);
  }, []);

  const cancelEditingParagraph = useCallback(() => {
    setEditingId(null);
    setEditingValue("");
  }, []);

  const saveEditingParagraph = useCallback(() => {
    if (editingId == null) return;

    const nextRaw = editingValue.trim();
    if (!nextRaw) {
      cancelEditingParagraph();
      return;
    }

    setParagraphs((current) => current.map((paragraph) => {
      if (paragraph.id !== editingId) return paragraph;

      const cleaned = cleanText(editingValue);
      const markdownListItem = parseMarkdownListItem(editingValue);
      const reparsedLabel = parseLabel(editingValue);
      const reparsedSlackLine = parseSlackSpeakerLine(cleaned);

      if (reparsedLabel) {
        return {
          ...paragraph,
          raw: editingValue,
          text: cleaned,
          type: reparsedLabel.direction === "sent" ? "text-sent" : "text-received",
          speaker: reparsedLabel.speaker,
          isLabel: true,
          labelPrefix: reparsedLabel.prefix,
        };
      }

      if (paragraph.type === "slack-message" && reparsedSlackLine) {
        return {
          ...paragraph,
          raw: editingValue,
          text: cleaned,
          timestamp: reparsedSlackLine.timestamp,
          slackSpeaker: paragraph.slackSpeaker ?? findSlackSpeakerByName(reparsedSlackLine.speakerName),
        };
      }

      return {
        ...paragraph,
        raw: editingValue,
        text: markdownListItem?.text ?? cleaned,
        type: markdownListItem ? markdownListItem.type : paragraph.type,
        listKind: markdownListItem?.kind ?? "",
      };
    }));

    cancelEditingParagraph();
  }, [cancelEditingParagraph, editingId, editingValue]);

  const applyExponentFormat = useCallback(() => {
    if (editingId == null || !editInputRef.current) return;

    const textarea = editInputRef.current;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? start;
    const selectedText = editingValue.slice(start, end);
    const nextValue = selectedText
      ? `${editingValue.slice(0, start)}${selectedText.startsWith("^") ? selectedText : `^${selectedText}`}${editingValue.slice(end)}`
      : `${editingValue.slice(0, start)}^${editingValue.slice(end)}`;

    setEditingValue(nextValue);

    requestAnimationFrame(() => {
      if (!editInputRef.current) return;
      editInputRef.current.focus();
      const nextCaret = start + (selectedText ? (selectedText.startsWith("^") ? selectedText.length : selectedText.length + 1) : 1);
      editInputRef.current.setSelectionRange(nextCaret, nextCaret);
    });
  }, [editingId, editingValue]);

  const addRowAfterSelection = useCallback(() => {
    const selectedIds = [...selected];
    const anchorId = selectedIds[selectedIds.length - 1] ?? paragraphs[paragraphs.length - 1]?.id ?? null;
    const newId = makeId();

    const nextParagraph = {
      id: newId,
      raw: "",
      text: "",
      type: "prose",
      speaker: "",
      timestamp: "",
      slackSpeaker: null,
      isLabel: false,
      labelPrefix: "",
      listKind: "",
      wasBlockquoted: false,
      isChannelHeader: false,
    };

    setParagraphs((current) => {
      if (anchorId == null) return [...current, nextParagraph];

      const anchorIndex = current.findIndex((paragraph) => paragraph.id === anchorId);
      if (anchorIndex === -1) return [...current, nextParagraph];

      const next = [...current];
      next.splice(anchorIndex + 1, 0, nextParagraph);
      return next;
    });

    setSelected(new Set([newId]));
    setEditingId(newId);
    setEditingValue("");
    setDraftStatus("Row added");
  }, [paragraphs, selected]);

  const splitParagraph = useCallback((paragraph, sourceText, splitIndex, nextEditingValue = "") => {
    const before = sourceText.slice(0, splitIndex).trim();
    const after = sourceText.slice(splitIndex).trim();

    if (!before || !after) return false;

    const newId = makeId();
    const newType = paragraph.type;
    const newListKind = paragraph.listKind;

    setParagraphs((current) => {
      const next = current.map((item) => {
        if (item.id !== paragraph.id) return item;
        return {
          ...item,
          raw: before,
          text: cleanText(before),
          type: newType,
          listKind: newListKind,
        };
      });

      const sourceIndex = next.findIndex((item) => item.id === paragraph.id);
      if (sourceIndex === -1) return next;

      next.splice(sourceIndex + 1, 0, {
        ...paragraph,
        id: newId,
        raw: after,
        text: cleanText(after),
        type: newType,
        listKind: newListKind,
      });

      return next;
    });

    setSelected(new Set([newId]));
    setEditingId(newId);
    setEditingValue(nextEditingValue || after);
    setDraftStatus("Row split");
    return true;
  }, []);

  const splitEditingRow = useCallback(() => {
    if (editingId != null && editInputRef.current) {
      const currentParagraph = paragraphs.find((paragraph) => paragraph.id === editingId);
      if (!currentParagraph) return;
      if (currentParagraph.type !== "prose" && currentParagraph.type !== "thought") return;

      const textarea = editInputRef.current;
      const splitIndex = textarea.selectionStart ?? 0;
      splitParagraph(currentParagraph, editingValue, splitIndex, editingValue.slice(splitIndex).trim());
      return;
    }

    if (selectedRows.length !== 1) {
      setDraftStatus("Select one row to split");
      return;
    }

    const currentParagraph = selectedRows[0];
    if (currentParagraph.type !== "prose" && currentParagraph.type !== "thought") return;

    const rowTextElement = document.querySelector(`[data-row-text-id="${currentParagraph.id}"]`);
    const splitIndex = getSelectionOffsetWithinElement(rowTextElement);

    if (splitIndex == null) {
      startEditingParagraph(currentParagraph);
      setDraftStatus("Place a caret in edit mode, then split");
      return;
    }

    splitParagraph(currentParagraph, currentParagraph.text, splitIndex);
  }, [editingId, editingValue, paragraphs, selectedRows, splitParagraph, startEditingParagraph]);

  const deleteSelectedParagraphs = useCallback(() => {
    if (selected.size === 0) return;

    setParagraphs((current) => {
      const deletedRows = [];
      const remainingRows = [];

      current.forEach((paragraph, index) => {
        if (selected.has(paragraph.id)) {
          deletedRows.push({ paragraph, index });
        } else {
          remainingRows.push(paragraph);
        }
      });

      setLastDeletedRows(deletedRows.length > 0 ? deletedRows : null);
      return remainingRows;
    });

    if (editingId != null && selected.has(editingId)) {
      cancelEditingParagraph();
    }

    setSelected(new Set());
    setDraftStatus("Rows deleted");
  }, [cancelEditingParagraph, editingId, selected]);

  const undoDeleteParagraphs = useCallback(() => {
    if (!lastDeletedRows || lastDeletedRows.length === 0) return;

    setParagraphs((current) => {
      const next = [...current];
      [...lastDeletedRows]
        .sort((a, b) => a.index - b.index)
        .forEach(({ paragraph, index }) => {
          next.splice(index, 0, paragraph);
        });
      return next;
    });

    setLastDeletedRows(null);
    setDraftStatus("Delete undone");
  }, [lastDeletedRows]);

  const generateHTML = useMemo(() => {
    const output = [];
    let inSlack = false;
    let inThread = false;
    let inEmail = false;
    let inList = false;
    let bubbleOpen = false;
    let currentDirection = null;
    let currentSlackSpeaker = null;
    let currentSlackTimestamp = "";
    let currentListKind = "";

    const closeSlack = () => {
      if (!inSlack) return;
      output.push("    </dl>");
      output.push("  </div>");
      inSlack = false;
      currentSlackSpeaker = null;
      currentSlackTimestamp = "";
    };

    const closeBubble = () => {
      if (!bubbleOpen) return;
      output.push("  </blockquote>");
      bubbleOpen = false;
    };

    const closeEmail = () => {
      if (!inEmail) return;
      output.push(`  </blockquote>`);
      inEmail = false;
    };

    const closeList = () => {
      if (!inList) return;
      output.push(`</${currentListKind}>`);
      inList = false;
      currentListKind = "";
    };

    const closeThread = () => {
      closeBubble();
      if (inThread) {
        output.push("</div>");
        inThread = false;
      }
      currentDirection = null;
    };

    const activeParagraphs = paragraphs.filter((paragraph) => paragraph.type !== "skip");

    activeParagraphs.forEach((paragraph) => {
      const text = formatInlineMarkup(paragraph.text);
      const isListRow = Boolean(paragraph.listKind) && (paragraph.type === "prose" || paragraph.type === "thought");
      const listData = isListRow ? null : parseBasicList(paragraph.raw || paragraph.text);
      const isText = paragraph.type === "text-received" || paragraph.type === "text-sent";
      const direction = paragraph.type === "text-sent" ? "sent" : "received";
      const isSlackType = paragraph.type === "slack-message" || paragraph.type === "slack-typing";
      const isEmailType = paragraph.type === "email";

      if (!isSlackType) closeSlack();
      if (!isText) closeThread();
      if (!isEmailType) closeEmail();
      if (!isListRow) closeList();

      switch (paragraph.type) {
        case "prose":
          if (isListRow) {
            if (!inList || currentListKind !== paragraph.listKind) {
              closeList();
              output.push(`<${paragraph.listKind}>`);
              inList = true;
              currentListKind = paragraph.listKind;
            }
            output.push(`<li data-preview-id="${paragraph.id}">${text}</li>`);
            break;
          }
          if (listData) {
            output.push(
              `<${listData.kind} data-preview-id="${paragraph.id}">${listData.items
                .map((item) => `<li>${escapeHtml(item)}</li>`)
                .join("")}</${listData.kind}>`
            );
            break;
          }
          output.push(`<p data-preview-id="${paragraph.id}">${text}</p>`);
          break;
        case "thought":
          if (isListRow) {
            if (!inList || currentListKind !== paragraph.listKind) {
              closeList();
              output.push(`<${paragraph.listKind}>`);
              inList = true;
              currentListKind = paragraph.listKind;
            }
            output.push(`<li data-preview-id="${paragraph.id}"><em>${text}</em></li>`);
            break;
          }
          if (listData) {
            output.push(
              `<${listData.kind} data-preview-id="${paragraph.id}">${listData.items
                .map((item) => `<li><em>${escapeHtml(item)}</em></li>`)
                .join("")}</${listData.kind}>`
            );
            break;
          }
          output.push(`<p data-preview-id="${paragraph.id}"><em>${text}</em></p>`);
          break;
        case "scene-break":
          output.push(`<p data-preview-id="${paragraph.id}" style="text-align: center; letter-spacing: 8px; color: #999;">· · ·</p>`);
          break;
        case "scene-break-noodles":
          output.push(`<p data-preview-id="${paragraph.id}" class="scene-break-noodles">∞ 🍜 ∞</p>`);
          break;
        case "bt-notify":
          output.push(`<p data-preview-id="${paragraph.id}" class="bt-notify"><strong>${text}</strong></p>`);
          break;
        case "handwritten-note":
          output.push(`<div data-preview-id="${paragraph.id}" class="handwritten-note">${formatBracketedFallbackText(paragraph.text)}</div>`);
          break;
        case "phone-badge":
          output.push(`<p data-preview-id="${paragraph.id}"><span class="phone-badge">${text}</span></p>`);
          break;
        case "email":
          if (!inEmail) {
            output.push(`  <blockquote class="email-block">`);
            inEmail = true;
          }
          if (isEmailSubjectLine(text)) {
            output.push(`    <p data-preview-id="${paragraph.id}" class="email-subject"><strong>${text}</strong></p>`);
          } else {
            output.push(`    <p data-preview-id="${paragraph.id}" class="email-body"><strong>${text}</strong></p>`);
          }
          break;
        case "system-message":
          output.push(`<p data-preview-id="${paragraph.id}" class="tablet-display tablet-instruction" style="text-align: center;"><strong>${text}</strong></p>`);
          break;
        case "system-error":
          output.push(`<p data-preview-id="${paragraph.id}" class="tablet-display tablet-error" style="text-align: center;"><strong>${text}</strong></p>`);
          break;
        case "sticky-note":
          output.push(`<div data-preview-id="${paragraph.id}" class="sticky-note">${formatBracketedFallbackText(paragraph.text)}</div>`);
          break;
        case "red-ink":
          output.push(`<div data-preview-id="${paragraph.id}" class="red-ink">${text}</div>`);
          break;
        case "grade-mark":
          output.push(`<div data-preview-id="${paragraph.id}" class="grade-mark">${text}</div>`);
          break;
        case "grade-comment":
          output.push(`<div data-preview-id="${paragraph.id}" class="grade-comment">${text}</div>`);
          break;
        case "text-received":
        case "text-sent": {
          if (!inThread) {
            output.push(`<div class="text-thread">`);
            inThread = true;
          }
          if (currentDirection !== direction && bubbleOpen) closeBubble();
          if (paragraph.isLabel) {
            if (bubbleOpen) closeBubble();
            output.push(`  <blockquote class="text-msg ${direction}">`);
            output.push(`    <p data-preview-id="${paragraph.id}" class="msg-label"><strong><em><span class="msg-dir">${escapeHtml(paragraph.labelPrefix)}</span>${escapeHtml(paragraph.speaker)}</em></strong></p>`);
            bubbleOpen = true;
            currentDirection = direction;
            break;
          }
          if (!bubbleOpen) {
            output.push(`  <blockquote class="text-msg ${direction}">`);
            if (paragraph.speaker) {
              output.push(`    <p class="msg-label"><strong><em>${escapeHtml(paragraph.speaker)}</em></strong></p>`);
            }
            bubbleOpen = true;
            currentDirection = direction;
          }
          output.push(`    <p data-preview-id="${paragraph.id}"><strong><em>${text}</em></strong></p>`);
          break;
        }
        case "slack-message": {
          const channelName = parseSlackChannel(paragraph.text);
          if (channelName) {
            closeSlack();
            output.push(`  <div class="slack-workspace" style="margin-top: 1.2em; margin-bottom: 1.2em;">`);
            output.push(`    <div data-preview-id="${paragraph.id}" class="slack-channel" style="margin-bottom: 0.5em;"><em><span class="slack-channel-hash">#</span> ${escapeHtml(channelName)}</em></div>`);
            output.push(`    <dl class="slack-messages">`);
            inSlack = true;
            break;
          }

          if (!inSlack) {
            output.push(`  <div class="slack-workspace slack-workspace-continuation" style="margin-top: 1.2em; margin-bottom: 1.2em;">`);
            output.push(`    <dl class="slack-messages">`);
            inSlack = true;
          }

          const inlineSpeakerLine = parseSlackSpeakerLine(paragraph.text);
          if (inlineSpeakerLine) {
            const speaker = paragraph.slackSpeaker ?? findSlackSpeakerByName(inlineSpeakerLine.speakerName);
            const speakerName = speaker?.name ?? inlineSpeakerLine.speakerName;
            const timestampValue = paragraph.timestamp || inlineSpeakerLine.timestamp;
            const timestamp = timestampValue ? ` <span class="slack-time">${escapeHtml(timestampValue)}</span>` : "";
            const className = speaker?.userClass ? ` class="${speaker.userClass}"` : "";

            output.push(`      <dt data-preview-id="${paragraph.id}"${className}><em>${escapeHtml(speakerName)}${timestamp}</em></dt>`);
            currentSlackSpeaker = speaker;
            currentSlackTimestamp = timestampValue;
            break;
          }

          const speaker = paragraph.slackSpeaker ?? currentSlackSpeaker;
          const timestampValue = paragraph.timestamp || currentSlackTimestamp;
          if (speaker) {
            const messageClass = speaker.userClass.replace("user-", "msg-");
            const needsHeader = paragraph.slackSpeaker
              && getSlackSpeakerKey(paragraph.slackSpeaker) !== getSlackSpeakerKey(currentSlackSpeaker);

            if (needsHeader) {
              const timestamp = timestampValue ? ` <span class="slack-time">${escapeHtml(timestampValue)}</span>` : "";
              output.push(`      <dt data-preview-id="${paragraph.id}" class="${speaker.userClass}"><em>${escapeHtml(speaker.name)}${timestamp}</em></dt>`);
            }

            output.push(`      <dd data-preview-id="${paragraph.id}" class="${messageClass}"><em>${text}</em></dd>`);
            currentSlackSpeaker = speaker;
            currentSlackTimestamp = timestampValue;
          } else {
            output.push(`      <dd data-preview-id="${paragraph.id}"><em>${text}</em></dd>`);
          }
          break;
        }
        case "slack-typing":
          if (!inSlack) {
            output.push(`  <div class="slack-workspace slack-workspace-continuation" style="margin-top: 1.2em; margin-bottom: 1.2em;">`);
            output.push(`    <dl class="slack-messages">`);
            inSlack = true;
          }
          output.push(`      <div data-preview-id="${paragraph.id}" class="slack-typing"><em>${text}</em></div>`);
          break;
        default:
          break;
      }
    });

    closeThread();
    closeSlack();
    closeEmail();
    closeList();
    return output.join("\n");
  }, [paragraphs]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const draft = readSavedDraft();

      if (draft) {
        setPhase(draft.phase ?? "import");
        setParagraphs(Array.isArray(draft.paragraphs) ? draft.paragraphs : []);
        setPreviewMode(draft.previewMode ?? "skin-on");
        setShowPreview(Boolean(draft.showPreview));
        setImportMode(draft.importMode ?? "raw");
        setRawInput(draft.rawInput ?? "");
        setImportFileName(draft.importFileName ?? "");
        setDraftStatus("Restored draft");
      }

      setHasRestoredDraft(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const copyHTML = async () => {
    try {
      await navigator.clipboard.writeText(generateHTML);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = generateHTML;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCSS = async () => {
    try {
      await navigator.clipboard.writeText(AO3_SKIN_CSS.trim());
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = AO3_SKIN_CSS.trim();
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopiedCss(true);
    setTimeout(() => setCopiedCss(false), 2000);
  };

  const selectedTypes = useMemo(() => {
    const types = new Set();
    paragraphs.forEach((paragraph) => {
      if (selected.has(paragraph.id)) {
        types.add(paragraph.type);
      }
    });
    return types;
  }, [selected, paragraphs]);

  const hasSlack = selectedTypes.has("slack-message");
  const hasText = selectedTypes.has("text-received") || selectedTypes.has("text-sent");
  const canApplyList = selectedRows.some((paragraph) => paragraph.type === "prose" || paragraph.type === "thought");
  const selectedListKinds = new Set(
    selectedRows
      .filter((paragraph) => paragraph.type === "prose" || paragraph.type === "thought")
      .map((paragraph) => paragraph.listKind)
      .filter(Boolean)
  );
  const listButtonActive = canApplyList && selectedListKinds.size === 1 && selectedListKinds.has("ul");
  const canSplitRow = Boolean(
    (editingParagraph && (editingParagraph.type === "prose" || editingParagraph.type === "thought"))
    || (selectedRows.length === 1 && (selectedRows[0].type === "prose" || selectedRows[0].type === "thought"))
  );

  useEffect(() => {
    if (!hasRestoredDraft) return;

    const timeoutId = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            version: 1,
            phase,
            paragraphs,
            previewMode,
            showPreview,
            importMode,
            rawInput,
            importFileName,
            savedAt: new Date().toISOString(),
          })
        );
        setDraftStatus("Saved locally");
      } catch {
        setDraftStatus("Local save failed");
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [hasRestoredDraft, importFileName, importMode, paragraphs, phase, previewMode, rawInput, showPreview]);

  useEffect(() => {
    if (!draftStatus) return;

    const timeoutId = window.setTimeout(() => {
      setDraftStatus("");
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [draftStatus]);

  useEffect(() => {
    const headerEl = stickyHeaderRef.current;
    if (!headerEl) return;

    const updateHeaderHeight = () => {
      const nextHeight = Math.ceil(headerEl.getBoundingClientRect().height);
      setStickyHeaderHeight((currentHeight) => (currentHeight === nextHeight ? currentHeight : nextHeight));
    };

    updateHeaderHeight();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateHeaderHeight);
      return () => window.removeEventListener("resize", updateHeaderHeight);
    }

    const observer = new ResizeObserver(() => updateHeaderHeight());
    observer.observe(headerEl);
    window.addEventListener("resize", updateHeaderHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, [hasSlack, hasText, showPreview]);

  useEffect(() => {
    if (editingId == null || !editInputRef.current) return;
    editInputRef.current.focus();
    editInputRef.current.select();
  }, [editingId]);

  useEffect(() => {
    if (pendingScrollId == null || !showPreview || previewMode === "html") return;

    const frame = requestAnimationFrame(() => {
      const target = previewPaneRef.current?.querySelector(`[data-preview-id="${pendingScrollId}"]`);
      if (!target) return;

      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
      setPendingScrollId(null);
    });

    return () => cancelAnimationFrame(frame);
  }, [generateHTML, pendingScrollId, previewMode, showPreview]);

  if (phase === "import") {
    return (
      <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", background: "#f4f1ec", minHeight: "100vh", padding: "24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 16, textTransform: "uppercase", letterSpacing: 3, color: "#900", marginBottom: 6 }}>Dandori Formatter</div>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 13, color: "#888", marginBottom: 20, lineHeight: 1.6 }}>
            {importMode === "raw"
              ? "Paste raw chapter or upload a text file. Blank lines split paragraphs. > lines = text messages. #channel = Slack header. From:/To: = text labels."
              : "Paste AO3 HTML exported by this tool. It will be parsed back into editable rows so you can make a small change and re-export."}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
            <span style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: 1 }}>Import Mode:</span>
            <button
              onClick={() => setImportMode("raw")}
              style={{
                padding: "8px 12px",
                background: importMode === "raw" ? "#900" : "#fff",
                color: importMode === "raw" ? "#fff" : "#555",
                border: importMode === "raw" ? "1px solid #900" : "1px solid #ccc",
                fontFamily: "'Courier New', monospace",
                fontSize: 12,
                letterSpacing: 0.8,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Raw Prose
            </button>
            <button
              onClick={() => setImportMode("html")}
              style={{
                padding: "8px 12px",
                background: importMode === "html" ? "#900" : "#fff",
                color: importMode === "html" ? "#fff" : "#555",
                border: importMode === "html" ? "1px solid #900" : "1px solid #ccc",
                fontFamily: "'Courier New', monospace",
                fontSize: 12,
                letterSpacing: 0.8,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Existing AO3 HTML
            </button>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
            <button
              onClick={handleFilePicker}
              style={{ padding: "11px 18px", background: "#1a1a1a", color: "#fff", border: "none", fontFamily: "'Courier New', monospace", fontSize: 13, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}
            >
              Upload File
            </button>
            <span style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: "#777", textTransform: "uppercase", letterSpacing: 1 }}>
              {importFileName || "Accepts .txt, .md, .html"}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.markdown,.html,.htm"
              onChange={handleFileImport}
              style={{ display: "none" }}
            />
          </div>
          <textarea
            ref={textareaRef}
            placeholder={importMode === "raw" ? "Paste your chapter here..." : "Paste previously exported AO3 HTML here..."}
            value={rawInput}
            onChange={(event) => setRawInput(event.target.value)}
            style={{ width: "100%", minHeight: 420, padding: 18, fontFamily: "Georgia, serif", fontSize: 17, lineHeight: 1.75, border: "1px solid #ccc", background: "#fff", resize: "vertical", outline: "none" }}
          />
          <button
            onClick={importMode === "html" ? handleHtmlImport : handleImport}
            disabled={rawInput.trim().length === 0}
            style={{ marginTop: 12, padding: "11px 28px", background: rawInput.trim().length === 0 ? "#b98b8b" : "#900", color: "#fff", border: "none", fontFamily: "'Courier New', monospace", fontSize: 14, letterSpacing: 1, textTransform: "uppercase", cursor: rawInput.trim().length === 0 ? "not-allowed" : "pointer" }}
          >
            {importMode === "html" ? "Re-import HTML" : "Import & Tag"}
          </button>
        </div>
      </div>
    );
  }

  const paneMaxHeight = `calc(100vh - ${stickyHeaderHeight}px)`;

  return (
    <div style={{ fontFamily: "Georgia, serif", background: "#f4f1ec", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div ref={stickyHeaderRef} style={{ position: "sticky", top: 0, zIndex: 100, display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#1a1a1a", padding: "7px 10px", display: "flex", flexWrap: "wrap", alignItems: "center", borderBottom: "1px solid #333", gap: 2 }}>
        <span style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: "#8f8f8f", marginRight: 6, textTransform: "uppercase", letterSpacing: 1 }}>Type:</span>
        {Object.entries(BLOCK_TYPES).map(([key, blockType]) => (
          <button
            key={key}
            onClick={() => applyType(key)}
            style={{ padding: "3px 8px", margin: "1px 2px", background: blockType.color, color: blockType.textColor, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 3, fontFamily: "'Courier New', monospace", fontSize: 10, cursor: "pointer", opacity: selected.size === 0 ? 0.4 : 1, lineHeight: 1.2 }}
          >
            {blockType.label}
          </button>
        ))}
          <button
            onClick={() => applyListKind("ul")}
            disabled={!canApplyList}
          style={{
            padding: "3px 8px",
            margin: "1px 2px",
            background: listButtonActive ? "#d6e8ff" : "#f4f4f4",
            color: listButtonActive ? "#1d4ed8" : "#444",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 3,
            fontFamily: "'Courier New', monospace",
            fontSize: 10,
            cursor: canApplyList ? "pointer" : "not-allowed",
            opacity: canApplyList ? 1 : 0.4,
            lineHeight: 1.2,
          }}
          >
            List
          </button>
          <button
            onClick={addRowAfterSelection}
            style={{
              padding: "3px 8px",
              margin: "1px 2px",
              background: "#f4f4f4",
              color: "#444",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 3,
              fontFamily: "'Courier New', monospace",
              fontSize: 10,
              cursor: "pointer",
              lineHeight: 1.2,
            }}
          >
            Add Row
          </button>
          <button
            onClick={splitEditingRow}
            disabled={!canSplitRow}
            style={{
              padding: "3px 8px",
              margin: "1px 2px",
              background: canSplitRow ? "#f4f4f4" : "#f4f4f4",
              color: canSplitRow ? "#444" : "#999",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 3,
              fontFamily: "'Courier New', monospace",
              fontSize: 10,
              cursor: canSplitRow ? "pointer" : "not-allowed",
              opacity: canSplitRow ? 1 : 0.4,
              lineHeight: 1.2,
            }}
          >
            Split Row
          </button>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
          {draftStatus && (
            <span style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: "#a6a6a6", marginRight: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>
              {draftStatus}
            </span>
          )}
          {lastDeletedRows && lastDeletedRows.length > 0 && (
            <button
              onClick={undoDeleteParagraphs}
              style={{ padding: "3px 8px", background: "#2b4a2f", color: "#e6f8e8", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 3, fontFamily: "'Courier New', monospace", fontSize: 10, cursor: "pointer", marginRight: 3 }}
            >
              Undo Delete
            </button>
          )}
          <button
            onClick={() => {
              setPhase("import");
              setParagraphs([]);
              setSelected(new Set());
              setRawInput("");
              setImportFileName("");
            }}
            style={{ padding: "3px 8px", background: "#333", color: "#b8b8b8", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 3, fontFamily: "'Courier New', monospace", fontSize: 10, cursor: "pointer", marginRight: 3 }}
          >
            ← Re-import
          </button>
          <button
            onClick={() => {
              window.localStorage.removeItem(DRAFT_KEY);
              setDraftStatus("Draft cleared");
            }}
            style={{ padding: "3px 8px", background: "#3b2b2b", color: "#f0caca", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 3, fontFamily: "'Courier New', monospace", fontSize: 10, cursor: "pointer", marginRight: 3 }}
          >
            Clear Draft
          </button>
          <button
            onClick={deleteSelectedParagraphs}
            disabled={selected.size === 0}
            style={{ padding: "3px 8px", background: selected.size === 0 ? "#4b3030" : "#7a1f1f", color: selected.size === 0 ? "#caa4a4" : "#fff", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 3, fontFamily: "'Courier New', monospace", fontSize: 10, cursor: selected.size === 0 ? "not-allowed" : "pointer", marginRight: 3 }}
          >
            Delete
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            style={{ padding: "3px 8px", background: showPreview ? "#900" : "#444", color: "#fff", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 3, fontFamily: "'Courier New', monospace", fontSize: 10, cursor: "pointer", marginRight: 3 }}
          >
            {showPreview ? "Hide Preview" : "Preview"}
          </button>
          <button
            onClick={copyHTML}
            style={{ padding: "3px 8px", background: copied ? "#28a745" : "#155724", color: "#fff", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 3, fontFamily: "'Courier New', monospace", fontSize: 10, cursor: "pointer" }}
          >
            {copied ? "Copied!" : "Copy HTML"}
          </button>
          <button
            onClick={copyCSS}
            style={{ padding: "3px 8px", background: copiedCss ? "#28a745" : "#1f4f8a", color: "#fff", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 3, fontFamily: "'Courier New', monospace", fontSize: 10, cursor: "pointer", marginLeft: 3 }}
          >
            {copiedCss ? "CSS Copied!" : "Copy CSS"}
          </button>
        </div>
      </div>

      {(hasSlack || hasText || editingParagraph) && (
        <div style={{ background: "#222", padding: "5px 10px", display: "flex", flexWrap: "wrap", alignItems: "center", borderBottom: "1px solid #333" }}>
          {hasSlack && (
            <>
              <span style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: "#8f8f8f", marginRight: 6, textTransform: "uppercase" }}>Slack:</span>
              {SLACK_SPEAKERS.map((speaker) => (
                <button
                  key={speaker.userClass}
                  onClick={() => applySlackSpeaker(speaker)}
                  style={{ padding: "2px 7px", margin: "1px 2px", background: "#2a2a2a", border: "1px solid #4d4d4d", borderRadius: 3, fontFamily: "'Courier New', monospace", fontSize: 10, cursor: "pointer", color: SLACK_COLORS[speaker.userClass], lineHeight: 1.2 }}
                >
                  {speaker.short}
                </button>
              ))}
              <input
                type="text"
                placeholder="HH:MM"
                style={{ marginLeft: 6, padding: "2px 6px", width: 58, background: "#333", border: "1px solid #555", color: "#ddd", fontFamily: "'Courier New', monospace", fontSize: 10, borderRadius: 3 }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    applyTimestamp(event.target.value);
                    event.target.value = "";
                  }
                }}
              />
            </>
          )}
          {hasText && (
            <>
              <span style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: "#8f8f8f", marginRight: 6, textTransform: "uppercase", marginLeft: hasSlack ? 12 : 0 }}>Text:</span>
              {TEXT_SPEAKERS.map((speaker) => (
                <button
                  key={`${speaker.name}-${speaker.direction}`}
                  onClick={() => applyTextSpeaker(speaker.name, speaker.direction)}
                  style={{ padding: "2px 7px", margin: "1px 2px", background: speaker.direction === "sent" ? "#3a7bd5" : "#e5e5ea", color: speaker.direction === "sent" ? "#fff" : "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 3, fontFamily: "'Courier New', monospace", fontSize: 10, cursor: "pointer", lineHeight: 1.2 }}
                >
                  {speaker.name}
                </button>
              ))}
            </>
          )}
          {editingParagraph && (
            <>
              <span style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: "#8f8f8f", marginRight: 6, textTransform: "uppercase", marginLeft: hasSlack || hasText ? 12 : 0 }}>Format:</span>
              <button
                onClick={applyExponentFormat}
                disabled={editingId == null}
                style={{ padding: "2px 7px", margin: "1px 2px", background: "#2f2f2f", color: "#f0f0f0", border: "1px solid #4d4d4d", borderRadius: 3, fontFamily: "'Courier New', monospace", fontSize: 10, cursor: editingId == null ? "not-allowed" : "pointer", opacity: editingId == null ? 0.4 : 1, lineHeight: 1.2 }}
              >
                x^n
              </button>
            </>
          )}
        </div>
      )}
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ flex: showPreview ? "0 0 50%" : "1", overflowY: "auto", padding: "6px 10px", maxHeight: paneMaxHeight }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: "#8e8e8e", marginBottom: 6, display: "flex", alignItems: "center", position: "sticky", top: 0, zIndex: 5, background: "#f4f1ec", padding: "4px 0 6px" }}>
            <span>{paragraphs.length} ¶ · {selected.size} sel</span>
            {selected.size > 0 && (
              <button
                onClick={() => setSelected(new Set())}
                style={{ marginLeft: 6, background: "none", border: "none", color: "#900", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", textDecoration: "underline" }}
              >
                clear
              </button>
            )}
            <span style={{ marginLeft: "auto", color: "#777" }}>click · shift range · cmd multi</span>
          </div>
          {paragraphs.map((paragraph, index) => {
            const blockType = BLOCK_TYPES[paragraph.type];
            const isSelected = selected.has(paragraph.id);
            const isSkipped = paragraph.type === "skip";
            const isChannelHeader = paragraph.type === "slack-message" && parseSlackChannel(paragraph.text);
            const rowLabel = paragraph.listKind
              ? paragraph.type === "thought"
                ? "List · Thought"
                : "List"
              : isChannelHeader
                ? "Slack #"
                : blockType.label;

            return (
              <div
                key={paragraph.id}
                onClick={(event) => handleParagraphClick(paragraph.id, event)}
                onDoubleClick={() => startEditingParagraph(paragraph)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  padding: "4px 7px",
                  marginBottom: 2,
                  background: isSelected ? "#fff3cd" : isSkipped ? "#f8f8f8" : index % 2 === 0 ? "#fff" : "#fafaf7",
                  border: isSelected ? "1px solid #e0c36a" : "1px solid transparent",
                  borderRadius: 2,
                  cursor: "pointer",
                  userSelect: "none",
                  opacity: isSkipped ? 0.35 : 1,
                }}
              >
                <span style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: "#b0b0b0", minWidth: 24, marginRight: 5, marginTop: 3, textAlign: "right" }}>{index + 1}</span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "1px 6px",
                    minHeight: 17,
                    background: isChannelHeader ? "#f0f0f0" : blockType.color,
                    color: isChannelHeader ? "#555" : blockType.textColor,
                    fontFamily: "'Courier New', monospace",
                    fontSize: 9,
                    borderRadius: 3,
                    marginRight: 7,
                    marginTop: 1,
                    minWidth: paragraph.listKind ? 72 : 54,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    border: isChannelHeader ? "1px solid #ddd" : "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  {rowLabel}
                  {paragraph.type === "slack-message" && !isChannelHeader && paragraph.slackSpeaker && <span style={{ marginLeft: 2, opacity: 0.7 }}>·{paragraph.slackSpeaker.short}</span>}
                  {(paragraph.type === "text-received" || paragraph.type === "text-sent") && paragraph.speaker && <span style={{ marginLeft: 2, opacity: 0.7 }}>·{paragraph.speaker}</span>}
                  {paragraph.isLabel && <span style={{ marginLeft: 2, opacity: 0.5 }}>LBL</span>}
                </span>
                {editingId === paragraph.id ? (
                  <textarea
                    ref={editInputRef}
                    value={editingValue}
                    onChange={(event) => setEditingValue(event.target.value)}
                    onClick={(event) => event.stopPropagation()}
                    onBlur={saveEditingParagraph}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        event.preventDefault();
                        cancelEditingParagraph();
                      } else if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        saveEditingParagraph();
                      }
                    }}
                    style={{
                      fontSize: 12,
                      lineHeight: 1.4,
                      color: "#333",
                      flex: 1,
                      minHeight: 46,
                      resize: "vertical",
                      border: "1px solid #d8c27a",
                      borderRadius: 2,
                      padding: "4px 6px",
                      background: "#fffdf5",
                      fontFamily: "Georgia, serif",
                    }}
                  />
                ) : (
                  <span data-row-text-id={paragraph.id} style={{ fontSize: 14, lineHeight: 1.4, color: isSkipped ? "#b5b5b5" : "#333", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontStyle: paragraph.type === "thought" ? "italic" : "normal" }}>
                    {paragraph.text}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {showPreview && (
          <div ref={previewPaneRef} style={{ flex: "0 0 50%", borderLeft: "1px solid #ddd", overflowY: "auto", maxHeight: paneMaxHeight, background: previewMode === "skin-off" ? "#e8e5e0" : "#fff", position: "relative" }}>
            <div style={{ display: "flex", borderBottom: "1px solid #ddd", position: "sticky", top: 0, background: "#fff", zIndex: 20, boxShadow: "0 1px 0 rgba(0,0,0,0.08)" }}>
              {["skin-on", "skin-off", "html"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPreviewMode(mode)}
                  style={{ flex: 1, padding: "5px", border: "none", background: previewMode === mode ? "#900" : "#f0f0f0", color: previewMode === mode ? "#fff" : "#666", fontFamily: "'Courier New', monospace", fontSize: 9, cursor: "pointer", textTransform: "uppercase", letterSpacing: 1 }}
                >
                  {mode === "skin-on" ? "Skin On" : mode === "skin-off" ? "Skin Off (Fallback)" : "HTML"}
                </button>
              ))}
            </div>
            {previewMode === "html" ? (
              <pre style={{ padding: 12, fontFamily: "'Courier New', monospace", fontSize: 10, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-all", color: "#333", background: "#f8f8f0", margin: 0 }}>
                {generateHTML}
              </pre>
            ) : (
              <div style={{ padding: "16px 24px" }}>
                {previewMode === "skin-on" && <style>{AO3_SKIN_CSS}</style>}
                {previewMode === "skin-off" && <style>{AO3_BASE_CSS}</style>}
                <div
                  id="workskin"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 17, lineHeight: 1.85, color: "#2a2a2a" }}
                  dangerouslySetInnerHTML={{ __html: generateHTML }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
