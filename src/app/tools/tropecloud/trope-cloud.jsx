'use client';

import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { Download, RefreshCw, Palette, Type, Tag as TagIcon, Quote, Layers, ChevronUp, ChevronDown, X, Plus, Star, AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline } from 'lucide-react';

// ─── Self-hosted fonts (same-origin, no CORS issues) ─────────────
const LOCAL_FONTS = [
  { family: 'Fraunces',    style: 'normal', weight: 400, src: '/fonts/fraunces-latin-400.woff2' },
  { family: 'Fraunces',    style: 'normal', weight: 700, src: '/fonts/fraunces-latin-700.woff2' },
  { family: 'Fraunces',    style: 'italic', weight: 400, src: '/fonts/fraunces-latin-italic-400.woff2' },
  { family: 'Crimson Pro', style: 'normal', weight: 400, src: '/fonts/crimson-pro-latin-400.woff2' },
  { family: 'Crimson Pro', style: 'normal', weight: 600, src: '/fonts/crimson-pro-latin-600.woff2' },
  { family: 'Lora',        style: 'normal', weight: 400, src: '/fonts/lora-latin-400.woff2' },
  { family: 'Lora',        style: 'italic', weight: 400, src: '/fonts/lora-latin-italic-400.woff2' },
  { family: 'DM Sans',     style: 'normal', weight: 400, src: '/fonts/dm-sans-latin-400.woff2' },
  { family: 'DM Sans',     style: 'italic', weight: 400, src: '/fonts/dm-sans-latin-italic-400.woff2' },
];

function buildFontFaceCSS(fonts) {
  return fonts.map(f =>
    `@font-face { font-family: '${f.family}'; font-style: ${f.style}; font-weight: ${f.weight}; font-display: swap; src: url(${f.src}) format('woff2'); }`
  ).join('\n');
}

// ─── Themes ──────────────────────────────────────────────────────
const THEMES = {
  warmPaper:  { name: 'Warm Paper', bg: '#2B2218', text: '#FAF6F1', textMuted: '#C9B896', textDim: '#8B7355', accent: '#D4B856', border: '#3D3225', footer: '#8B7355', footerCta: '#D4B856', radius: 0,  ornament: '◆' },
  bone:       { name: 'Bone',       bg: '#FAF6F1', text: '#2B2218', textMuted: '#8B7355', textDim: '#C9B896', accent: '#8B7355', border: '#E3DFD5', footer: '#C9B896', footerCta: '#8B7355', radius: 0,  ornament: '◆' },
  midnight:   { name: 'Midnight',   bg: '#0d1117', text: '#c9d1d9', textMuted: '#8b949e', textDim: '#484f58', accent: '#58a6ff', border: '#1a2233', footer: '#484f58', footerCta: '#58a6ff', radius: 12, ornament: null },
  bloodMoon:  { name: 'Blood Moon', bg: '#1a0e0e', text: '#f0d0d0', textMuted: '#b08080', textDim: '#804848', accent: '#e04040', border: '#2d1818', footer: '#6b4040', footerCta: '#e07060', radius: 8,  ornament: null },
  violetHour: { name: 'Violet Hour',bg: '#140e1a', text: '#e8d8f4', textMuted: '#a890b8', textDim: '#6e5880', accent: '#c084fc', border: '#231830', footer: '#5e4870', footerCta: '#c084fc', radius: 16, ornament: null },
  moss:       { name: 'Moss',       bg: '#0e1510', text: '#d0e8d4', textMuted: '#88a88e', textDim: '#506858', accent: '#7acc80', border: '#182820', footer: '#456850', footerCta: '#7acc80', radius: 8,  ornament: null },
};

