'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { toPng } from 'html-to-image';
import { ArrowLeft, Download, RefreshCw, LayoutTemplate, Type, Palette, RotateCcw } from 'lucide-react';

// ─── PRESETS ───────────────────────────────────────────────────────────────────

const PRESETS = {
  'aampersand-homepage': {
    site: 'aampersand',
    eyebrow: "YOUR STORY DOESN'T NEED PERMISSION.",
    headlinePrefix: "Run ",
    headlineHighlight: "wild.",
    headlineSuffix: "",
    isHighlightItalic: true,
    subtitle: "See your story. Finally.",
    ampersandSize: 950,
    ampersandX: 0,
    ampersandY: 0,
    showBackgroundWatermark: true,
    backgroundWatermarkChar: "&",
    httpMethod: '',
    routePath: '',
    footerText: '',
    headlinePart1Style: 'normal',
    headlinePart2Style: 'normal',
    colors: {
      bg: "#FAFAF8",
      textDark: "#2B2E34",
      textLight: "#6A7179",
      accent: "#C9B458",
      bgAmpersand: "#F0EDE2"
    }
  },
  'aampersand-devlog': {
    site: 'aampersand',
    eyebrow: "DEVLOG #1 · JANUARY 2026",
    headlinePrefix: "What if Icarus Had ",
    headlineHighlight: "Sunscreen?",
    headlineSuffix: "",
    isHighlightItalic: false,
    subtitle: "Perhaps starting with the second book was not a good idea",
    ampersandSize: 950,
    ampersandX: 0,
    ampersandY: 0,
    showBackgroundWatermark: true,
    backgroundWatermarkChar: "&",
    httpMethod: '',
    routePath: '',
    footerText: '',
    headlinePart1Style: 'normal',
    headlinePart2Style: 'normal',
    colors: {
      bg: "#FAFAF8",
      textDark: "#2B2E34",
      textLight: "#6A7179",
      accent: "#C9B458",
      bgAmpersand: "#F0EDE2"
    }
  },
  'taylormcneil-docs-dark': {
    site: 'taylormcneil',
    eyebrow: '',
    httpMethod: 'PUT',
    routePath: '/aampersand/a-broken-astrolabe',
    headlinePrefix: "A Broken ",
    headlineHighlight: "Astrolabe",
    headlineSuffix: "",
    isHighlightItalic: false,
    subtitle: "This is the design companion to Stranded in Crete",
    footerText: "Taylor McNeil · docs-as-portfolio v1.6",
    ampersandSize: 800,
    ampersandX: 0,
    ampersandY: 0,
    showBackgroundWatermark: false,
    backgroundWatermarkChar: "{ }",
    headlinePart1Style: 'normal',
    headlinePart2Style: 'normal',
    colors: {
      bg: "#0F1419",
      textDark: "#E8ECF1",
      textLight: "#8B95A3",
      accent: "#4A9EE5",
      bgAmpersand: "#1A2030",
    }
  },
  'taylormcneil-devlog-light': {
    site: 'taylormcneil',
    eyebrow: '',
    httpMethod: 'PUT',
    routePath: '/aampersand/march-2026',
    headlinePrefix: "Dust on the ",
    headlineHighlight: "Glass",
    headlineSuffix: "",
    isHighlightItalic: false,
    subtitle: "Somewhere around day 15, my left navbar changed color.",
    footerText: "Taylor McNeil · docs-as-portfolio v1.6",
    ampersandSize: 800,
    ampersandX: 0,
    ampersandY: 0,
    showBackgroundWatermark: false,
    backgroundWatermarkChar: "{ }",
    headlinePart1Style: 'normal',
    headlinePart2Style: 'normal',
    colors: {
      bg: "#FDF8F0",
      textDark: "#2C2C2C",
      textLight: "#6B6B6B",
      accent: "#D4882A",
      bgAmpersand: "#F0EBE3",
    }
  },
  'arynwilder-brand': {
    site: 'arynwilder',
    eyebrow: "UNLICENSED GREMLIN",
    headlinePrefix: "Aryn",
    headlineHighlight: "WILDER.",
    headlineSuffix: "",
    headlinePart1Style: 'italic',
    headlinePart2Style: 'bold-caps',
    isHighlightItalic: false,
    subtitle: "Stories about people who have absolutely no business falling in love",
    footerText: "ARYN WILDER",
    ampersandSize: 950,
    ampersandX: 0,
    ampersandY: 0,
    showBackgroundWatermark: false,
    backgroundWatermarkChar: "",
    httpMethod: '',
    routePath: '',
    colors: {
      bg: "#1A1210",
      textDark: "#F0E6DC",
      textLight: "#9B8B7A",
      accent: "#D4765B",
      bgAmpersand: "#231C18",
    }
  },
};

