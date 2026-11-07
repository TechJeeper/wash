import Poco from "commodetto/Poco";
import Message from "pebble/message";
import Battery from "embedded:sensor/Battery";
import Health from "pebble/health";

const render = new Poco(screen);
const IS_ROUND = render.width === render.height;
const LOW_BATTERY_PCT = 15;

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* ── Settings ─────────────────────────────────────────────────────────────── */

const DEFAULT_SETTINGS = {
  palette: "harbor",
  customBg: { r: 15, g: 42, b: 50 },
  customWashA: { r: 31, g: 111, b: 122 },
  customWashB: { r: 126, g: 184, b: 162 },
  customWashC: { r: 61, g: 142, b: 160 },
  customFg: { r: 242, g: 247, b: 245 },
  composition: "cascade",
  fieldCount: 3,
  softness: "soft",
  fontScale: "display",
  timePlace: "center",
  caption: "date",
  use24Hour: true,
  leadingZero: true,
  hourlyReflow: true
};

function loadSettings() {
  const out = {};
  const keys = Object.keys(DEFAULT_SETTINGS);
  for (let i = 0; i < keys.length; i++) out[keys[i]] = DEFAULT_SETTINGS[keys[i]];
  const stored = localStorage.getItem("settings");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const pk = Object.keys(parsed);
      for (let i = 0; i < pk.length; i++) out[pk[i]] = parsed[pk[i]];
    } catch (e) {
      console.log("settings parse fail");
    }
  }
  return out;
}

function saveSettings() {
  localStorage.setItem("settings", JSON.stringify(settings));
}

let settings = loadSettings();

/* ── Palettes ─────────────────────────────────────────────────────────────── */

const PALETTES = {
  harbor: {
    bg: { r: 15, g: 42, b: 50 },
    washes: [
      { r: 31, g: 111, b: 122 },
      { r: 126, g: 184, b: 162 },
      { r: 61, g: 142, b: 160 },
      { r: 24, g: 84, b: 96 }
    ],
    fg: { r: 242, g: 247, b: 245 },
    dim: { r: 170, g: 190, b: 186 }
  },
  blush: {
    bg: { r: 243, g: 221, b: 212 },
    washes: [
      { r: 232, g: 160, b: 144 },
      { r: 240, g: 196, b: 168 },
      { r: 217, g: 139, b: 122 },
      { r: 250, g: 210, b: 198 }
    ],
    fg: { r: 42, g: 33, b: 31 },
    dim: { r: 120, g: 90, b: 84 }
  },
  night: {
    bg: { r: 12, g: 11, b: 18 },
    washes: [
      { r: 42, g: 31, b: 85 },
      { r: 107, g: 45, b: 110 },
      { r: 61, g: 26, b: 74 },
      { r: 28, g: 36, b: 72 }
    ],
    fg: { r: 217, g: 198, b: 239 },
    dim: { r: 140, g: 120, b: 170 }
  },
  paper: {
    bg: { r: 244, g: 239, b: 230 },
    washes: [
      { r: 217, g: 210, b: 196 },
      { r: 235, g: 228, b: 214 },
      { r: 207, g: 198, b: 182 },
      { r: 224, g: 216, b: 200 }
    ],
    fg: { r: 22, g: 21, b: 19 },
    dim: { r: 120, g: 114, b: 104 }
  },
  ochre: {
    bg: { r: 42, g: 36, b: 24 },
    washes: [
      { r: 196, g: 154, b: 60 },
      { r: 168, g: 90, b: 58 },
      { r: 74, g: 90, b: 50 },
      { r: 140, g: 110, b: 48 }
    ],
    fg: { r: 245, g: 240, b: 230 },
    dim: { r: 180, g: 160, b: 120 }
  },
  fog: {
    bg: { r: 197, g: 204, b: 212 },
    washes: [
      { r: 154, g: 168, b: 192 },
      { r: 183, g: 208, b: 200 },
      { r: 142, g: 154, b: 171 },
      { r: 170, g: 180, b: 196 }
    ],
    fg: { r: 30, g: 36, b: 44 },
    dim: { r: 80, g: 90, b: 104 }
  },
  acid: {
    bg: { r: 18, g: 22, b: 12 },
    washes: [
      { r: 180, g: 220, b: 40 },
      { r: 90, g: 160, b: 70 },
      { r: 40, g: 90, b: 50 },
      { r: 210, g: 180, b: 40 }
    ],
    fg: { r: 240, g: 255, b: 220 },
    dim: { r: 140, g: 170, b: 100 }
  },
  ink: {
    bg: { r: 0, g: 0, b: 0 },
    washes: [
      { r: 40, g: 40, b: 44 },
      { r: 70, g: 70, b: 78 },
      { r: 28, g: 28, b: 32 },
      { r: 90, g: 88, b: 96 }
    ],
    fg: { r: 245, g: 245, b: 240 },
    dim: { r: 120, g: 120, b: 118 }
  }
};