const PILL_PALETTES = {
  warmPaper: [
    { bg: '#3D3225', color: '#D4B856' }, { bg: '#2D3528', color: '#6B8F6B' }, { bg: '#352D38', color: '#B89FCC' },
    { bg: '#38322A', color: '#E3CE84' }, { bg: '#2A2D38', color: '#7A9CB8' }, { bg: '#382A2A', color: '#C98A7A' },
    { bg: '#2A3535', color: '#7AAFAF' }, { bg: '#35322A', color: '#C9B896' }, { bg: '#38302D', color: '#C98A6B' },
    { bg: '#2D3530', color: '#8FAF8B' },
  ],
  bone: [
    { bg: '#EDE4D8', color: '#6B4A28' }, { bg: '#D8E8D8', color: '#2A5A3A' }, { bg: '#E0D0E0', color: '#5A2A6A' },
    { bg: '#E8E0C8', color: '#5A4820' }, { bg: '#CCD8E8', color: '#2A4068' }, { bg: '#E8CCCC', color: '#6A2828' },
    { bg: '#CCE0E8', color: '#2A4858' }, { bg: '#E0DCC8', color: '#4A4228' }, { bg: '#E0CCD8', color: '#5A2A40' },
    { bg: '#CCE0D0', color: '#2A4838' },
  ],
  midnight: [
    { bg: '#15213a', color: '#79c0ff' }, { bg: '#122a1e', color: '#56d364' }, { bg: '#261530', color: '#d2a8ff' },
    { bg: '#2a2210', color: '#e3b341' }, { bg: '#15203a', color: '#79b8ff' }, { bg: '#2a1520', color: '#f47067' },
    { bg: '#0d2535', color: '#39d2c0' }, { bg: '#20201a', color: '#c9a07a' }, { bg: '#25152a', color: '#bc8cff' },
    { bg: '#152a2a', color: '#56d3b0' },
  ],
  bloodMoon: [
    { bg: '#331515', color: '#ff8a80' }, { bg: '#2d2010', color: '#e8b04a' }, { bg: '#301520', color: '#e07090' },
    { bg: '#281818', color: '#d09070' }, { bg: '#331018', color: '#ff7080' }, { bg: '#2a1510', color: '#e0a070' },
    { bg: '#301a1a', color: '#e08070' }, { bg: '#2d1020', color: '#d070a0' }, { bg: '#331a15', color: '#e09070' },
    { bg: '#2a1020', color: '#d08090' },
  ],
  violetHour: [
    { bg: '#281840', color: '#d4a0ff' }, { bg: '#1a1535', color: '#a0a0ff' }, { bg: '#301838', color: '#f080c0' },
    { bg: '#201840', color: '#b8a0ff' }, { bg: '#281038', color: '#d080e0' }, { bg: '#1a2038', color: '#80b0ff' },
    { bg: '#301040', color: '#e080d0' }, { bg: '#201838', color: '#a090ff' }, { bg: '#281838', color: '#c890e0' },
    { bg: '#1a1840', color: '#90a0ff' },
  ],
  moss: [
    { bg: '#152d1a', color: '#80d090' }, { bg: '#1a2d15', color: '#a0d070' }, { bg: '#102d28', color: '#60d0b0' },
    { bg: '#202d15', color: '#c0d060' }, { bg: '#152d22', color: '#70d0a0' }, { bg: '#1a2d1a', color: '#90d080' },
    { bg: '#102d20', color: '#60d098' }, { bg: '#202818', color: '#b0c870' }, { bg: '#152d25', color: '#70d0b0' },
    { bg: '#182d18', color: '#88d080' },
  ],
};

// ─── Excerpt fonts ───────────────────────────────────────────────
const FONT_OPTIONS = [
  { key: 'fraunces', name: 'Fraunces',   family: "'Fraunces', Georgia, serif" },
  { key: 'crimson',  name: 'Crimson',    family: "'Crimson Pro', Georgia, serif" },
  { key: 'lora',     name: 'Lora',       family: "'Lora', Palatino, serif" },
  { key: 'mono',     name: 'Typewriter', family: "'Courier New', monospace" },
  { key: 'dm',       name: 'DM Sans',    family: "'DM Sans', 'Helvetica Neue', sans-serif" },
];

// ─── Platforms ───────────────────────────────────────────────────
const PLATFORMS = [
  { value: 'ao3',     label: 'AO3' },
  { value: 'wattpad', label: 'Wattpad' },
  { value: 'ffn',     label: 'FFN' },
  { value: 'threads', label: 'Threads' },
  { value: 'custom',  label: 'Custom' },
];

