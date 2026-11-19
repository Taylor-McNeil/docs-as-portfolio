import { careerOrder, docLinks, type Star } from "./constellationData";

/**
 * Canvas renderer for the homepage constellation. Framework-free so the
 * animation loop never re-renders React; ConstellationHero owns its lifecycle.
 *
 * Dark theme draws a night sky (seeded stars, a faint galactic band with a
 * violet nebula and a dust lane, a few slow scintillating stars). Light theme
 * draws an antique star chart (sepia ink dots, engraved crosses, a celestial
 * grid and a dashed ecliptic). Both skies are baked to an offscreen canvas.
 */

type Rgb = string; // "r,g,b"

interface Twinkler {
  x: number;
  y: number;
  r: number;
  a: number;
  rgb: Rgb;
  s1: number;
  s2: number;
  p1: number;
  p2: number;
  halo: boolean;
}

interface Colors {
  career: string;
  docs: string;
  devlog: string;
  node: string;
  head: string;
  fg: string;
  muted: string;
  accent: string;
  mono: string;
}

interface Options {
  canvas: HTMLCanvasElement;
  tip: HTMLElement;
  /** Element whose CSS custom properties hold the theme colours. */
  scope: HTMLElement;
  stars: Star[];
  trail: string[];
  onOpen: (href: string) => void;
}

const PHONE_WIDTH = 640;

/** Where a two-line career label sits on desktop: its box, which way the text runs from x, and whether the version comes first. */
type CareerLabel = { x: number; y: number; w: number; align: "center" | "left" | "right"; vFirst: boolean };

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
function gauss(r: () => number) {
  return (r() + r() + r() + r() - 2) * 1.73;
}
function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function dot(g: CanvasRenderingContext2D, x: number, y: number, r: number, rgb: Rgb, a: number) {
  g.fillStyle = `rgba(${rgb},${a.toFixed(3)})`;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
}
function blob(g: CanvasRenderingContext2D, x: number, y: number, r: number, rgb: Rgb, a: number) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, `rgba(${rgb},${a})`);
  gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
}

export class ConstellationScene {
  private cvs: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private tip: HTMLElement;
  private scope: HTMLElement;
  private stars: Star[];
  private byId: Record<string, Star>;
  private trail: string[];
  private onOpen: (href: string) => void;
  private reveal: Record<string, number> = {};
  private phase: Record<string, number> = {};

  private W = 0;
  private H = 0;
  private col!: Colors;
  private dark = true;
  private reduce = false;
  private running = false;
  private raf = 0;
  private t0 = 0;
  private hover: Star | null = null;
  /** Desktop label sides, worked out once per size so labels never flicker between frames. */
  private sides: Record<string, "right" | "left" | "hide"> = {};
  private careerLabels: Record<string, CareerLabel | null> = {};
  private sidesFor = "";
  private touchy = false;

  private sky = document.createElement("canvas");
  private sctx: CanvasRenderingContext2D;
  private twinkle: Twinkler[] = [];

  private cleanup: (() => void)[] = [];