let bg, fg, dim;
let washColors = [];

function rgb(c) {
  return render.makeColor(c.r, c.g, c.b);
}

function mix(a, b, t) {
  return {
    r: (a.r + ((b.r - a.r) * t) | 0) & 0xFF,
    g: (a.g + ((b.g - a.g) * t) | 0) & 0xFF,
    b: (a.b + ((b.b - a.b) * t) | 0) & 0xFF
  };
}

function updateColors() {
  let p;
  if (settings.palette === "custom") {
    p = {
      bg: settings.customBg,
      washes: [settings.customWashA, settings.customWashB, settings.customWashC, settings.customWashA],
      fg: settings.customFg,
      dim: mix(settings.customFg, settings.customBg, 0.45)
    };
  } else {
    p = PALETTES[settings.palette] || PALETTES.harbor;
  }
  bg = rgb(p.bg);
  fg = rgb(p.fg);
  dim = rgb(p.dim);
  washColors = [];
  for (let i = 0; i < p.washes.length; i++) washColors.push(rgb(p.washes[i]));
  paletteBg = p.bg;
}

let paletteBg = PALETTES.harbor.bg;

function pickTimeFont() {
  if (settings.fontScale === "condensed")
    return new render.Font("Bitham-Bold", 42);
  if (settings.fontScale === "bold")
    return new render.Font("Bitham-Black", 30);
  return new render.Font("Roboto-Bold", 49);
}

let timeFont = pickTimeFont();
const smallFont = new render.Font("Gothic-Regular", 14);

updateColors();

/* ── Runtime ──────────────────────────────────────────────────────────────── */

let lastDate = new Date();
let batteryPercent = 100;
let stepCount = 0;
let appReady = false;
let lowPower = false;

const battery = new Battery({
  onSample() {
    batteryPercent = this.sample().percent;
    lowPower = batteryPercent <= LOW_BATTERY_PCT;
    if (appReady) drawScreen();
  }
});
batteryPercent = battery.sample().percent;
lowPower = batteryPercent <= LOW_BATTERY_PCT;

function readSteps() {
  try {
    const now = Date.now();
    if (Health.metric.accessible) {
      const access = Health.metric.accessible({
        metric: "step count",
        start: now,
        end: now
      });
      const ok = Health.access ? (access & Health.access.available) : access;
      if (!ok) return;
    }
    stepCount = Health.metric.get("step count") | 0;
  } catch (e) {
    /* health unavailable */
  }
}

readSteps();

/* ── Drawing helpers ──────────────────────────────────────────────────────── */

/* Pebble Poco: drawRoundRect(x, y, w, h, color, radius[, corners]) — no fillEllipse. */
function fillRoundRect(color, x, y, w, h, r) {
  if (w <= 0 || h <= 0) return;
  if (r <= 0) {
    render.fillRectangle(color, x, y, w, h);
    return;
  }
  const rad = Math.min(r, (w / 2) | 0, (h / 2) | 0, 30);
  render.drawRoundRect(x, y, w, h, color, rad);
}

function fillSoftRoundRect(color, halo, x, y, w, h, r) {
  if (settings.softness === "soft") {
    const pad = 6;
    fillRoundRect(halo, x - pad, y - pad, w + pad * 2, h + pad * 2, r + 4);
  }
  fillRoundRect(color, x, y, w, h, r);
}

function hashHour(now) {
  const day = now.getFullYear() * 372 + now.getMonth() * 31 + now.getDate();
  const hour = settings.hourlyReflow ? now.getHours() : 0;
  return (day * 17 + hour * 31) & 0x7fffffff;
}

function resolveComposition(now) {
  if (settings.composition !== "auto") return settings.composition;
  const modes = ["cascade", "bloom", "edge", "editorial"];
  return modes[hashHour(now) % modes.length];
}