const PRESET_LABELS = {
  'aampersand-homepage': '"Run Wild"',
  'aampersand-devlog': '"Devlog"',
  'taylormcneil-docs-dark': 'Docs Dark',
  'taylormcneil-devlog-light': 'Devlog Light',
  'arynwilder-brand': 'Author Brand',
};

const METHOD_COLORS = {
  GET:    { bg: "#1B3A4B", text: "#4ECDC4" },
  PUT:    { bg: "#3A2E1B", text: "#E5A84B" },
  POST:   { bg: "#1B3A2E", text: "#4ECD7D" },
  PATCH:  { bg: "#3A1B2E", text: "#CD4E8F" },
  HEAD:   { bg: "#2E1B3A", text: "#8F4ECD" },
  DELETE: { bg: "#3A1B1B", text: "#CD4E4E" },
};

const METHOD_COLORS_LIGHT = {
  GET:    { bg: "#E0F5F2", text: "#1B7A6E" },
  PUT:    { bg: "#FFF0DB", text: "#9E6B1B" },
  POST:   { bg: "#E0F5E8", text: "#1B7A3E" },
  PATCH:  { bg: "#F5E0EE", text: "#7A1B5E" },
  HEAD:   { bg: "#EAE0F5", text: "#5E1B7A" },
  DELETE: { bg: "#F5E0E0", text: "#7A1B1B" },
};

const SITE_BASE_FONT = {
  aampersand: "'Playfair Display', serif",
  taylormcneil: "'Inter', sans-serif",
  arynwilder: "'Playfair Display', serif",
};

const HTTP_METHODS = ['GET', 'PUT', 'POST', 'PATCH', 'HEAD', 'DELETE'];

// ─── FONTS ─────────────────────────────────────────────────────────────────────

const LOCAL_FONTS = [
  { family: 'Fraunces', style: 'normal', weight: 400, src: '/fonts/fraunces-latin-400.woff2' },
  { family: 'Playfair Display', style: 'normal', weight: 400, src: '/fonts/playfair-latin-400.woff2' },
  { family: 'Playfair Display', style: 'normal', weight: 700, src: '/fonts/playfair-latin-700.woff2' },
  { family: 'Playfair Display', style: 'normal', weight: 900, src: '/fonts/playfair-latin-900.woff2' },
  { family: 'Playfair Display', style: 'italic', weight: 400, src: '/fonts/playfair-latin-italic-400.woff2' },
  { family: 'Inter', style: 'normal', weight: 500, src: '/fonts/inter-latin-500.woff2' },
  { family: 'JetBrains Mono', style: 'normal', weight: 400, src: '/fonts/jetbrains-mono-latin-400.woff2' },
  { family: 'DM Sans', style: 'normal', weight: 400, src: '/fonts/dm-sans-latin-400.woff2' },
  { family: 'DM Sans', style: 'italic', weight: 400, src: '/fonts/dm-sans-latin-italic-400.woff2' },
];