  constructor(o: Options) {
    this.cvs = o.canvas;
    this.ctx = o.canvas.getContext("2d")!;
    this.sctx = this.sky.getContext("2d")!;
    this.tip = o.tip;
    this.scope = o.scope;
    this.stars = o.stars;
    this.trail = o.trail;
    this.onOpen = o.onOpen;
    this.byId = Object.fromEntries(o.stars.map((s) => [s.id, s]));
    o.stars.forEach((s, i) => (this.phase[s.id] = i * 1.7));

    // Load order: the career arc first, then what hangs off it.
    careerOrder.forEach((id, i) => (this.reveal[id] = i * 90));
    docLinks.forEach(([id], i) => (this.reveal[id] = 950 + i * 70));
    this.trail.slice(1).forEach((id, i) => (this.reveal[id] = 1000 + i * 90));

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reduce = motion.matches;
    const onMotion = () => {
      this.reduce = motion.matches;
      this.restart();
    };
    motion.addEventListener("change", onMotion);
    this.cleanup.push(() => motion.removeEventListener("change", onMotion));

    const ro = new ResizeObserver(() => {
      this.size();
      if (this.reduce) this.draw(0);
    });
    ro.observe(this.cvs);
    this.cleanup.push(() => ro.disconnect());

    // Label places depend on text widths and the headline's height, so work them out again once fonts load or the headline resizes.
    const relabel = () => {
      this.sidesFor = "";
      if (this.reduce) this.draw(0);
    };
    document.fonts.addEventListener("loadingdone", relabel);
    void document.fonts.ready.then(relabel);
    this.cleanup.push(() => document.fonts.removeEventListener("loadingdone", relabel));
    const copyEl = this.scope.querySelector<HTMLElement>("[data-hero-copy]");
    if (copyEl) {
      const co = new ResizeObserver(relabel);
      co.observe(copyEl);
      this.cleanup.push(() => co.disconnect());
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = this.cvs.getBoundingClientRect();
      this.setHover(this.hit(e.clientX - r.left, e.clientY - r.top));
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "mouse") this.setHover(null);
    };
    // Mouse: click opens. Touch: the first tap shows the card, a second tap on the same star opens it.
    const onClick = (e: MouseEvent) => {
      const r = this.cvs.getBoundingClientRect();
      const h = this.hit(e.clientX - r.left, e.clientY - r.top);
      const pointerType = (e as PointerEvent).pointerType;
      this.touchy = !!pointerType && pointerType !== "mouse";
      if (h && (!this.touchy || h === this.hover)) this.onOpen(h.href);
      else this.setHover(h);
    };
    this.cvs.addEventListener("pointermove", onMove);
    this.cvs.addEventListener("pointerleave", onLeave);
    this.cvs.addEventListener("click", onClick);
    this.cleanup.push(() => {
      this.cvs.removeEventListener("pointermove", onMove);
      this.cvs.removeEventListener("pointerleave", onLeave);
      this.cvs.removeEventListener("click", onClick);
    });

