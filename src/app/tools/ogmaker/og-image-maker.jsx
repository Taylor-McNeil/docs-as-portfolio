'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { toPng } from 'html-to-image';
import { ArrowLeft, Download, RefreshCw, LayoutTemplate, Type, Palette, RotateCcw } from 'lucide-react';

const PRESETS = {
  homepage: {
    eyebrow: "YOUR STORY DOESN'T NEED PERMISSION.",
    headlinePrefix: "Run ",
    headlineHighlight: "wild.",
    headlineSuffix: "",
    isHighlightItalic: true,
    subtitle: "See your story. Finally.",
    ampersandSize: 950,
    ampersandX: 0,
    ampersandY: 0,
    colors: {
      bg: "#FAFAF8",
      textDark: "#2B2E34",
      textLight: "#6A7179",
      accent: "#C9B458",
      bgAmpersand: "#F0EDE2"
    }
  },
  devlog: {
    eyebrow: "DEVLOG #1 · JANUARY 2026",
    headlinePrefix: "What if Icarus Had ",
    headlineHighlight: "Sunscreen?",
    headlineSuffix: "",
    isHighlightItalic: false,
    subtitle: "Perhaps starting with the second book was not a good idea",
    ampersandSize: 950,
    ampersandX: 0,
    ampersandY: 0,
    colors: {
      bg: "#FAFAF8",
      textDark: "#2B2E34",
      textLight: "#6A7179",
      accent: "#C9B458",
      bgAmpersand: "#F0EDE2"
    }
  }
};

// Self-hosted font files (same-origin, no CORS issues)
const LOCAL_FONTS = [
  { family: 'Fraunces', style: 'normal', weight: 400, src: '/fonts/fraunces-latin-400.woff2' },
  { family: 'Playfair Display', style: 'normal', weight: 400, src: '/fonts/playfair-latin-400.woff2' },
  { family: 'Playfair Display', style: 'normal', weight: 700, src: '/fonts/playfair-latin-700.woff2' },
  { family: 'Playfair Display', style: 'italic', weight: 400, src: '/fonts/playfair-latin-italic-400.woff2' },
  { family: 'Inter', style: 'normal', weight: 500, src: '/fonts/inter-latin-500.woff2' },
];

function buildFontFaceCSS(fonts) {
  return fonts.map(f =>
    `@font-face { font-family: '${f.family}'; font-style: ${f.style}; font-weight: ${f.weight}; font-display: swap; src: url(${f.src}) format('woff2'); }`
  ).join('\n');
}

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