// ─── Defaults (spec §7) ──────────────────────────────────────────
const DEFAULTS = {
  title: 'Dandori for Dummies',
  author: 'arynwilder',
  platform: 'ao3',
  customPlatform: '',
  fandom: '呪術廻戦 · Jujutsu Kaisen',
  theme: 'warmPaper',
  font: 'fraunces',
  tags: ['College AU', 'Roommates', 'Slow Burn', 'Mutual Pining', 'Idiots in Love', 'Bad at Feelings Sukuna', 'Chef Yuuji', 'Mathematician Sukuna', 'Eventual Smut'],
  excerptLines: [
    { text: 'He would rather take a short walk off a cliff than room with Junpei and Lidya again.', accent: false, bold: false, italic: true, underline: false, color: null },
    { text: '', accent: false, bold: false, italic: true, underline: false, color: null },
    { text: 'Was Junpei a victim?', accent: false, bold: false, italic: true, underline: false, color: null },
    { text: 'Perhaps?', accent: false, bold: false, italic: true, underline: false, color: null },
    { text: 'But he was certainly a willing victim.', accent: false, bold: false, italic: true, underline: false, color: null },
    { text: '', accent: false, bold: false, italic: true, underline: false, color: null },
    { text: 'The sounds… the fluids…', accent: true, bold: false, italic: true, underline: false },
  ],
  chapterInfo: 'ch1: peanut tantanmen',
  ctaText: 'READ ON AO3 →',
};

const MAX_TAGS = 12;