    // Watch the theme class on <html> directly. A React effect keyed on the theme can run
    // before next-themes has swapped the class, which left the old theme's colours and sky.
    const themeObserver = new MutationObserver(() => {
      const dark = document.documentElement.classList.contains("dark");
      if (dark !== this.dark) this.setTheme();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    this.cleanup.push(() => themeObserver.disconnect());

    this.readColors();
    this.size();
    this.restart();
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.cleanup.forEach((fn) => fn());
  }

  /** Repaint for the current site theme and replay the fade-in. */
  setTheme() {
    this.readColors();
    this.sidesFor = "";
    this.buildSky();
    this.t0 = 0;
    this.restart();
  }

  private restart() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    if (this.reduce) {
      this.draw(0);
      return;
    }
    if (!this.t0) this.t0 = performance.now();
    this.running = true;
    const loop = (t: number) => {
      this.draw(t);
      if (this.running) this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  private css(name: string) {
    return getComputedStyle(this.scope).getPropertyValue(name).trim();
  }

  private readColors() {
    this.dark = document.documentElement.classList.contains("dark");
    const mono = this.css("--font-jetbrains") || this.css("--font-mono") || "monospace";
    this.col = {
      career: this.css("--color-edge-character"),
      docs: this.css("--color-edge-clue"),
      devlog: this.css("--color-edge-promise"),
      node: this.css("--color-node-fill"),
      head: this.css("--color-foreground-heading"),
      fg: this.css("--color-foreground"),
      muted: this.css("--color-foreground-muted"),
      accent: this.css("--color-accent"),
      mono,
    };
  }

  private kindColor(s: Star) {
    switch (s.kind) {
      case "career":
        return this.col.career;
      case "break":
        return this.col.muted;
      case "now":
        return this.col.accent;
      case "docs":
        return this.col.docs;
      default:
        return this.col.devlog;
    }
  }

  private narrow() {
    return this.W < PHONE_WIDTH;
  }

  private size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = this.cvs.clientWidth;
    this.H = this.cvs.clientHeight;
    this.cvs.width = Math.round(this.W * dpr);
    this.cvs.height = Math.round(this.H * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.buildSky();
  }

  // ---------- sky ----------

  /** The headline corner on desktop, kept nearly empty. */
  private inCopy(x: number, y: number) {
    return !this.narrow() && x < 0.64 && y > 0.45;
  }

  /** True when a point would sit on a star of the graph or on its label. */
  private onNode(x: number, y: number) {
    const { W, H } = this;
    return this.stars.some((n) => {
      const c = this.narrow() ? n.m : n.d;
      const dx = (x - c[0]) * W;
      const dy = Math.abs(c[1] - y) * H;
      const arc = n.kind === "career" || n.kind === "now" || n.kind === "break";
      return arc ? Math.abs(dx) < 75 && dy < 50 : dx > -34 && dx < 210 && dy < 22;
    });
  }

  private buildSky() {
    if (!this.W) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.sky.width = Math.round(this.W * dpr);
    this.sky.height = Math.round(this.H * dpr);
    this.sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.sctx.clearRect(0, 0, this.W, this.H);
    this.twinkle = [];
    if (this.dark) this.buildNight();
    else this.buildChart();
  }

  private buildNight() {
    const { W, H } = this;
    const r = rng(20181);
    const g = this.sctx;
    // A galactic band from the upper middle down to the lower right, through the open sky.
    const ax = 0.3 * W, ay = -0.1 * H, bx = 0.98 * W, by = 1.1 * H;
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy);
    const ux = dx / L, uy = dy / L, sig = Math.max(W, H) * 0.09;
    const band = (x: number, y: number) => ((x - ax) * uy - (y - ay) * ux) / sig;
    const along = (s: number, off: number): [number, number] => [ax + ux * s + uy * off, ay + uy * s - ux * off];

    g.globalCompositeOperation = "lighter";
    for (let i = 0; i < 90; i++) {
      const off = gauss(r) * sig * 0.5;
      const [x, y] = along(r() * L, off);
      const tint = r() < 0.35 ? "255,228,200" : "190,208,255";
      const fade = Math.max(0, 1 - Math.abs(off) / (1.8 * sig)) * (this.inCopy(x / W, y / H) ? 0.4 : 1);
      blob(g, x, y, sig * (0.35 + r() * 0.9), tint, 0.026 * fade);
    }
    // A hint of violet nebula where the band crosses the open sky, and a fainter wash up top.
    for (let i = 0; i < 26; i++) {
      const [x, y] = along(L * (0.58 + gauss(r) * 0.07), gauss(r) * sig * 0.45);
      blob(g, x, y, sig * (0.25 + r() * 0.6), r() < 0.5 ? "150,100,235" : "205,125,240", 0.035 + r() * 0.025);
    }
    {
      const [x, y] = along(L * 0.2, 0);
      blob(g, x, y, sig * 0.9, "140,105,230", 0.04);
    }
    // A dust lane just off the band's spine.
    g.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 34; i++) {
      const [x, y] = along(r() * L, sig * 0.18 + gauss(r) * sig * 0.1);
      blob(g, x, y, sig * (0.12 + r() * 0.22), "0,0,0", 0.45);
    }
    g.globalCompositeOperation = "source-over";

    const tint = () => {
      const c = r();
      return c < 0.16 ? "196,214,255" : c < 0.68 ? "242,245,255" : c < 0.9 ? "255,241,218" : "255,214,176";
    };
    const star = (x: number, y: number, mag: number, faint = false) => {
      if (x < 0 || y < 0 || x > 1 || y > 1) return;
      const copy = this.inCopy(x, y);
      const a = (0.09 + 0.72 * Math.pow(mag, 2.6)) * (faint ? 0.75 : 1) * (copy ? 0.6 : 1);
      const rad = 0.35 + 0.95 * Math.pow(mag, 3);
      const rgb = tint();
      if (a > 0.42 && !copy && r() < 0.45) {
        this.twinkle.push({ x, y, r: rad, a, rgb, s1: 0.0006 + r() * 0.0009, s2: 0.0021 + r() * 0.002, p1: r() * 6.28, p2: r() * 6.28, halo: false });
      } else dot(g, x * W, y * H, rad, rgb, a);
    };

    const count = Math.round((W * H) / 650);
    for (let made = 0, tries = 0; made < count && tries < count * 6; tries++) {
      const x = r(), y = r();
      const d = band(x * W, y * H);
      let keep = 0.28 + 0.72 * Math.exp(-d * d * 0.7);
      if (this.inCopy(x, y)) keep *= 0.3;
      if (r() > keep) continue;
      star(x, y, r(), Math.abs(d) < 1.2);
      made++;
    }
    // Two loose clusters in the open patches.
    const clusters: [number, number, number][] = this.narrow()
      ? [[0.3, 0.4, 16], [0.82, 0.3, 20]]
      : [[0.4, 0.42, 16], [0.875, 0.665, 20]];
    clusters.forEach(([cx, cy, n]) => {
      for (let j = 0; j < n; j++) star(cx + (gauss(r) * 9) / W, cy + (gauss(r) * 9) / H, Math.pow(r(), 1.4) * 0.8);
    });
    // A handful of bright stars with a soft halo, never on a node or a label.
    const bright = Math.max(5, Math.round((W * H) / 60000));
    for (let b = 0, tries = 0; b < bright && tries < 400; tries++) {
      const x = r(), y = r();
      if (this.inCopy(x, y) || this.onNode(x, y) || y > 0.9) continue;
      const rgb = tint(), rad = 1.15 + r() * 0.7;
      blob(g, x * W, y * H, rad * 5.5, rgb, 0.16);
      this.twinkle.push({ x, y, r: rad, a: 0.95, rgb, s1: 0.0004 + r() * 0.0006, s2: 0.0017 + r() * 0.0015, p1: r() * 6.28, p2: r() * 6.28, halo: true });
      b++;
    }
  }

