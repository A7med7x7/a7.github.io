#!/usr/bin/env node
// Generates Open Graph PNG images for every post.
// Writes to static/og/<slug>.png + static/og/_site.png (site fallback).
// Fonts: EB Garamond (Latin titles) + Amiri (Arabic titles).
// Detection: a single Arabic-Unicode regex on the title string.

import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { GlobalFonts, createCanvas } from '@napi-rs/canvas';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const POSTS_DIR = join(ROOT, 'content', 'posts');
const OG_DIR    = join(ROOT, 'static', 'og');
const FONTS_DIR = join(__dirname, '.fonts');

// Static TTF sources only — Satori's font parser cannot read variable fonts.
//   Serif (Latin): Crimson Text — open-source EB Garamond sibling.
//   Arabic: Amiri — classical Naskh. Rendered via @napi-rs/canvas (Skia +
//     internal HarfBuzz) which performs real Arabic shaping; Satori's
//     opentype.js can't apply Arabic contextual joining regardless of font.
const FONT_URLS = {
  serif:  'https://raw.githubusercontent.com/google/fonts/main/ofl/crimsontext/CrimsonText-SemiBold.ttf',
  arabic: 'https://raw.githubusercontent.com/google/fonts/main/ofl/amiri/Amiri-Regular.ttf',
};

for (const dir of [OG_DIR, FONTS_DIR]) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