function buildFields(now) {
  const w = render.width;
  const h = render.height;
  const count = Math.max(2, Math.min(4, settings.fieldCount | 0));
  const seed = hashHour(now);
  const nudge = (seed % 17) - 8;
  const mode = resolveComposition(now);
  const fields = [];
  const r = IS_ROUND ? 36 : 18;

  if (mode === "bloom") {
    fields.push({ x: 18 + (nudge >> 1), y: 22, w: w - 36, h: ((h * 0.48) | 0), r });
    fields.push({ x: 40 - (nudge >> 1), y: ((h * 0.34) | 0), w: w - 70, h: ((h * 0.42) | 0), r });
    if (count >= 3)
      fields.push({ x: -12, y: h - ((h * 0.42) | 0), w: ((w * 0.72) | 0), h: ((h * 0.4) | 0), r });
    if (count >= 4)
      fields.push({ x: w - ((w * 0.55) | 0), y: h - ((h * 0.36) | 0), w: ((w * 0.62) | 0), h: ((h * 0.34) | 0), r });
  } else if (mode === "edge") {
    fields.push({ x: -40 + nudge, y: -20, w: ((w * 0.78) | 0), h: ((h * 0.62) | 0), r: r + 8 });
    fields.push({ x: w - ((w * 0.58) | 0) - nudge, y: ((h * 0.18) | 0), w: ((w * 0.7) | 0), h: ((h * 0.58) | 0), r: r + 8 });
    if (count >= 3)
      fields.push({ x: 16, y: h - ((h * 0.48) | 0), w: w - 20, h: ((h * 0.52) | 0), r });
    if (count >= 4)
      fields.push({ x: -20, y: ((h * 0.4) | 0), w: ((w * 0.5) | 0), h: ((h * 0.4) | 0), r });
  } else if (mode === "editorial") {
    fields.push({ x: w - ((w * 0.62) | 0) + nudge, y: -12, w: ((w * 0.7) | 0), h: ((h * 0.5) | 0), r });
    fields.push({ x: -20 - nudge, y: ((h * 0.3) | 0), w: ((w * 0.62) | 0), h: ((h * 0.48) | 0), r });
    if (count >= 3)
      fields.push({ x: w - ((w * 0.78) | 0), y: h - ((h * 0.4) | 0), w: ((w * 0.82) | 0), h: ((h * 0.42) | 0), r });
    if (count >= 4)
      fields.push({ x: 8, y: 8, w: ((w * 0.4) | 0), h: ((h * 0.28) | 0), r });
  } else {
    /* cascade */
    fields.push({ x: -18 + nudge, y: -12, w: ((w * 0.78) | 0), h: ((h * 0.58) | 0), r });
    fields.push({ x: w - ((w * 0.7) | 0) - nudge, y: ((h * 0.22) | 0), w: ((w * 0.78) | 0), h: ((h * 0.55) | 0), r });
    if (count >= 3)
      fields.push({ x: 8, y: h - ((h * 0.46) | 0), w: ((w * 0.9) | 0), h: ((h * 0.48) | 0), r });
    if (count >= 4)
      fields.push({ x: ((w * 0.2) | 0), y: ((h * 0.12) | 0), w: ((w * 0.55) | 0), h: ((h * 0.35) | 0), r });
  }

  return fields.slice(0, count);
}

function formatTime(now) {
  let h = now.getHours();
  const m = now.getMinutes();
  if (!settings.use24Hour) {
    h = h % 12;
    if (h === 0) h = 12;
  }
  const hs = settings.leadingZero ? (h < 10 ? "0" + h : String(h)) : String(h);
  const ms = m < 10 ? "0" + m : String(m);
  return hs + ":" + ms;
}

function formatCaption(now) {
  switch (settings.caption) {
    case "date":
      return DAYS[now.getDay()].toUpperCase().slice(0, 3) + " " + now.getDate();
    case "weekday":
      return DAYS[now.getDay()].toUpperCase();
    case "battery":
      return "BATTERY " + batteryPercent + "%";
    case "steps": {
      const s = stepCount;
      if (s >= 1000) {
        const k = (s / 1000);
        const tenths = ((s % 1000) / 100) | 0;
        return "STEPS " + (k | 0) + "." + tenths + "K";
      }
      return "STEPS " + s;
    }
    default:
      return "";
  }
}

function washRgbAt(i) {
  if (settings.palette === "custom") {
    const custom = [settings.customWashA, settings.customWashB, settings.customWashC, settings.customWashA];
    return custom[i % 4];
  }
  return (PALETTES[settings.palette] || PALETTES.harbor).washes[i % 4];
}

function drawWashes(now) {
  const fields = buildFields(now);
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i];
    const solid = washColors[i % washColors.length];
    const haloRgb = rgb(mix(paletteBg, washRgbAt(i), 0.4));
    fillSoftRoundRect(solid, haloRgb, f.x, f.y, f.w, f.h, f.r);
  }
}