  private buildChart() {
    const { W, H } = this;
    const r = rng(1603);
    const g = this.sctx;
    const ink = "92,64,40";
    const serif = "italic 10px Georgia, 'Times New Roman', serif";

    // Aged-paper edge.
    const vg = g.createRadialGradient(W * 0.6, H * 0.45, Math.min(W, H) * 0.35, W * 0.6, H * 0.45, Math.max(W, H) * 0.85);
    vg.addColorStop(0, `rgba(${ink},0)`);
    vg.addColorStop(1, `rgba(${ink},0.07)`);
    g.fillStyle = vg;
    g.fillRect(0, 0, W, H);

    // Celestial grid: declination circles round a pole above the frame, hour lines out from it.
    const px = W * 0.58, py = -H * 0.95;
    const rMin = Math.abs(py) * 0.98;
    const rMax = Math.hypot(Math.max(px, W - px), H - py);
    const step = this.narrow() ? 46 : 62;
    g.lineWidth = 0.8;
    g.strokeStyle = `rgba(${ink},1)`;
    for (let rad = Math.ceil(rMin / step) * step, n = 0; rad < rMax; rad += step, n++) {
      g.globalAlpha = n % 3 === 0 ? 0.26 : 0.14;
      g.beginPath();
      g.arc(px, py, rad, 0, Math.PI);
      g.stroke();
    }
    const deg = Math.PI / 180;
    const a0 = Math.atan2(H - py, -px), a1 = Math.atan2(H - py, W - px);
    const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    for (let ang = Math.ceil(a1 / (7.5 * deg)) * 7.5 * deg; ang < a0; ang += 7.5 * deg) {
      const major = Math.round(ang / (7.5 * deg)) % 2 === 0;
      g.globalAlpha = major ? 0.24 : 0.12;
      g.beginPath();
      g.moveTo(px + Math.cos(ang) * rMin, py + Math.sin(ang) * rMin);
      g.lineTo(px + Math.cos(ang) * rMax, py + Math.sin(ang) * rMax);
      g.stroke();
      // Hour label where a major line meets the top edge, clear of the status line.
      const lx = px + Math.cos(ang) * ((14 - py) / Math.sin(ang));
      if (major && lx > 30 && lx < W - 300) {
        g.globalAlpha = 0.38;
        g.font = serif;
        g.fillStyle = `rgba(${ink},1)`;
        g.textBaseline = "middle";
        const label = roman[((Math.round(ang / (15 * deg)) % 12) + 12) % 12] + "h";
        g.fillText(label, lx - g.measureText(label).width / 2 + 3, 12);
      }
    }
    // The ecliptic, dashed.
    const ecl = (x: number) => H * (0.56 - 0.22 * Math.sin((x / W) * Math.PI * 1.15 - 0.25));
    g.globalAlpha = 0.22;
    g.setLineDash([5, 5]);
    g.lineWidth = 0.9;
    g.beginPath();
    for (let x = 0; x <= W; x += 8) {
      if (x) g.lineTo(x, ecl(x));
      else g.moveTo(x, ecl(x));
    }
    g.stroke();
    g.setLineDash([]);
    if (!this.narrow()) {
      g.globalAlpha = 0.4;
      g.font = serif;
      g.fillStyle = `rgba(${ink},1)`;
      g.fillText("Ecliptica", W * 0.955 - 42, ecl(W * 0.955) - 9);
    }
    // Clear the grid behind the headline.
    g.globalAlpha = 1;
    if (!this.narrow()) {
      g.globalCompositeOperation = "destination-out";
      const cg = g.createRadialGradient(0, H, 0, 0, H, W * 0.7);
      cg.addColorStop(0, "rgba(0,0,0,0.95)");
      cg.addColorStop(0.55, "rgba(0,0,0,0.85)");
      cg.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = cg;
      g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = "source-over";
    }
    // Stars as ink: small dots sized by magnitude and a few engraved crosses.
    // Nothing is drawn as large as a graph star, so nothing reads as clickable.
    const count = Math.round((W * H) / 2600);
    for (let i = 0, made = 0; made < count && i < count * 5; i++) {
      const x = r(), y = r(), mag = r();
      const copy = this.inCopy(x, y);
      if (copy && r() < 0.8) continue;
      made++;
      const X = x * W, Y = y * H;
      if (mag > 0.9 && !copy && !this.onNode(x, y)) {
        const s = 3.6 + r() * 1.6;
        g.globalAlpha = 0.7;
        g.lineWidth = 0.7;
        g.strokeStyle = `rgba(${ink},1)`;
        g.beginPath();
        g.moveTo(X - s, Y);
        g.lineTo(X + s, Y);
        g.moveTo(X, Y - s);
        g.lineTo(X, Y + s);
        g.stroke();
        g.globalAlpha = 1;
        dot(g, X, Y, 1, ink, 0.85);
      } else {
        dot(g, X, Y, 0.45 + 1.15 * Math.pow(mag, 3.2), ink, (0.32 + 0.5 * mag) * (copy ? 0.5 : 1));
      }
    }
    g.globalAlpha = 1;
  }