function buildFontFaceCSS(fonts) {
  return fonts.map(f =>
    `@font-face { font-family: '${f.family}'; font-style: ${f.style}; font-weight: ${f.weight}; font-display: swap; src: url(${f.src}) format('woff2'); }`
  ).join('\n');
}

// ─── SHARED UI COMPONENTS ──────────────────────────────────────────────────────

function SliderWithInput({ label, value, defaultValue, min, max, step, onChange }) {
  const isDefault = value === defaultValue;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs text-gray-500">{label}</label>
        {!isDefault && (
          <button
            onClick={() => onChange(defaultValue)}
            className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
            title={`Reset to ${defaultValue}`}
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="grow accent-indigo-600"
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
          }}
          className="w-16 px-1.5 py-1 text-xs font-mono text-gray-600 border border-gray-300 rounded text-right focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>
  );
}

// ─── PREVIEW RENDER FUNCTIONS ──────────────────────────────────────────────────

function renderAampersandPreview(data) {
  const { colors } = data;
  return (
    <>
      {/* Background Ampersand Layer */}
      {data.showBackgroundWatermark && (
        <div
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            userSelect: 'none',
            fontFamily: "'Fraunces', serif",
            fontWeight: 400,
            fontSize: `${data.ampersandSize}px`,
            fontStyle: 'normal',
            color: colors.bgAmpersand,
            lineHeight: 1,
            top: '50%',
            left: '50%',
            transform: `translate(calc(-50% + ${data.ampersandX}px), calc(-50% + ${data.ampersandY}px))`,
            zIndex: 0,
          }}
        >
          {data.backgroundWatermarkChar}
        </div>
      )}

      {/* Main Content Layer */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          paddingLeft: '96px',
          paddingRight: '96px',
          textAlign: 'center',
        }}
      >
        {data.eyebrow && (
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '15px',
              letterSpacing: '0.22em',
              color: colors.textLight,
              textTransform: 'uppercase',
              marginBottom: '32px',
              fontWeight: 500
            }}
          >
            {data.eyebrow}
          </div>
        )}

        <div
          style={{
            fontSize: '92px',
            color: colors.textDark,
            lineHeight: 1.1,
            marginBottom: '24px',
            whiteSpace: 'pre-wrap',
          }}
        >
          <span>{data.headlinePrefix}</span>
          {data.headlineHighlight && (
            <span style={{ position: 'relative', display: 'inline-block', whiteSpace: 'nowrap' }}>
              <span
                style={{
                  position: 'absolute',
                  backgroundColor: colors.accent,
                  height: '42%',
                  bottom: '6%',
                  left: '-3%',
                  width: '106%',
                  zIndex: -1,
                }}
              />
              <span style={{ fontStyle: data.isHighlightItalic ? 'italic' : 'normal' }}>
                {data.headlineHighlight}
              </span>
            </span>
          )}
          <span>{data.headlineSuffix}</span>
        </div>

        {data.subtitle && (
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              fontSize: '34px',
              color: colors.textLight,
              marginTop: '16px'
            }}
          >
            {data.subtitle}
          </div>
        )}
      </div>

      {/* Footer Logo */}
      <div
        style={{
          position: 'absolute',
          bottom: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Playfair Display', serif",
          fontSize: '28px',
          fontWeight: 700,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: colors.accent, fontFamily: "'Fraunces', serif", fontStyle: 'normal', fontWeight: 400 }}>&amp;</span>
          <span style={{ color: colors.textDark }}>ampersand</span>
        </div>
      </div>
    </>
  );
}