export default function OgImageMaker() {
  const [activePreset, setActivePreset] = useState('homepage');
  const [data, setData] = useState(PRESETS.homepage);
  const [isExporting, setIsExporting] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);
  const fontCSSRef = useRef(null);

  useEffect(() => {
    // Inject self-hosted @font-face rules for page display
    const style = document.createElement('style');
    style.textContent = buildFontFaceCSS(LOCAL_FONTS);
    document.head.appendChild(style);

    // Pre-fetch font files and build base64-inlined @font-face CSS for export.
    // Same-origin files, so no CORS issues.
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

    // Wait for all fonts to finish loading
    document.fonts.ready.then(() => {
      setFontsLoaded(true);
    });

    // Handle responsive preview scaling
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

      // Temporarily remove the display scale transform
      // so we capture the element at its true 1200×630 size.
      const prevTransform = element.style.transform;
      element.style.transform = 'none';

      const dataUrl = await toPng(element, {
        width: 1200,
        height: 630,
        pixelRatio: 2, // 2x for crisp/retina output
        // Provide our base64-inlined font CSS so html-to-image uses it directly
        // instead of scanning document.styleSheets (which causes CORS errors).
        fontEmbedCSS: fontCSSRef.current || '',
      });

      // Restore the preview scale transform
      element.style.transform = prevTransform;

      const link = document.createElement('a');
      link.download = `og-image-${Date.now()}.png`;
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
    setData(PRESETS[key]);
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* LEFT SIDEBAR - CONTROLS */}
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

            {/* Presets */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Templates</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => loadPreset('homepage')}
                  className={`py-2 px-3 text-sm rounded-md border transition-colors ${activePreset === 'homepage' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  "Run Wild"
                </button>
                <button
                  onClick={() => loadPreset('devlog')}
                  className={`py-2 px-3 text-sm rounded-md border transition-colors ${activePreset === 'devlog' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  "Devlog"
                </button>
              </div>
            </div>
            <hr className="border-gray-100" />

            {/* Text Content */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Type className="w-4 h-4 text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Content</h2>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Eyebrow Text</label>
                <input
                  type="text"
                  value={data.eyebrow}
                  onChange={(e) => updateField('eyebrow', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-3">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Main Headline</label>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Part 1 (Normal)</label>
                  <input
                    type="text"
                    value={data.headlinePrefix}
                    onChange={(e) => updateField('headlinePrefix', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs text-gray-500">Part 2 (Highlighted)</label>
                    <label className="flex items-center gap-1 text-xs text-indigo-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.isHighlightItalic}
                        onChange={(e) => updateField('isHighlightItalic', e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      Italicize
                    </label>
                  </div>
                  <input
                    type="text"
                    value={data.headlineHighlight}
                    onChange={(e) => updateField('headlineHighlight', e.target.value)}
                    className="w-full px-3 py-2 border border-indigo-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-indigo-50/30 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Part 3 (Normal)</label>
                  <input
                    type="text"
                    value={data.headlineSuffix}
                    onChange={(e) => updateField('headlineSuffix', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
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
              </div>
            </div>
            <hr className="border-gray-100" />

            {/* Background Ampersand */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Background &amp;</label>
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
            </div>
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

        {/* Font loading indicator */}
        {!fontsLoaded && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1.5 rounded-full z-50 flex items-center gap-2">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Loading fonts…
          </div>
        )}

        {/* Responsive Container for the absolute 1200x630 element */}
        <div
          ref={containerRef}
          className="w-full max-w-[1200px] mx-auto shadow-2xl relative rounded-md overflow-hidden"
          style={{
            aspectRatio: '1200 / 630',
          }}
        >
          {/* THE ACTUAL OG IMAGE ELEMENT TO BE CAPTURED */}
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
              fontFamily: "'Playfair Display', serif",
              // Hide content until fonts load to prevent flash of wrong glyphs
              opacity: fontsLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          >

            {/* Background Ampersand Layer */}
            <div
              style={{
                position: 'absolute',
                pointerEvents: 'none',
                userSelect: 'none',
                fontFamily: "'Fraunces', serif",
                fontWeight: 400,
                fontSize: `${data.ampersandSize}px`,
                fontStyle: 'normal',
                color: data.colors.bgAmpersand,
                lineHeight: 1,
                top: '50%',
                left: '50%',
                transform: `translate(calc(-50% + ${data.ampersandX}px), calc(-50% + ${data.ampersandY}px))`,
                zIndex: 0,
              }}
            >
              &amp;
            </div>

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
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '15px',
                    letterSpacing: '0.22em',
                    color: data.colors.textLight,
                    textTransform: 'uppercase',
                    marginBottom: '32px',
                    fontWeight: 500
                  }}
                >
                  {data.eyebrow}
                </div>
              )}

              {/* Headline */}
              <div
                style={{
                  fontSize: '92px',
                  color: data.colors.textDark,
                  lineHeight: 1.1,
                  marginBottom: '24px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                <span>{data.headlinePrefix}</span>

                {/* Highlighted Word Segment */}
                {data.headlineHighlight && (
                  <span style={{ position: 'relative', display: 'inline-block', whiteSpace: 'nowrap' }}>
                    {/* The highlight box */}
                    <span
                      style={{
                        position: 'absolute',
                        backgroundColor: data.colors.accent,
                        height: '42%',
                        bottom: '6%',
                        left: '-3%',
                        width: '106%',
                        zIndex: -1,
                      }}
                    />
                    {/* The text itself */}
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
                    fontFamily: "'Playfair Display', serif",
                    fontStyle: 'italic',
                    fontSize: '34px',
                    color: data.colors.textLight,
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
                <span style={{ color: data.colors.accent, fontFamily: "'Fraunces', serif", fontStyle: 'normal', fontWeight: 400 }}>&amp;</span>
                <span style={{ color: data.colors.textDark }}>ampersand</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