  private drawSky(t: number, dimAll: boolean) {
    const { ctx, W, H } = this;
    ctx.globalAlpha = dimAll ? 0.6 : 1;
    ctx.drawImage(this.sky, 0, 0, W, H);
    ctx.globalAlpha = 1;
    for (const s of this.twinkle) {
      const f = this.reduce
        ? 1
        : 1 - 0.38 * (0.5 + 0.5 * Math.sin(t * s.s1 + s.p1)) * (0.5 + 0.5 * Math.sin(t * s.s2 + s.p2));
      const a = s.a * f * (dimAll ? 0.6 : 1);
      dot(ctx, s.x * W, s.y * H, s.r, s.rgb, a);
      if (s.halo) dot(ctx, s.x * W, s.y * H, s.r * 0.45, "255,255,255", a * 0.9);
    }
  }

  // ---------- graph ----------

  private pos(n: Star, t: number) {
    const c = this.narrow() ? n.m : n.d;
    const amp = this.reduce ? 0 : 3;
    const ph = this.phase[n.id];
    return {
      x: c[0] * this.W + Math.sin(t * 0.0006 + ph) * amp,
      y: c[1] * this.H + Math.cos(t * 0.0005 + ph * 1.3) * amp,
    };
  }

  private seen(id: string, el: number) {
    return this.reduce ? 1 : Math.max(0, Math.min(1, (el - (this.reveal[id] || 0)) / 380));
  }

  private neighbors(id: string) {
    const s: Record<string, boolean> = { [id]: true };
    docLinks.forEach(([a, b]) => {
      if (a === id) s[b] = true;
      if (b === id) s[a] = true;
    });
    [careerOrder, this.trail].forEach((chain) => {
      const k = chain.indexOf(id);
      if (k < 0) return;
      if (k > 0) s[chain[k - 1]] = true;
      if (k < chain.length - 1) s[chain[k + 1]] = true;
    });
    return s;
  }