function renderTaylormcneilPreview(data, activePreset) {
  const { colors } = data;
  const isDark = activePreset.includes('dark');
  const methodColors = isDark ? METHOD_COLORS : METHOD_COLORS_LIGHT;
  const mc = data.httpMethod ? methodColors[data.httpMethod] : null;

  return (
    <>
      {/* Background Watermark Layer */}
      {data.showBackgroundWatermark && (
        <div
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            userSelect: 'none',
            fontFamily: "'JetBrains Mono', 'Inter', monospace",
            fontWeight: 400,
            fontSize: `${data.ampersandSize}px`,
            fontStyle: 'normal',
            color: colors.bgAmpersand,
            lineHeight: 1,
            top: '50%',
            left: '50%',
            transform: `translate(calc(-50% + ${data.ampersandX}px), calc(-50% + ${data.ampersandY}px))`,
            zIndex: 0,
          }}
        >
          {data.backgroundWatermarkChar}
        </div>
      )}

      {/* Main Content Layer */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          paddingLeft: '96px',
          paddingRight: '96px',
          textAlign: 'center',
        }}
      >
        {/* Method Badge + Route Path */}
        {data.httpMethod && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '32px',
            }}
          >
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: mc?.text || colors.textDark,
                backgroundColor: mc?.bg || colors.bgAmpersand,
                padding: '6px 12px',
                borderRadius: '6px',
                letterSpacing: '0.05em',
              }}
            >
              {data.httpMethod}
            </span>
            {data.routePath && (
              <span
                style={{
                  fontFamily: "'JetBrains Mono', 'Inter', monospace",
                  fontSize: '16px',
                  color: colors.textLight,
                }}
              >
                {data.routePath}
              </span>
            )}
          </div>
        )}

        {/* Headline (Inter) */}
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: '92px',
            color: colors.textDark,
            lineHeight: 1.1,
            marginBottom: '24px',
            whiteSpace: 'pre-wrap',
          }}
        >
          <span>{data.headlinePrefix}</span>
          {data.headlineHighlight && (
            <span style={{ position: 'relative', display: 'inline-block', whiteSpace: 'nowrap' }}>
              <span
                style={{
                  position: 'absolute',
                  backgroundColor: colors.accent,
                  height: '42%',
                  bottom: '6%',
                  left: '-3%',
                  width: '106%',
                  zIndex: -1,
                }}
              />
              <span style={{ fontStyle: data.isHighlightItalic ? 'italic' : 'normal' }}>
                {data.headlineHighlight}
              </span>
            </span>
          )}
          <span>{data.headlineSuffix}</span>
        </div>

        {/* Subtitle */}
        {data.subtitle && (
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontStyle: 'italic',
              fontSize: '30px',
              color: colors.textLight,
              marginTop: '16px',
              fontWeight: 400,
            }}
          >
            {data.subtitle}
          </div>
        )}
      </div>

      {/* Footer */}
      {data.footerText && (
        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '18px',
            color: colors.textLight,
            fontWeight: 400,
            zIndex: 10,
          }}
        >
          {data.footerText}
        </div>
      )}
    </>
  );
}