function drawTimeBlock(now) {
  const text = formatTime(now);
  const caption = lowPower ? (batteryPercent + "%") : formatCaption(now);
  const tw = render.getTextWidth(text, timeFont);
  const th = timeFont.height;
  const cw = caption ? render.getTextWidth(caption, smallFont) : 0;
  const gap = 6;
  const blockH = th + (caption ? gap + smallFont.height : 0);

  let x;
  let y;
  const place = lowPower ? "center" : settings.timePlace;
  const pad = IS_ROUND ? 36 : 14;

  if (place === "editorial") {
    x = pad;
    y = render.height - pad - blockH - (IS_ROUND ? 10 : 4);
  } else if (place === "banner") {
    x = ((render.width - tw) / 2) | 0;
    y = pad + (IS_ROUND ? 18 : 8);
  } else {
    x = ((render.width - tw) / 2) | 0;
    y = ((render.height - blockH) / 2) | 0;
  }

  render.drawText(text, timeFont, fg, x, y);
  if (caption) {
    const cx = place === "editorial" ? x : (((render.width - cw) / 2) | 0);
    render.drawText(caption, smallFont, dim, cx, y + th + gap);
  }
}

function drawScreen(event) {
  const now = event?.date ?? lastDate;
  if (event?.date) lastDate = event.date;

  render.begin();
  render.fillRectangle(bg, 0, 0, render.width, render.height);
  if (!lowPower) drawWashes(now);
  drawTimeBlock(now);
  render.end();
}

/* ── Clay / AppMessage ────────────────────────────────────────────────────── */

function colorFromInt(v) {
  return {
    r: (v >> 16) & 0xFF,
    g: (v >> 8) & 0xFF,
    b: v & 0xFF
  };
}

function asBool(v, fallback) {
  if (v === undefined) return fallback;
  if (v === true || v === 1 || v === "1" || v === "true") return true;
  if (v === false || v === 0 || v === "0" || v === "false") return false;
  return fallback;
}

function asNumber(v, fallback) {
  if (v === undefined || v === null || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function asString(v, fallback) {
  if (v === undefined || v === null) return fallback;
  return String(v);
}

const MESSAGE_KEYS = [
  "Palette", "CustomBg", "CustomWashA", "CustomWashB", "CustomWashC", "CustomFg",
  "Composition", "FieldCount", "Softness", "FontScale", "TimePlace", "Caption",
  "Use24Hour", "LeadingZero", "HourlyReflow"
];

const message = new Message({
  input: 384,
  output: 128,
  keys: MESSAGE_KEYS,
  onReadable() {
    try {
      const msg = this.read();
      const get = (key) => {
        let v;
        if (msg && typeof msg.get === "function") v = msg.get(key);
        else if (msg && (key in msg)) v = msg[key];
        if (v && typeof v === "object" && ("value" in v)) v = v.value;
        return v;
      };

      const palette = get("Palette");
      if (palette !== undefined) settings.palette = asString(palette, settings.palette);

      const cbg = get("CustomBg");
      if (cbg !== undefined) settings.customBg = colorFromInt(cbg);
      const ca = get("CustomWashA");
      if (ca !== undefined) settings.customWashA = colorFromInt(ca);
      const cb = get("CustomWashB");
      if (cb !== undefined) settings.customWashB = colorFromInt(cb);
      const cc = get("CustomWashC");
      if (cc !== undefined) settings.customWashC = colorFromInt(cc);
      const cfg = get("CustomFg");
      if (cfg !== undefined) settings.customFg = colorFromInt(cfg);

      const comp = get("Composition");
      if (comp !== undefined) settings.composition = asString(comp, settings.composition);
      const fc = get("FieldCount");
      if (fc !== undefined) settings.fieldCount = asNumber(fc, settings.fieldCount);
      const soft = get("Softness");
      if (soft !== undefined) settings.softness = asString(soft, settings.softness);
      const fs = get("FontScale");
      if (fs !== undefined) settings.fontScale = asString(fs, settings.fontScale);
      const tp = get("TimePlace");
      if (tp !== undefined) settings.timePlace = asString(tp, settings.timePlace);
      const cap = get("Caption");
      if (cap !== undefined) settings.caption = asString(cap, settings.caption);

      settings.use24Hour = asBool(get("Use24Hour"), settings.use24Hour);
      settings.leadingZero = asBool(get("LeadingZero"), settings.leadingZero);
      settings.hourlyReflow = asBool(get("HourlyReflow"), settings.hourlyReflow);

      timeFont = pickTimeFont();
      saveSettings();
      updateColors();
      drawScreen();
    } catch (e) {
      console.log("settings error: " + e);
    }
  }
});

/* ── Tick ─────────────────────────────────────────────────────────────────── */

watch.addEventListener("minutechange", (e) => {
  lastDate = e.date;
  if (e.date.getMinutes() === 0) readSteps();
  else if ((e.date.getMinutes() % 15) === 0) readSteps();
  drawScreen({ date: e.date });
});

/* Timeline peek / obstruction */
if (typeof watch.addEventListener === "function") {
  try {
    watch.addEventListener("unobstructedarea", () => drawScreen());
  } catch (e) {}
}

appReady = true;
drawScreen();