  /** Catmull-Rom through a chain, segment by segment so each can light or fade on its own. */
  private chain(ids: string[], P: Record<string, { x: number; y: number }>, color: string, width: number, el: number, lit: Record<string, boolean> | null) {
    const { ctx } = this;
    for (let k = 0; k < ids.length - 1; k++) {
      const p0 = P[ids[Math.max(0, k - 1)]], p1 = P[ids[k]], p2 = P[ids[k + 1]], p3 = P[ids[Math.min(ids.length - 1, k + 2)]];
      const a = Math.min(this.seen(ids[k], el), this.seen(ids[k + 1], el));
      if (!a) continue;
      const on = !!lit && !!lit[ids[k]] && !!lit[ids[k + 1]];
      ctx.globalAlpha = a * (lit ? (on ? 1 : 0.12) : 0.75);
      ctx.strokeStyle = color;
      ctx.lineWidth = on ? width + 1 : width;
      ctx.setLineDash(ids[k] === "travel" || ids[k + 1] === "travel" ? [3, 6] : []);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.bezierCurveTo(
        p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6,
        p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6,
        p2.x, p2.y,
      );
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  /**
   * Desktop only: picks a place for each label so none overlaps another label, another star, a line or the headline.
   * Career names alternate above and below the arc, then try the other side, then a corner beside the star.
   * Docs labels go right, else left. A label with no free place shows on hover only.
   */
  private layoutLabels() {
    const key = `${this.W}x${this.H}`;
    if (this.sidesFor === key) return;
    this.sidesFor = key;
    this.sides = {};
    this.careerLabels = {};
    if (this.narrow()) return;
    const { ctx, W, H, col } = this;
    type Box = { x: number; y: number; w: number; h: number };
    const hits = (a: Box, b: Box) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
    const placed: Box[] = [];
    // The headline block, measured from the page, with a little air above it.
    const copy = this.scope.querySelector<HTMLElement>("[data-hero-copy]");
    if (copy) {
      const cr = copy.getBoundingClientRect(), hr = this.cvs.getBoundingClientRect();
      placed.push({ x: cr.left - hr.left + 30, y: cr.top - hr.top - 6, w: cr.width - 30, h: cr.height });
    }
    const at = (n: Star) => ({ x: n.d[0] * W, y: n.d[1] * H });
    const nodeBoxes = this.stars.map((n) => {
      const p = at(n);
      return { id: n.id, box: { x: p.x - n.r - 3, y: p.y - n.r - 3, w: 2 * n.r + 6, h: 2 * n.r + 6 } };
    });
    // Points along every drawn line (the career arc, the devlog trail and the docs links), so no label sits on a line.
    const P: Record<string, { x: number; y: number }> = {};
    this.stars.forEach((n) => (P[n.id] = at(n)));
    const linePts: { x: number; y: number; a: string; b: string }[] = [];
    const sampleChain = (ids: string[]) => {
      for (let k = 0; k < ids.length - 1; k++) {
        const p0 = P[ids[Math.max(0, k - 1)]], p1 = P[ids[k]], p2 = P[ids[k + 1]], p3 = P[ids[Math.min(ids.length - 1, k + 2)]];
        const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
        const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
        for (let i = 1; i < 24; i++) {
          const t = i / 24, u = 1 - t;
          linePts.push({
            a: ids[k],
            b: ids[k + 1],
            x: u * u * u * p1.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p2.x,
            y: u * u * u * p1.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p2.y,
          });
        }
      }
    };
    sampleChain(careerOrder);
    sampleChain(this.trail);
    docLinks.forEach(([from, to]) => {
      const a = P[from], b = P[to];
      const c = { x: (a.x + b.x) / 2 + (b.y - a.y) * 0.12, y: (a.y + b.y) / 2 - (b.x - a.x) * 0.12 };
      for (let i = 1; i < 24; i++) {
        const t = i / 24, u = 1 - t;
        linePts.push({ a: from, b: to, x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y });
      }
    });
    // A label may cross its own star's lines close to the star, where they read as part of it.
    const onLine = (b: Box, own?: string) =>
      linePts.some(
        (q) =>
          q.x > b.x - 2 &&
          q.x < b.x + b.w + 2 &&
          q.y > b.y - 1 &&
          q.y < b.y + b.h + 1 &&
          !(own && (q.a === own || q.b === own) && Math.hypot(q.x - P[own].x, q.y - P[own].y) < 40),
      );
    const width = (text: string, font: string) => {
      ctx.font = font;
      return ctx.measureText(text).width;
    };
    // A label may touch its own star's halo, never another star or label.
    const free = (b: Box, own?: string) =>
      b.x >= 4 &&
      b.x + b.w <= W - 4 &&
      !placed.some((o) => hits(b, o)) &&
      !nodeBoxes.some((o) => o.id !== own && hits(b, o.box)) &&
      !onLine(b, own);
    const mono = col.mono;
    const careers = this.stars.filter((n) => n.kind === "career" || n.kind === "now" || n.kind === "break");
    // aampersand first, since it is the one label that must always show.
    careers.sort((a, b) => (a.kind === "now" ? -1 : b.kind === "now" ? 1 : 0));
    careers.forEach((n) => {
      const p = at(n);
      const w = Math.max(width(n.label, `700 12px ${mono}`), width(n.short, `500 10.5px ${mono}`)) + 10;
      const gap = n.r + (n.kind === "now" ? 16 : 10);
      const below = p.y + gap - 7, above = p.y - gap - 21;
      const pref = careerOrder.indexOf(n.id) % 2 === 0 ? below : above;
      const other = pref === below ? above : below;
      // Its usual side first, then the other side, then tucked into a corner beside the star.
      // With no free place it shows on hover only.
      const tries: CareerLabel[] = [pref, other].map((y) => ({ x: p.x - w / 2, y, w, align: "center", vFirst: y === below }));
      const up = p.y - n.r - 30, down = p.y + n.r + 2;
      tries.push(
        { x: p.x + n.r + 2, y: up, w, align: "right", vFirst: false },
        { x: p.x - n.r - 2 - w, y: up, w, align: "left", vFirst: false },
        { x: p.x + n.r + 2, y: down, w, align: "right", vFirst: true },
        { x: p.x - n.r - 2 - w, y: down, w, align: "left", vFirst: true },
      );
      const pick = tries.find((b) => free({ x: b.x, y: b.y, w: b.w, h: 28 }, n.id)) ?? (n.kind === "now" ? tries[0] : null);
      this.careerLabels[n.id] = pick;
      if (pick) placed.push({ x: pick.x, y: pick.y, w: pick.w, h: 28 });
    });
    this.stars
      .filter((n) => n.kind === "docs")
      .forEach((n) => {
        const p = at(n);
        const w = width(n.label, `600 11px ${mono}`) + 6;
        const right = { x: p.x + n.r + 8, y: p.y - 8, w, h: 16 };
        const left = { x: p.x - n.r - 8 - w, y: p.y - 8, w, h: 16 };
        const side = free(right, n.id) ? "right" : free(left, n.id) ? "left" : "hide";
        this.sides[n.id] = side;
        if (side !== "hide") placed.push(side === "right" ? right : left);
      });
  }

  private label(text: string, x: number, y: number, align: "center" | "left" | "right", font: string, color: string) {
    const { ctx } = this;
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";
    const w = ctx.measureText(text).width;
    if (align === "center") x -= w / 2;
    else if (align === "left") x -= w; // "left" of the anchor: text ends at x
    x = Math.max(6, Math.min(this.W - w - 6, x));
    ctx.fillText(text, x, y);
  }

  private draw(t: number) {
    const { ctx, W, H, col } = this;
    const el = this.reduce ? 1e9 : t - this.t0;
    ctx.clearRect(0, 0, W, H);
    const P: Record<string, { x: number; y: number }> = {};
    this.stars.forEach((n) => (P[n.id] = this.pos(n, t)));
    const lit = this.hover ? this.neighbors(this.hover.id) : null;
    const mono = col.mono;
    const small = this.narrow();
    this.layoutLabels();

    this.drawSky(t, !!lit);
    this.chain(careerOrder, P, col.career, 2, el, lit);
    this.chain(this.trail, P, col.devlog, 1.5, el, lit);
    docLinks.forEach(([from, to]) => {
      const a = P[from], b = P[to];
      const al = Math.min(this.seen(from, el), this.seen(to, el));
      if (!al) return;
      const on = !!lit && lit[from] && lit[to] && (from === this.hover!.id || to === this.hover!.id);
      ctx.globalAlpha = al * (lit ? (on ? 0.95 : 0.1) : 0.5);
      ctx.strokeStyle = col.docs;
      ctx.lineWidth = on ? 2 : 1.1;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo((a.x + b.x) / 2 + (b.y - a.y) * 0.12, (a.y + b.y) / 2 - (b.x - a.x) * 0.12, b.x, b.y);
      ctx.stroke();
    });

    this.stars.forEach((n) => {
      const p = P[n.id], c = this.kindColor(n), a = this.seen(n.id, el);
      if (!a) return;
      const dim = !!lit && !lit[n.id];
      ctx.globalAlpha = a * (dim ? 0.28 : 1);
      if (n.kind === "now" || n.kind === "latest") {
        const pulse = this.reduce ? 0.5 : (Math.sin(t * 0.003 + n.r) + 1) / 2;
        ctx.fillStyle = c;
        ctx.globalAlpha = a * (dim ? 0.06 : 0.1 + pulse * 0.12);
        ctx.beginPath();
        ctx.arc(p.x, p.y, n.r * (2.4 + pulse * 0.8), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = a * (dim ? 0.28 : 1);
      }
      const hot = this.hover === n;
      ctx.beginPath();
      ctx.arc(p.x, p.y, n.r + (hot ? 2 : 0), 0, Math.PI * 2);
      ctx.fillStyle = n.kind === "now" ? c : col.node;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = c;
      ctx.stroke();

      const strong = hot || n.kind === "now";
      const nameFont = `${strong ? 700 : 500} 12px ${mono}`;
      const verFont = `500 10.5px ${mono}`;
      const nameColor = strong ? col.head : col.fg;
      if (n.kind === "career" || n.kind === "now" || n.kind === "break") {
        const idx = careerOrder.indexOf(n.id);
        if (small) {
          // Phones: first and last always, the rest when tapped. Labels point into the dome.
          if (!hot && n.id !== "origins" && n.id !== "aamp") return;
          const inward = n.id === "aamp" || idx > 5 ? -1 : 1;
          const x = p.x + inward * (n.r + 10);
          const align = inward < 0 ? "left" : "right";
          this.label(n.short, x, p.y - 8, align, verFont, col.muted);
          this.label(n.label, x, p.y + 7, align, nameFont, nameColor);
          return;
        }
        // Desktop: the place chosen in layoutLabels. A label with no free place shows on hover only.
        const gap = n.r + (n.kind === "now" ? 16 : 10);
        const fallback: CareerLabel =
          idx % 2 === 0
            ? { x: p.x, y: p.y + gap - 7, w: 0, align: "center", vFirst: true }
            : { x: p.x, y: p.y - gap - 21, w: 0, align: "center", vFirst: false };
        const placedLabel = this.careerLabels[n.id];
        if (placedLabel === null && !hot) return;
        const b = placedLabel ?? fallback;
        // Follow the star's small drift so the label stays attached to it.
        const dx = p.x - n.d[0] * W, dy = p.y - n.d[1] * H;
        const ax = (b.w ? (b.align === "center" ? b.x + b.w / 2 : b.align === "left" ? b.x + b.w : b.x) : b.x) + (b.w ? dx : 0);
        const top = b.y + (b.w ? dy : 0);
        const [first, second] = b.vFirst ? [[n.short, verFont, col.muted], [n.label, nameFont, nameColor]] : [[n.label, nameFont, nameColor], [n.short, verFont, col.muted]];
        this.label(first[0], ax, top + 7, b.align, first[1], first[2]);
        this.label(second[0], ax, top + 21, b.align, second[1], second[2]);
      } else if (n.kind === "devlog" || n.kind === "latest") {
        // The latest devlog's label points away from the trail: left of it on phones, and near the edge on desktop.
        const left = n.kind === "latest" && (small || p.x > W * 0.8);
        const emph = n.kind === "latest" || hot;
        this.label(
          hot ? `${n.short}  ${n.label}` : n.short,
          left ? p.x - n.r - 8 : p.x + n.r + 8,
          p.y,
          left ? "left" : "right",
          `${emph ? 600 : 400} 10.5px ${mono}`,
          emph ? col.head : col.muted,
        );
      } else if (hot || (!small && this.sides[n.id] !== "hide")) {
        const onLeft = !small && this.sides[n.id] === "left";
        this.label(
          n.label,
          onLeft ? p.x - n.r - 8 : p.x + n.r + 8,
          p.y,
          onLeft ? "left" : "right",
          `${hot ? 600 : 400} 11px ${mono}`,
          hot ? col.head : col.muted,
        );
      }
    });
    ctx.globalAlpha = 1;
    if (this.hover) this.placeTip(P[this.hover.id]);
  }

  private hit(x: number, y: number): Star | null {
    let best: Star | null = null;
    let bd = this.narrow() ? 26 * 26 : 20 * 20;
    const t = this.reduce ? 0 : performance.now();
    for (const n of this.stars) {
      const p = this.pos(n, t);
      const d = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (d < bd) {
        bd = d;
        best = n;
      }
    }
    return best;
  }

  private setHover(h: Star | null) {
    if (h === this.hover) return;
    this.hover = h;
    this.cvs.style.cursor = h ? "pointer" : "default";
    if (!h) this.tip.hidden = true;
    if (this.reduce) this.draw(0);
  }

  private placeTip(p: { x: number; y: number }) {
    const h = this.hover!;
    const tip = this.tip;
    tip.hidden = false;
    tip.innerHTML =
      `<span data-part="meta">${esc(h.meta)}</span><b>${esc(h.label)}</b>${esc(h.text)}` +
      (this.touchy ? `<span data-part="tap">Tap again to open</span>` : "");
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    let x = p.x + 16, y = p.y - th - 12;
    if (x + tw > this.W - 8) x = p.x - tw - 16;
    if (y < 8) y = p.y + 16;
    tip.style.left = `${Math.max(8, x)}px`;
    tip.style.top = `${y}px`;
  }
}