function renderArynwilderPreview(data) {
  const { colors } = data;

  const part1Style = (() => {
    switch (data.headlinePart1Style) {
      case 'italic':
        return { fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400, color: colors.accent, fontSize: '75px' };
      default:
        return { fontFamily: "'Playfair Display', serif", fontStyle: 'normal', fontWeight: 400, color: colors.textDark, fontSize: '75px' };
    }
  })();

  const part2Style = (() => {
    switch (data.headlinePart2Style) {
      case 'bold-caps':
        return { fontFamily: "'Playfair Display', serif", fontStyle: 'normal', fontWeight: 900, color: colors.textDark, fontSize: '100px', textTransform: 'uppercase', letterSpacing: '0.04em' };
      case 'italic':
        return { fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400, color: colors.accent, fontSize: '95px', textTransform: 'none', letterSpacing: 'normal' };
      default:
        return { fontFamily: "'Playfair Display', serif", fontStyle: 'normal', fontWeight: 400, color: colors.textDark, fontSize: '95px', textTransform: 'none', letterSpacing: 'normal' };
    }
  })();

  return (
    <>
      {/* Main Content Layer */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          paddingLeft: '96px',
          paddingRight: '96px',
          textAlign: 'center',
        }}
      >
        {/* Eyebrow */}
        {data.eyebrow && (
          <div
            style={{
              fontFamily: "'DM Sans', 'Inter', sans-serif",
              fontSize: '15px',
              letterSpacing: '0.22em',
              color: colors.accent,
              textTransform: 'uppercase',
              marginBottom: '32px',
              fontWeight: 400,
            }}
          >
            {data.eyebrow}
          </div>
        )}

        {/* Stacked Split-Type Headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '24px',
          }}
        >
          {data.headlinePrefix && (
            <div style={{ lineHeight: 1.1, ...part1Style }}>
              {data.headlinePrefix}
            </div>
          )}
          {data.headlineHighlight && (
            <div style={{ lineHeight: 1.1, ...part2Style }}>
              {data.headlineHighlight}
            </div>
          )}
        </div>

        {/* Subtitle */}
        {data.subtitle && (
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              fontSize: '30px',
              color: colors.textLight,
              marginTop: '16px',
            }}
          >
            {data.subtitle}
          </div>
        )}
      </div>

      {/* Footer */}
      {data.footerText && (
        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            fontFamily: "'DM Sans', 'Inter', sans-serif",
            fontSize: '16px',
            color: colors.textLight,
            letterSpacing: '0.15em',
            fontWeight: 400,
            zIndex: 10,
          }}
        >
          {data.footerText}
        </div>
      )}
    </>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function OgImageMaker() {
  const [activeSite, setActiveSite] = useState('aampersand');
  const [activePreset, setActivePreset] = useState('aampersand-homepage');
  const [data, setData] = useState(PRESETS['aampersand-homepage']);
  const [isExporting, setIsExporting] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);
  const fontCSSRef = useRef(null);

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

    document.fonts.ready.then(() => {
      setFontsLoaded(true);
    });

    const updateScale = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.offsetWidth;
        setScale(Math.min(1, parentWidth / 1200));
      }
    };

    window.addEventListener('resize', updateScale);
    setTimeout(updateScale, 100);

    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await document.fonts.ready;
      const element = document.getElementById('og-preview-node');
      const prevTransform = element.style.transform;
      element.style.transform = 'none';

      const dataUrl = await toPng(element, {
        width: 1200,
        height: 630,
        pixelRatio: 2,
        fontEmbedCSS: fontCSSRef.current || '',
      });

      element.style.transform = prevTransform;

      const link = document.createElement('a');
      link.download = `og-${activeSite}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to export image:", error);
      alert("An error occurred while exporting the image.");
    } finally {
      setIsExporting(false);
    }
  };

  const loadPreset = (key) => {
    setActivePreset(key);
    setActiveSite(PRESETS[key].site);
    setData(PRESETS[key]);
  };

  const switchSite = (site) => {
    const firstPreset = Object.keys(PRESETS).find(k => PRESETS[k].site === site);
    loadPreset(firstPreset);
  };

  const updateField = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateColor = (field, value) => {
    setData(prev => ({
      ...prev,
      colors: { ...prev.colors, [field]: value }
    }));
  };

  const sitePresets = Object.entries(PRESETS).filter(([, p]) => p.site === activeSite);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* LEFT SIDEBAR */}
      <div className="w-full md:w-[400px] flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto h-screen shadow-lg z-10">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8 border-b pb-4">
            <Link
              href="/tools"
              aria-label="Back to tools"
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <LayoutTemplate className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">OG Image Maker</h1>
          </div>
          <div className="space-y-6">

            {/* Site Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Site</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => switchSite('aampersand')}
                  className={`py-2 px-2 text-sm rounded-md border transition-colors ${activeSite === 'aampersand' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  <span style={{ fontFamily: "'Fraunces', serif" }}>&amp;</span>ampersand
                </button>
                <button
                  onClick={() => switchSite('taylormcneil')}
                  className={`py-2 px-2 text-xs rounded-md border transition-colors font-mono ${activeSite === 'taylormcneil' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  taylormcneil
                </button>
                <button
                  onClick={() => switchSite('arynwilder')}
                  className={`py-2 px-2 text-sm rounded-md border transition-colors ${activeSite === 'arynwilder' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  arynwilder
                </button>
              </div>
            </div>
            <hr className="border-gray-100" />

            {/* Templates */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Templates</label>
              <div className={`grid gap-2 ${sitePresets.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {sitePresets.map(([key]) => (
                  <button
                    key={key}
                    onClick={() => loadPreset(key)}
                    className={`py-2 px-3 text-sm rounded-md border transition-colors ${activePreset === key ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {PRESET_LABELS[key]}
                  </button>
                ))}
              </div>
            </div>
            <hr className="border-gray-100" />

            {/* Content */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Type className="w-4 h-4 text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Content</h2>
              </div>

              {/* HTTP Method + Route Path (taylormcneil only) */}
              {activeSite === 'taylormcneil' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">HTTP Method</label>
                    <select
                      value={data.httpMethod}
                      onChange={(e) => updateField('httpMethod', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    >
                      <option value="">None</option>
                      {HTTP_METHODS.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Route Path</label>
                    <input
                      type="text"
                      value={data.routePath}
                      onChange={(e) => updateField('routePath', e.target.value)}
                      placeholder="/api/v1/users"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </>
              )}

              {/* Eyebrow (aampersand and arynwilder) */}
              {activeSite !== 'taylormcneil' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Eyebrow Text</label>
                  <input
                    type="text"
                    value={data.eyebrow}
                    onChange={(e) => updateField('eyebrow', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}

              {/* Headline */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-3">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Main Headline</label>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {activeSite === 'arynwilder' ? 'Part 1 (Stacked Top)' : 'Part 1 (Normal)'}
                  </label>
                  <input
                    type="text"
                    value={data.headlinePrefix}
                    onChange={(e) => updateField('headlinePrefix', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs text-gray-500">
                      {activeSite === 'arynwilder' ? 'Part 2 (Stacked Bottom)' : 'Part 2 (Highlighted)'}
                    </label>
                    {activeSite !== 'arynwilder' && (
                      <label className="flex items-center gap-1 text-xs text-indigo-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.isHighlightItalic}
                          onChange={(e) => updateField('isHighlightItalic', e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        Italicize
                      </label>
                    )}
                  </div>
                  <input
                    type="text"
                    value={data.headlineHighlight}
                    onChange={(e) => updateField('headlineHighlight', e.target.value)}
                    className={`w-full px-3 py-2 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium ${activeSite === 'arynwilder' ? 'border border-gray-300' : 'border border-indigo-300 bg-indigo-50/30'}`}
                  />
                </div>
                {activeSite !== 'arynwilder' && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Part 3 (Normal)</label>
                    <input
                      type="text"
                      value={data.headlineSuffix}
                      onChange={(e) => updateField('headlineSuffix', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>

              {/* Headline Part Styles (arynwilder only) */}
              {activeSite === 'arynwilder' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Part 1 Style</label>
                    <select
                      value={data.headlinePart1Style}
                      onChange={(e) => updateField('headlinePart1Style', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    >
                      <option value="italic">Italic Serif</option>
                      <option value="normal">Normal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Part 2 Style</label>
                    <select
                      value={data.headlinePart2Style}
                      onChange={(e) => updateField('headlinePart2Style', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    >
                      <option value="bold-caps">Bold Caps</option>
                      <option value="normal">Normal</option>
                      <option value="italic">Italic</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Subtitle (Italic)</label>
                <input
                  type="text"
                  value={data.subtitle}
                  onChange={(e) => updateField('subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <hr className="border-gray-100" />

            {/* Colors */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-4 h-4 text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Colors</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Background", key: "bg" },
                  { label: "Accent", key: "accent" },
                  { label: "Main Text", key: "textDark" },
                  { label: "Subtext", key: "textLight" },
                ].map((c) => (
                  <div key={c.key}>
                    <label className="block text-xs text-gray-500 mb-1">{c.label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={data.colors[c.key]}
                        onChange={(e) => updateColor(c.key, e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                      />
                      <span className="text-xs text-gray-600 uppercase font-mono">{data.colors[c.key]}</span>
                    </div>
                  </div>
                ))}
                {data.showBackgroundWatermark && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Watermark</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={data.colors.bgAmpersand}
                        onChange={(e) => updateColor('bgAmpersand', e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                      />
                      <span className="text-xs text-gray-600 uppercase font-mono">{data.colors.bgAmpersand}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <hr className="border-gray-100" />

            {/* Background Watermark (not arynwilder) */}
            {activeSite !== 'arynwilder' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-700">Background Watermark</label>
                  <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.showBackgroundWatermark}
                      onChange={(e) => updateField('showBackgroundWatermark', e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    Show
                  </label>
                </div>
                {data.showBackgroundWatermark && (
                  <>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Character</label>
                      <input
                        type="text"
                        value={data.backgroundWatermarkChar}
                        onChange={(e) => updateField('backgroundWatermarkChar', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <SliderWithInput
                      label="Size"
                      value={data.ampersandSize}
                      defaultValue={PRESETS[activePreset].ampersandSize}
                      min={200} max={1600} step={10}
                      onChange={(v) => updateField('ampersandSize', v)}
                    />
                    <SliderWithInput
                      label="Horizontal Offset"
                      value={data.ampersandX}
                      defaultValue={PRESETS[activePreset].ampersandX}
                      min={-500} max={500} step={5}
                      onChange={(v) => updateField('ampersandX', v)}
                    />
                    <SliderWithInput
                      label="Vertical Offset"
                      value={data.ampersandY}
                      defaultValue={PRESETS[activePreset].ampersandY}
                      min={-300} max={300} step={5}
                      onChange={(v) => updateField('ampersandY', v)}
                    />
                  </>
                )}
              </div>
            )}

            {/* Footer Text (taylormcneil and arynwilder) */}
            {activeSite !== 'aampersand' && (
              <>
                <hr className="border-gray-100" />
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Footer Text</label>
                  <input
                    type="text"
                    value={data.footerText}
                    onChange={(e) => updateField('footerText', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sticky Export Button */}
        <div className="sticky bottom-0 p-6 bg-white border-t border-gray-200">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-70"
          >
            {isExporting ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            {isExporting ? 'Generating...' : 'Export PNG'}
          </button>
          <p className="text-center text-xs text-gray-500 mt-3">Renders a high-res 2400×1260 image (2x)</p>
        </div>
      </div>

      {/* RIGHT WORKSPACE - PREVIEW */}
      <div className="flex-grow p-6 md:p-12 flex flex-col items-center justify-center overflow-hidden bg-[#e5e7eb] relative">
        {!fontsLoaded && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1.5 rounded-full z-50 flex items-center gap-2">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Loading fonts…
          </div>
        )}

        <div
          ref={containerRef}
          className="w-full max-w-[1200px] mx-auto shadow-2xl relative rounded-md overflow-hidden"
          style={{ aspectRatio: '1200 / 630' }}
        >
          <div
            id="og-preview-node"
            style={{
              width: '1200px',
              height: '630px',
              backgroundColor: data.colors.bg,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              position: 'absolute',
              top: 0,
              left: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: SITE_BASE_FONT[activeSite],
              opacity: fontsLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          >
            {activeSite === 'aampersand' && renderAampersandPreview(data)}
            {activeSite === 'taylormcneil' && renderTaylormcneilPreview(data, activePreset)}
            {activeSite === 'arynwilder' && renderArynwilderPreview(data)}
          </div>
        </div>
      </div>
    </div>
  );
}