async function loadFont(name, url) {
  const path = join(FONTS_DIR, `${name}.ttf`);
  if (!existsSync(path)) {
    process.stdout.write(`  fetching ${name}.ttf ... `);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${name} from ${url}: ${res.status}`);
    writeFileSync(path, Buffer.from(await res.arrayBuffer()));
    console.log('ok');
  }
  return readFileSync(path);
}

const [serifFont, arabicFont] = await Promise.all([
  loadFont('CrimsonText', FONT_URLS.serif),
  loadFont('Amiri',       FONT_URLS.arabic),
]);

// Register fonts with the canvas-skia global font registry — used by the
// Arabic render path. Satori uses the raw Buffers directly, not this registry.
GlobalFonts.register(arabicFont, 'Amiri');
GlobalFonts.register(serifFont,  'Crimson Text');

// Minimal TOML frontmatter parser — only need title + date.
function parseFrontmatter(content) {
  const m = content.match(/^\+\+\+\s*\n([\s\S]*?)\n\+\+\+/);
  if (!m) return null;
  const body = m[1];
  const grab = (key) => {
    const r = new RegExp(`^\\s*${key}\\s*=\\s*['"]([^'"\\n]+)['"]`, 'm');
    const mm = body.match(r);
    return mm?.[1]?.trim();
  };
  return { title: grab('title'), date: grab('date') };
}

const ARABIC_RE = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;
const hasArabic = (s) => ARABIC_RE.test(s);

function formatDate(s) {
  if (!s) return '';
  const d = new Date(s);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Ring (concentric circle) decoration.
function ring({ top, left, bottom, right, size }) {
  const pos = {};
  if (top    !== undefined) pos.top    = top;
  if (left   !== undefined) pos.left   = left;
  if (bottom !== undefined) pos.bottom = bottom;
  if (right  !== undefined) pos.right  = right;
  return {
    type: 'div',
    props: {
      style: {
        position: 'absolute',
        ...pos,
        width: size,
        height: size,
        borderRadius: size / 2,
        border: '1px solid #c4b8a8',
        display: 'flex',
      },
    },
  };
}

function ogTemplate({ title, date, isArabic }) {
  const titleFont = 'Crimson Text';
  const direction = 'ltr';

  return {
    type: 'div',
    props: {
      style: {
        width: 1200,
        height: 630,
        background: '#f9f7f4',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '60px 100px',
      },
      children: [
        // Top-left concentric rings
        ring({ top: 70, left: 70, size: 80 }),
        ring({ top: 100, left: 100, size: 20 }),
        // Bottom-right concentric rings
        ring({ bottom: 70, right: 70, size: 80 }),
        ring({ bottom: 100, right: 100, size: 20 }),
        // Title
        {
          type: 'div',
          props: {
            style: {
              fontSize: isArabic ? 80 : 64,
              color: '#1a1916',
              textAlign: 'center',
              lineHeight: 1.25,
              fontWeight: isArabic ? 400 : 500,
              fontFamily: titleFont,
              direction,
              display: 'flex',
              maxWidth: 940,
              justifyContent: 'center',
              alignItems: 'center',
            },
            children: title,
          },
        },
        // Date
        {
          type: 'div',
          props: {
            style: {
              fontSize: 26,
              color: '#6b6560',
              marginTop: 36,
              fontFamily: 'Crimson Text',
              display: 'flex',
              letterSpacing: '0.02em',
            },
            children: date,
          },
        },
        // Site signature
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: 36,
              fontSize: 18,
              color: '#9a9590',
              fontFamily: 'Crimson Text',
              letterSpacing: '0.06em',
              display: 'flex',
            },
            children: 'a7med7x7.github.io',
          },
        },
      ],
    },
  };
}

// Arabic path — canvas-skia renders proper Naskh shaping via HarfBuzz.
function renderArabicViaCanvas({ title, date }) {
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#f9f7f4';
  ctx.fillRect(0, 0, 1200, 630);

  // Concentric rings — same positions as Satori path
  ctx.strokeStyle = '#c4b8a8';
  ctx.lineWidth = 1;
  for (const [cx, cy] of [[110, 110], [1090, 520]]) {
    ctx.beginPath(); ctx.arc(cx, cy, 40, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.stroke();
  }

  // Title (Amiri, RTL, centered)
  ctx.fillStyle = '#1a1916';
  ctx.font = '80px Amiri';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = 'rtl';
  ctx.fillText(title, 600, 315);

  // Date (Crimson Text, LTR, centered below title)
  ctx.direction = 'ltr';
  ctx.fillStyle = '#6b6560';
  ctx.font = '26px "Crimson Text"';
  ctx.fillText(date, 600, 390);

  // Signature
  ctx.fillStyle = '#9a9590';
  ctx.font = '18px "Crimson Text"';
  ctx.fillText('a7med7x7.github.io', 600, 594);

  return canvas.toBuffer('image/png');
}

async function render({ title, date }) {
  const isArabic = hasArabic(title || '');
  if (isArabic) return renderArabicViaCanvas({ title, date });

  // Latin path — Satori handles flex layout + auto-wrap nicely.
  const svg = await satori(ogTemplate({ title, date, isArabic }), {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Crimson Text', data: serifFont, weight: 600, style: 'normal' },
    ],
  });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  return resvg.render().asPng();
}

// Skip regeneration if PNG is newer than the source MD file.
function needsRegen(srcPath, outPath) {
  if (!existsSync(outPath)) return true;
  return statSync(srcPath).mtimeMs > statSync(outPath).mtimeMs;
}

// --- Generate one fallback for non-post pages (homepage, sequences, etc.) ---
const sitePath = join(OG_DIR, '_site.png');
{
  const png = await render({ title: 'Ahmed Alghali', date: 'notes & essays' });
  writeFileSync(sitePath, png);
  console.log(`  _site.png  (${(png.length / 1024).toFixed(0)} KB)`);
}

// --- Generate one per post ---
const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
let generated = 0, skipped = 0, failed = 0;

for (const file of files) {
  const slug    = file.replace(/\.md$/, '');
  const srcPath = join(POSTS_DIR, file);
  const outPath = join(OG_DIR, `${slug}.png`);

  if (!needsRegen(srcPath, outPath)) { skipped++; continue; }

  try {
    const content = readFileSync(srcPath, 'utf8');
    const fm = parseFrontmatter(content);
    if (!fm?.title) { console.warn(`  skip ${slug} (no title)`); continue; }
    const png = await render({ title: fm.title, date: formatDate(fm.date) });
    writeFileSync(outPath, png);
    generated++;
  } catch (err) {
    failed++;
    console.error(`  fail ${slug}: ${err.message}`);
  }
}

console.log(`\nOG images: ${generated} generated, ${skipped} skipped (up-to-date), ${failed} failed`);