// ─── Component ───────────────────────────────────────────────────
export default function TropeCloud() {
  const [title, setTitle] = useState(DEFAULTS.title);
  const [author, setAuthor] = useState(DEFAULTS.author);
  const [platform, setPlatform] = useState(DEFAULTS.platform);
  const [customPlatform, setCustomPlatform] = useState(DEFAULTS.customPlatform);
  const [fandom, setFandom] = useState(DEFAULTS.fandom);
  const [themeKey, setThemeKey] = useState(DEFAULTS.theme);
  const [fontKey, setFontKey] = useState(DEFAULTS.font);
  const [tags, setTags] = useState(DEFAULTS.tags);
  const [excerptLines, setExcerptLines] = useState(DEFAULTS.excerptLines);
  const [excerptAlign, setExcerptAlign] = useState('center');
  const [activeLineIdx, setActiveLineIdx] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [chapterInfo, setChapterInfo] = useState(DEFAULTS.chapterInfo);
  const [ctaText, setCtaText] = useState(DEFAULTS.ctaText);
  const [newTag, setNewTag] = useState('');

  const [isExporting, setIsExporting] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const [cardHeight, setCardHeight] = useState(640);

  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const fontCSSRef = useRef(null);

  const theme = THEMES[themeKey];
  const font = FONT_OPTIONS.find(f => f.key === fontKey);
  const palette = PILL_PALETTES[themeKey];

  // Resolve platform label for byline
  const platformLabel = platform === 'custom'
    ? (customPlatform || 'CUSTOM').toUpperCase()
    : PLATFORMS.find(p => p.value === platform)?.label.toUpperCase() ?? 'AO3';

  // ─── Font loading / inlining ───────────────────────────────────
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = buildFontFaceCSS(LOCAL_FONTS);
    document.head.appendChild(style);

    Promise.all(LOCAL_FONTS.map(async (f) => {
      const resp = await fetch(f.src);
      const blob = await resp.blob();
      const dataUri = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
      return { ...f, src: dataUri };
    })).then(inlinedFonts => {
      fontCSSRef.current = buildFontFaceCSS(inlinedFonts);
    }).catch(() => {});

    document.fonts.ready.then(() => setFontsLoaded(true));

    return () => {
      if (style.parentNode) style.parentNode.removeChild(style);
    };
  }, []);

  // ─── Responsive scaling + card height measurement ──────────────
  useLayoutEffect(() => {
    if (!containerRef.current || !cardRef.current) return;
    const update = () => {
      if (!containerRef.current || !cardRef.current) return;
      const parentWidth = containerRef.current.offsetWidth;
      setScale(Math.min(1, parentWidth / 520));
      setCardHeight(cardRef.current.scrollHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(cardRef.current);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [tags, excerptLines, excerptAlign, title, author, fandom, chapterInfo, ctaText, themeKey, fontKey, platform, customPlatform]);

  // ─── Tag handlers ──────────────────────────────────────────────
  const addTag = useCallback(() => {
    const t = newTag.trim();
    if (!t) return;
    if (tags.length >= MAX_TAGS) return;
    setTags(prev => [...prev, t]);
    setNewTag('');
  }, [newTag, tags.length]);

  const removeTagAt = useCallback((i) => {
    setTags(prev => prev.filter((_, idx) => idx !== i));
  }, []);

  const moveTag = useCallback((i, dir) => {
    setTags(prev => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }, []);

  // ─── Excerpt handlers ──────────────────────────────────────────
  const updateLineText = useCallback((i, text) => {
    setExcerptLines(prev => prev.map((l, idx) => idx === i ? { ...l, text } : l));
  }, []);

  const toggleAccent = useCallback((i) => {
    setExcerptLines(prev => prev.map((l, idx) => idx === i ? { ...l, accent: !l.accent } : l));
  }, []);

  const removeLine = useCallback((i) => {
    setExcerptLines(prev => prev.filter((_, idx) => idx !== i));
    setActiveLineIdx(prev => {
      if (prev == null) return prev;
      if (prev === i) return null;
      return prev > i ? prev - 1 : prev;
    });
  }, []);

  const addLine = useCallback(() => {
    setExcerptLines(prev => [...prev, { text: '', accent: false, bold: false, italic: true, underline: false, color: null }]);
  }, []);

  const toggleLineStyle = useCallback((prop) => {
    if (activeLineIdx == null) return;
    setExcerptLines(prev => prev.map((l, idx) => idx === activeLineIdx ? { ...l, [prop]: !l[prop] } : l));
  }, [activeLineIdx]);

  const setLineColor = useCallback((color) => {
    if (activeLineIdx == null) return;
    setExcerptLines(prev => prev.map((l, idx) => idx === activeLineIdx ? { ...l, color } : l));
    setShowColorPicker(false);
  }, [activeLineIdx]);

  // ─── Export ────────────────────────────────────────────────────
  const handleExport = useCallback(async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      await document.fonts.ready;
      const element = cardRef.current;
      const prevTransform = element.style.transform;
      element.style.transform = 'none';
      const dataUrl = await toPng(element, {
        pixelRatio: 3,
        backgroundColor: null,
        fontEmbedCSS: fontCSSRef.current || '',
      });
      element.style.transform = prevTransform;
      const slug = (title.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')) || 'trope-cloud';
      const link = document.createElement('a');
      link.download = `${slug}-trope-cloud.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image:', err);
      alert('An error occurred while exporting the image.');
    } finally {
      setIsExporting(false);
    }
  }, [title]);

  // ─── Render excerpt body (shared by card) ──────────────────────
  const renderedExcerpt = (() => {
    const out = [];
    let prevBlank = false;
    excerptLines.forEach((line, idx) => {
      if (line.text === '') {
        out.push(<div key={`b-${idx}`} style={{ height: 14 }} />);
        prevBlank = true;
        return;
      }
      const isShort = line.text.length < 30;
      let color = theme.text;
      let baseWeight = 400;
      let letterSpacing = 'normal';
      if (line.accent) {
        color = theme.accent;
        baseWeight = 500;
        letterSpacing = '0.03em';
      } else if (isShort) {
        color = theme.textMuted;
      }
      if (line.color) color = line.color;
      out.push(
        <div
          key={`l-${idx}`}
          style={{
            color,
            fontWeight: line.bold ? 700 : baseWeight,
            letterSpacing,
            fontStyle: line.italic ? 'italic' : 'normal',
            textDecoration: line.underline ? 'underline' : 'none',
            marginTop: prevBlank ? 16 : 0,
          }}
        >
          {line.text}
        </div>
      );
      prevBlank = false;
    });
    return out;
  })();

  // ─── UI styles ─────────────────────────────────────────────────
  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none';
  const labelCls = 'block text-xs font-medium text-gray-500 mb-1';
  const sectionHeader = (Icon, label) => (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-gray-500" />
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{label}</h2>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-gray-800" style={{ fontFamily: "'Crimson Pro', Georgia, serif" }}>
      {/* LEFT SIDEBAR */}
      <div className="w-full md:w-[400px] flex-shrink-0 bg-white border-r border-gray-200 md:overflow-y-auto md:h-screen shadow-lg z-10 flex flex-col">
        <div className="p-6 flex-1">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
            <Layers className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">Trope Cloud Generator</h1>
          </div>

          {/* Theme */}
          <div className="mb-6">
            {sectionHeader(Palette, 'Theme')}
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(THEMES).map(([key, t]) => {
                const active = key === themeKey;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setThemeKey(key)}
                    className={`relative rounded-md p-2 border transition-all ${active ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200 hover:border-gray-300'}`}
                    title={t.name}
                  >
                    <div
                      className="h-10 rounded mb-1 flex items-center justify-center"
                      style={{ background: t.bg }}
                    >
                      <span className="block w-3 h-3 rounded-full" style={{ background: t.accent }} />
                    </div>
                    <span className="block text-[10px] font-medium text-gray-600 truncate">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font */}
          <div className="mb-6">
            {sectionHeader(Type, 'Excerpt Font')}
            <div className="grid grid-cols-2 gap-2">
              {FONT_OPTIONS.map(f => {
                const active = f.key === fontKey;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFontKey(f.key)}
                    className={`py-2 px-3 text-sm rounded-md border transition-colors ${active ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    style={{ fontFamily: f.family, fontStyle: 'italic' }}
                  >
                    {f.name}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-gray-100 my-6" />

          {/* Header */}
          <div className="mb-6 space-y-3">
            {sectionHeader(Type, 'Header')}
            <div>
              <label className={labelCls}>Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Author</label>
              <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Platform</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={inputCls}>
                {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
              {platform === 'custom' && (
                <input
                  type="text"
                  value={customPlatform}
                  onChange={(e) => setCustomPlatform(e.target.value)}
                  placeholder="e.g. SUBSTACK"
                  className={`${inputCls} mt-2`}
                />
              )}
            </div>
            <div>
              <label className={labelCls}>Fandom</label>
              <input type="text" value={fandom} onChange={(e) => setFandom(e.target.value)} className={inputCls} />
            </div>
          </div>

          <hr className="border-gray-100 my-6" />

          {/* Tags */}
          <div className="mb-6">
            {sectionHeader(TagIcon, `Tags (${tags.length}/${MAX_TAGS})`)}
            <ul className="space-y-1.5 mb-3">
              {tags.map((tag, i) => {
                const p = palette[i % palette.length];
                return (
                  <li key={i} className="flex items-center gap-2">
                    <span
                      className="flex-1 truncate px-2.5 py-1 rounded text-xs"
                      style={{ background: p.bg, color: p.color, borderRadius: theme.radius === 0 ? 2 : 20 }}
                    >
                      {tag}
                    </span>
                    <button type="button" onClick={() => moveTag(i, -1)} disabled={i === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => moveTag(i, 1)} disabled={i === tags.length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => removeTagAt(i)} className="p-1 text-gray-400 hover:text-red-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Add tag…"
                disabled={tags.length >= MAX_TAGS}
                className={inputCls}
              />
              <button
                type="button"
                onClick={addTag}
                disabled={!newTag.trim() || tags.length >= MAX_TAGS}
                className="px-3 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md disabled:opacity-40"
              >
                Add
              </button>
            </div>
          </div>

          <hr className="border-gray-100 my-6" />

          {/* Excerpt */}
          <div className="mb-6">
            {sectionHeader(Quote, 'Excerpt')}
            <div className="flex gap-1 mb-3" role="group" aria-label="Text alignment">
              {[
                { value: 'left',    Icon: AlignLeft,    label: 'Align left' },
                { value: 'center',  Icon: AlignCenter,  label: 'Align center' },
                { value: 'right',   Icon: AlignRight,   label: 'Align right' },
                { value: 'justify', Icon: AlignJustify, label: 'Justify' },
              ].map(({ value, Icon, label }) => {
                const active = excerptAlign === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setExcerptAlign(value)}
                    title={label}
                    aria-label={label}
                    aria-pressed={active}
                    className={`flex-1 flex items-center justify-center py-1.5 rounded-md border transition-colors ${active ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
            <div className="flex gap-1 mb-3" role="group" aria-label="Line formatting">
              {[
                { prop: 'bold',      Icon: Bold,      label: 'Bold' },
                { prop: 'italic',    Icon: Italic,    label: 'Italic' },
                { prop: 'underline', Icon: Underline, label: 'Underline' },
              ].map(({ prop, Icon, label }) => {
                const activeLine = activeLineIdx != null ? excerptLines[activeLineIdx] : null;
                const active = !!(activeLine && activeLine[prop]);
                const disabled = activeLineIdx == null;
                return (
                  <button
                    key={prop}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => toggleLineStyle(prop)}
                    disabled={disabled}
                    title={disabled ? `${label} (click a line first)` : label}
                    aria-label={label}
                    aria-pressed={active}
                    className={`flex-1 flex items-center justify-center py-1.5 rounded-md border transition-colors ${disabled ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed' : active ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
              {(() => {
                const activeLine = activeLineIdx != null ? excerptLines[activeLineIdx] : null;
                const active = !!(activeLine && activeLine.color);
                const disabled = activeLineIdx == null;
                return (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowColorPicker(prev => !prev)}
                    disabled={disabled}
                    title={disabled ? 'Text color (click a line first)' : 'Text color'}
                    aria-label="Text color"
                    aria-pressed={showColorPicker || active}
                    className={`flex-1 flex items-center justify-center py-1.5 rounded-md border transition-colors ${disabled ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed' : (showColorPicker || active) ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  >
                    <Palette className="w-4 h-4" style={active ? { color: activeLine.color } : undefined} />
                  </button>
                );
              })()}
            </div>
            {showColorPicker && activeLineIdx != null && (
              <div className="mb-3 p-2.5 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">{theme.name} palette</p>
                <div className="flex gap-1.5 flex-wrap items-center">
                  {palette.map((p, i) => {
                    const selected = excerptLines[activeLineIdx].color === p.color;
                    return (
                      <button
                        key={i}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setLineColor(p.color)}
                        title={p.color}
                        aria-label={`Set color ${p.color}`}
                        className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 ${selected ? 'ring-2 ring-offset-1 ring-indigo-500 border-indigo-500' : 'border-gray-300'}`}
                        style={{ background: p.color }}
                      />
                    );
                  })}
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setLineColor(null)}
                    className="ml-auto text-[11px] font-medium text-gray-600 px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
            <p className="text-[11px] text-gray-500 mb-3">★ = accent · click a line then B / I / U / color to format it · blank lines = paragraph break</p>
            <ul className="space-y-1.5 mb-3">
              {excerptLines.map((line, i) => (
                <li key={i} className={`flex items-center gap-1.5 rounded px-1 -mx-1 ${activeLineIdx === i ? 'bg-indigo-50/50' : ''}`}>
                  <input
                    type="text"
                    value={line.text}
                    onChange={(e) => updateLineText(i, e.target.value)}
                    onFocus={() => setActiveLineIdx(i)}
                    placeholder="(blank line)"
                    className={inputCls}
                    style={{
                      fontStyle: line.italic ? 'italic' : 'normal',
                      fontWeight: line.bold ? 700 : 400,
                      textDecoration: line.underline ? 'underline' : 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => toggleAccent(i)}
                    className={`p-1.5 rounded transition-colors ${line.accent ? 'bg-amber-100 text-amber-600' : 'text-gray-400 hover:text-gray-700'}`}
                    title={line.accent ? 'Remove accent' : 'Add accent'}
                  >
                    <Star className="w-3.5 h-3.5" fill={line.accent ? 'currentColor' : 'none'} />
                  </button>
                  <button type="button" onClick={() => removeLine(i)} className="p-1 text-gray-400 hover:text-red-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={addLine}
              className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
            >
              <Plus className="w-3.5 h-3.5" /> Add line
            </button>
          </div>

          <hr className="border-gray-100 my-6" />

          {/* Footer */}
          <div className="mb-6 space-y-3">
            {sectionHeader(Layers, 'Footer')}
            <div>
              <label className={labelCls}>Chapter info</label>
              <input type="text" value={chapterInfo} onChange={(e) => setChapterInfo(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>CTA text</label>
              <input type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>

        {/* Sticky Export */}
        <div className="sticky bottom-0 p-6 bg-white border-t border-gray-200">
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || !fontsLoaded}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-70"
          >
            {isExporting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            {isExporting ? 'Generating…' : 'Export PNG'}
          </button>
          <p className="text-center text-xs text-gray-500 mt-3">High-res 3x · ~1560px wide</p>
        </div>
      </div>

      {/* RIGHT WORKSPACE */}
      <div className="flex-grow p-6 md:p-12 flex flex-col items-center justify-center overflow-hidden bg-[#e5e7eb] relative min-h-[80vh]">
        {!fontsLoaded && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1.5 rounded-full z-50 flex items-center gap-2">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Loading fonts…
          </div>
        )}

        <div
          ref={containerRef}
          className="w-full max-w-[520px] shadow-2xl relative"
          style={{
            height: `${cardHeight * scale}px`,
            overflow: 'hidden',
            borderRadius: theme.radius,
          }}
        >
          <div
            ref={cardRef}
            id="trope-cloud-node"
            style={{
              width: 520,
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              background: theme.bg,
              borderRadius: theme.radius,
              overflow: 'hidden',
              opacity: fontsLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease',
              fontFamily: "'Crimson Pro', Georgia, serif",
            }}
          >
            {/* Header block */}
            <div style={{ padding: '28px 32px 20px' }}>
              <div
                style={{
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  fontWeight: 600,
                  color: theme.accent,
                  marginBottom: 8,
                }}
              >
                {theme.ornament ? `${theme.ornament} ` : ''}{author.toUpperCase()} · {platformLabel}
              </div>
              <div
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: 24,
                  fontWeight: 700,
                  color: theme.text,
                  lineHeight: 1.2,
                  marginBottom: 6,
                }}
              >
                {title}
              </div>
              {fandom && (
                <div
                  style={{
                    fontFamily: "'Crimson Pro', Georgia, serif",
                    fontSize: 13,
                    color: theme.textDim,
                  }}
                >
                  {fandom}
                </div>
              )}
            </div>

            {/* Tag pills */}
            {tags.length > 0 && (
              <div style={{ padding: '0 32px 20px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {tags.map((tag, i) => {
                  const p = palette[i % palette.length];
                  return (
                    <span
                      key={i}
                      style={{
                        background: p.bg,
                        color: p.color,
                        padding: '5px 12px',
                        fontSize: 12,
                        fontFamily: "'Crimson Pro', Georgia, serif",
                        borderRadius: theme.radius === 0 ? 2 : 20,
                        display: 'inline-block',
                        lineHeight: 1.2,
                      }}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Ornament divider */}
            {theme.ornament && (
              <div
                style={{
                  textAlign: 'center',
                  color: theme.textDim,
                  fontSize: 8,
                  letterSpacing: 16,
                  paddingBottom: 8,
                }}
              >
                ◆◆◆
              </div>
            )}

            {/* Excerpt block */}
            <div
              style={{
                padding: '24px 32px 28px',
                borderTop: theme.ornament ? 'none' : `1px solid ${theme.border}`,
                fontFamily: font.family,
                fontSize: 15.5,
                lineHeight: 1.9,
                textAlign: excerptAlign,
              }}
            >
              {renderedExcerpt}
            </div>

            {/* Footer bar */}
            <div
              style={{
                padding: '16px 32px 20px',
                borderTop: `1px solid ${theme.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: 12,
                  color: theme.footer,
                }}
              >
                {chapterInfo}
              </div>
              <div
                style={{
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: 11,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  color: theme.footerCta,
                }}
              >
                {ctaText}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
