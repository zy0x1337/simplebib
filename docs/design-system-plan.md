# YunoBib — Custom Design System Plan `v2`
> DaisyUI-Entfernung & Aufbau eines eigenständigen visuellen Systems

---

## Art Direction

> **„Die Nachtstunde in einer gut gelebten Bibliothek"**

Warme Dunkelheit, altes Holz, crème Papier. Keine Nostalgie-Dekoration — distilliert, zeitlos, ruhig. Dark-first, weil eine Bibliothek abends am schönsten ist. Light Mode ist kein „aufgehellter Dark Mode" — er hat seinen eigenen Charakter: Buchcafé an einem Sonntagnachmittag, Tageslicht durch Leinen-Vorhänge.

### Warum DaisyUI raus muss

- DaisyUI-Klassen erzwingen ein generisches, wiedererkennbar-template-haftes Aussehen
- Das Theme-System kämpft gegen unsere Custom-Farbtokens statt mit ihnen
- `modal`, `drawer`, `dropdown` bringen komplexes, unkontrollierbares JS/CSS-Verhalten mit
- Das Ziel ist ein Design, das sich nach *YunoBib* anfühlt — nicht nach „eine App, die DaisyUI benutzt"

---

## Phase 1: Typografie

### Font-Paarung

Weg von **Playfair Display + Lora** (zu verbreitet, zu viel „Design-Template"-Energie).

```css
--font-display: 'Zodiak', 'Georgia', serif;
--font-body:    'General Sans', 'Helvetica Neue', sans-serif;
```

- **Zodiak** (Fontshare): Eleganter, leicht antiquierter Serif mit modernem Schnitt. Für Buchtitel in Detailansichten, Serien-Namen, Hauptüberschriften. Nur ab `--text-xl` (24px+). In der Detailansicht als `font-weight: 300` (light) — wirkt wie ein Buchtitel auf dem Buchrücken, dünn und lang.
- **General Sans** (Fontshare): Geometrisch, klar, warm. Keine Sterilität wie Inter. Für alle Body-Texte, Labels, Buttons, Metadaten.

```html
<!-- app/layout.tsx -->
<link href="https://api.fontshare.com/v2/css?f[]=zodiak@300,400,500,700&f[]=zodiak-italic@300,400&f[]=general-sans@300,400,500,600&display=swap" rel="stylesheet">
```

### Fluid Type Scale

```css
--text-xs:   clamp(0.75rem,  0.7rem  + 0.25vw, 0.875rem); /* 12px → 14px */
--text-sm:   clamp(0.875rem, 0.8rem  + 0.35vw, 1rem);     /* 14px → 16px */
--text-base: clamp(1rem,     0.95rem + 0.25vw, 1.125rem);  /* 16px → 18px */
--text-lg:   clamp(1.125rem, 1rem    + 0.75vw, 1.5rem);    /* 18px → 24px */
--text-xl:   clamp(1.5rem,   1.2rem  + 1.25vw, 2.25rem);   /* 24px → 36px */
```

### Tracking, Leading & Zahlen

```css
/* Line-height Tokens */
--leading-tight:  1.1;   /* Überschriften (Zodiak) */
--leading-snug:   1.35;  /* Sub-headings, Karten-Titel */
--leading-normal: 1.65;  /* Body-Text (General Sans) — großzügig für Lesbarkeit */
--leading-relaxed:1.75;  /* Lange Texte, Beschreibungen */

/* Letter-spacing */
--tracking-tight:  -0.01em; /* Zodiak-Headings, groß */
--tracking-normal:  0em;
--tracking-wide:    0.02em;  /* Autoren-Namen, Muted-Labels — gibt Luft */
--tracking-widest:  0.08em;  /* Uppercase Labels, Status-Text */
```

**Kursiv als Design-Element**: Zodiak italic für Buchuntertitel, Serien-Beschreibungen, Zitatfelder. Im Kontext von Büchern sagt Kursiv sofort „literarisch" — ohne ein einziges Icon.

**Tabular Nums**: `font-variant-numeric: tabular-nums` auf allen Sternebewertungen und Bücher-Zählern. Verhindert Layout-Sprung wenn Zahlen wechseln.

**Regeln:**
- Zodiak (`--font-display`) ausschließlich ab `--text-xl` (24px+)
- Alles darunter: General Sans (`--font-body`)
- Maximal 4 Textstile pro Seite

---

## Phase 2: Farbsystem

### Tokens — Dark Mode (Standard)

```css
:root, [data-theme="dark"] {
  /* Hintergründe */
  --color-bg:              #0e0c0b;
  --color-surface:         #161412;
  --color-surface-2:       #1d1a17;
  --color-surface-elevated:#252118;
  --color-surface-accent:  color-mix(in oklch, #c9956a 8%, #161412); /* selektierte Karten */

  /* Grenzen */
  --color-border:          oklch(from #e8e2d8 l c h / 0.10);
  --color-divider:         oklch(from #e8e2d8 l c h / 0.06);

  /* Text */
  --color-text:            #e8e2d8;
  --color-text-muted:      #7a7168;
  --color-text-faint:      #4a4540;
  --color-text-inverse:    #0e0c0b;

  /* Akzent — Amber Terracotta. DER einzige Farbakzent. */
  --color-accent:          #c9956a;
  --color-accent-hover:    #d9a87d;
  --color-accent-active:   #b07d55;
  --color-accent-muted:    oklch(from #c9956a l c h / 0.15);

  /* Sterne — warmes Gold, heller als Amber */
  --color-star:            #e8c87a;

  /* Status */
  --color-reading:         #6a9e8f;
  --color-reading-muted:   oklch(from #6a9e8f l c h / 0.15);
  --color-finished:        #c9956a;
  --color-unread:          #4a4540;

  /* Feedback */
  --color-error:           #c47060;
  --color-success:         #6a9e8f;

  /* Radius */
  --radius-sm:   0.25rem;
  --radius-md:   0.5rem;
  --radius-lg:   0.75rem;
  --radius-xl:   1rem;
  --radius-full: 9999px;

  /* Layout */
  --header-height-mobile:  48px;
  --header-height-desktop: 56px;

  /* Schatten — warm getönt, Licht von Schreibtischlampe (von oben) */
  --shadow-sm:  0 1px 3px oklch(0.08 0.02 60 / 0.4);
  --shadow-md:  0 4px 16px oklch(0.08 0.02 60 / 0.5);
  --shadow-lg:  0 12px 40px oklch(0.08 0.02 60 / 0.6);
  --shadow-book:0 8px 24px oklch(0.05 0.02 60 / 0.6),
                0 2px 6px oklch(0.05 0.02 60 / 0.4);
  --shadow-inset: inset 0 1px 2px oklch(0.08 0.02 60 / 0.2);

  /* Übergänge */
  --transition:      180ms cubic-bezier(0.16, 1, 0.3, 1);
  --transition-slow: 400ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Tokens — Light Mode

```css
[data-theme="light"] {
  --color-bg:              #f5f2ee;
  --color-surface:         #faf8f4;
  --color-surface-2:       #ffffff;
  --color-surface-elevated:#ffffff;
  --color-surface-accent:  color-mix(in oklch, #a3704a 8%, #faf8f4);

  --color-border:          oklch(from #1c1917 l c h / 0.10);
  --color-divider:         oklch(from #1c1917 l c h / 0.06);

  --color-text:            #1e1a16;
  --color-text-muted:      #6b6358;
  --color-text-faint:      #b0a898;
  --color-text-inverse:    #f5f2ee;

  --color-accent:          #a3704a;
  --color-accent-hover:    #8a5c38;
  --color-accent-active:   #6e4828;
  --color-accent-muted:    oklch(from #a3704a l c h / 0.12);

  --color-star:            #c8922a;

  --color-reading:         #3d7a6a;
  --color-reading-muted:   oklch(from #3d7a6a l c h / 0.12);
  --color-finished:        #a3704a;
  --color-unread:          #c0b8ae;

  --color-error:           #8b3a2a;
  --color-success:         #3d7a6a;

  /* Schatten — Tageslicht von oben-links, weicher */
  --shadow-sm:  0 1px 3px oklch(0.15 0.02 60 / 0.12);
  --shadow-md:  2px 4px 12px oklch(0.2 0.02 50 / 0.15);
  --shadow-lg:  4px 8px 28px oklch(0.2 0.02 50 / 0.18);
  --shadow-book:2px 4px 16px oklch(0.2 0.02 50 / 0.18),
                1px 2px 4px oklch(0.2 0.02 50 / 0.12);
  --shadow-inset: inset 0 1px 2px oklch(0.15 0.02 60 / 0.12);
}
```

**Farbphilosophie:** 1 Akzent (Amber/Terracotta), 1 Status-Grün (Reading), 1 Gold (Sterne), Neutral für alles andere. Maximal 2 Nicht-Neutral-Töne pro Viewport gleichzeitig sichtbar.

---

## Phase 3: Atmosphäre & Hintergrund

### Körperhintergrund — kein solides Schwarz

```css
/* Dark Mode */
body {
  background:
    radial-gradient(
      ellipse 80% 60% at 50% 0%,
      oklch(0.14 0.015 60) 0%,
      var(--color-bg) 60%
    );
  min-height: 100dvh;
}

/* Light Mode */
[data-theme="light"] body {
  background:
    radial-gradient(
      ellipse 90% 50% at 50% 0%,
      oklch(0.97 0.008 80) 0%,
      var(--color-bg) 70%
    );
}
```

Dark Mode: Als käme eine Lampe von oben — die Mitte der Seite ist minimal wärmer und heller als die Ränder. Light Mode: Crème-Papier-Wärme im Zentrum, minimal kühler an den Rändern.

### Subtile Paper-Textur (Light Mode only)

Ein SVG-Filter als Pseudo-Overlay — nur auf `--color-surface` Cards, nicht auf dem Body:

```css
/* In globals.css: SVG-Noise-Filter inline definieren */
.paper-texture::before {
  content: '';
  position: absolute; inset: 0;
  border-radius: inherit;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.015'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 1;
}
[data-theme="dark"] .paper-texture::before { display: none; }
```

---

## Phase 4: Tailwind-Konfiguration

```ts
// tailwind.config.ts — nach DaisyUI-Entfernung
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body:    ['var(--font-body)', 'Helvetica Neue', 'sans-serif'],
      },
      colors: {
        bg:             'var(--color-bg)',
        surface:        'var(--color-surface)',
        'surface-2':    'var(--color-surface-2)',
        'surface-accent':'var(--color-surface-accent)',
        border:         'var(--color-border)',
        text:           'var(--color-text)',
        muted:          'var(--color-text-muted)',
        faint:          'var(--color-text-faint)',
        accent:         'var(--color-accent)',
        star:           'var(--color-star)',
        reading:        'var(--color-reading)',
        finished:       'var(--color-finished)',
        unread:         'var(--color-unread)',
        error:          'var(--color-error)',
      },
      animation: {
        'fade-up':    'fadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in':    'fadeIn 0.3s ease-out forwards',
        'modal-in':   'modalIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shimmer':    'shimmer 1.6s ease-in-out infinite',
        'star-burst': 'starBurst 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeUp:    { '0%': { opacity: '0', transform: 'translateY(14px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        modalIn:   { '0%': { opacity: '0', transform: 'perspective(1000px) rotateX(-2deg) translateY(20px) scale(0.98)' }, '100%': { opacity: '1', transform: 'perspective(1000px) rotateX(0deg) translateY(0) scale(1)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        starBurst: { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.3)' }, '100%': { transform: 'scale(1)' } },
      },
    },
  },
  // Kein plugins: [daisyui]
}

export default config
```

`package.json`: `daisyui` aus `devDependencies` entfernen → `pnpm remove daisyui`.

---

## Phase 5: Custom CSS Utilities (`globals.css`)

### Base Reset

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html {
  scroll-behavior: smooth;
  scroll-padding-top: var(--header-height-desktop);
  -webkit-font-smoothing: antialiased;
  hanging-punctuation: first last;
}

body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--color-text);
  min-height: 100dvh;
}

::selection {
  background: var(--color-accent-muted);
  color: var(--color-text);
}

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: var(--radius-sm);
}

/* Custom Scrollbar — Modal-Boxen, Listen */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: var(--radius-full); }
::-webkit-scrollbar-thumb:hover { background: var(--color-text-faint); }
```

### Buttons

```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 500;
  line-height: var(--leading-tight);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: background var(--transition), color var(--transition),
              border-color var(--transition), box-shadow var(--transition);
  white-space: nowrap;
  user-select: none;
}
.btn:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
.btn:active { transform: translateY(1px); }

.btn-primary {
  background: var(--color-accent);
  color: var(--color-text-inverse);
  border-color: var(--color-accent);
}
.btn-primary:hover { background: var(--color-accent-hover); border-color: var(--color-accent-hover); }

.btn-ghost {
  background: transparent;
  color: var(--color-text-muted);
}
.btn-ghost:hover {
  background: oklch(from var(--color-text) l c h / 0.06);
  color: var(--color-text);
}

.btn-outline {
  background: transparent;
  color: var(--color-text);
  border-color: var(--color-border);
}
.btn-outline:hover { background: oklch(from var(--color-text) l c h / 0.06); }

.btn-sm  { padding: 0.3rem 0.75rem; font-size: var(--text-xs); }
.btn-icon { padding: 0.5rem; aspect-ratio: 1; border-radius: var(--radius-md); }
```

### Status-Pills

```css
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.55rem;
  font-size: var(--text-xs);
  font-weight: 500;
  font-family: var(--font-body);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  border-radius: var(--radius-full);
}
.status-pill::before {
  content: '';
  width: 5px; height: 5px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.7;
  flex-shrink: 0;
}
.status-unread   { color: var(--color-unread);  background: oklch(from var(--color-unread) l c h / 0.12); }
.status-reading  { color: var(--color-reading); background: var(--color-reading-muted); }
.status-finished { color: var(--color-accent);  background: var(--color-accent-muted); }
```

### Form-Inputs

```css
.input, .select, .textarea {
  width: 100%;
  padding: 0.6rem 0.85rem;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--color-text);
  transition: border-color var(--transition), box-shadow var(--transition);
  box-shadow: var(--shadow-inset);
}
.input:focus, .select:focus, .textarea:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-muted), var(--shadow-inset);
}
.input::placeholder { color: var(--color-text-faint); }
```

### Modal

```css
.modal-overlay {
  position: fixed; inset: 0; z-index: 50;
  background: oklch(0.08 0.01 60 / 0.72);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex; align-items: flex-end; justify-content: center;
  padding: 0;
}
@media (min-width: 640px) {
  .modal-overlay { align-items: center; padding: 1.5rem; }
}

.modal-box {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  width: 100%;
  max-height: 92dvh;
  overflow-y: auto;
  padding: 1.5rem;
  animation: modalIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  perspective: 1000px;
}
@media (min-width: 640px) {
  .modal-box {
    max-width: 560px;
    border-radius: var(--radius-xl);
    max-height: 85dvh;
    padding: 2rem;
  }
}
```

### Tabs

```css
.tab-list {
  display: flex;
  border-bottom: 1px solid var(--color-divider);
}
.tab-btn {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-style: italic;
  color: var(--color-text-muted);
  padding: 0.75rem 1.25rem;
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  transition: color var(--transition);
  line-height: var(--leading-tight);
}
.tab-count {
  font-family: var(--font-body);
  font-style: normal;
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  font-variant-numeric: tabular-nums;
  margin-left: 0.4rem;
}
.tab-btn:hover { color: var(--color-text); }
.tab-btn[data-active="true"] { color: var(--color-text); }
.tab-btn[data-active="true"]::after {
  content: '';
  position: absolute;
  bottom: -1px; left: 1.25rem; right: 1.25rem;
  height: 2px;
  background: var(--color-accent);
  border-radius: 1px;
}
```

### Skeleton

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-surface-2) 25%,
    oklch(from var(--color-surface-2) calc(l + 0.03) c h) 50%,
    var(--color-surface-2) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.6s ease-in-out infinite;
  border-radius: var(--radius-sm);
}
```

---

## Phase 6: Komponenten

### BookCard

#### Grid-Layout

```css
/* 2 → 3 → 4 → 5 Spalten. Regalfeeling auf Desktop. */
.book-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0 1rem 2rem;
}
@media (min-width: 480px)  { .book-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; } }
@media (min-width: 768px)  { .book-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; } }
@media (min-width: 1280px) { .book-grid { grid-template-columns: repeat(5, 1fr); gap: 20px; } }
```

#### Cover-Hover: Buchöffnungs-Effekt

Kein generisches `scale(1.03)`. Das Buch kippt leicht, als würde man es greifen:

```css
.book-card { cursor: pointer; }

.book-card .cover-wrap {
  transition: transform var(--transition-slow), box-shadow var(--transition-slow);
  transform-style: preserve-3d;
}

.book-card:hover .cover-wrap {
  transform: perspective(800px) rotateY(-4deg) translateY(-4px);
  box-shadow:
    4px 12px 24px oklch(0.08 0.02 60 / 0.5),
    -2px 0 8px oklch(0.08 0.02 60 / 0.2);  /* Buchrücken-Schatten links */
}
```

#### Cover-Vignette (beide Modi)

```css
.cover-wrap { position: relative; overflow: hidden; border-radius: var(--radius-md) var(--radius-md) 0 0; }

.cover-wrap::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, transparent 55%, oklch(0.08 0.01 60 / 0.35) 100%);
  border-radius: inherit;
  pointer-events: none;
}
[data-theme="light"] .cover-wrap::after {
  background: linear-gradient(to bottom, transparent 70%, oklch(0.2 0.01 60 / 0.12) 100%);
}
```

#### Cover-Placeholder: Buchrücken-Paletten

5 vordefinierte Paletten basierend auf `book.id % 5`. Wirkt wie echte Vintage-Buchrücken aus den 70ern — kein Random-RGB:

```ts
const SPINE_PALETTES = [
  { bg: '#2d3a2e', text: '#8faf7a', line: '#4a6b4a' }, // Moosgrün
  { bg: '#3a2820', text: '#c9956a', line: '#6b4030' }, // Terracotta
  { bg: '#1e2a3a', text: '#7a9eb5', line: '#304a60' }, // Schieferblau
  { bg: '#3a3020', text: '#c8a85a', line: '#6b5830' }, // Ocker
  { bg: '#2a1e2e', text: '#a07ab5', line: '#4a3060' }, // Pflaume
] as const
```

#### Reading-Indikator (Listenansicht)

Eine 1px-Linie unten an der Karte wenn `status === 'reading'`. Kein Zahlenwert — nur ein visuelles Zeichen dass das Buch in Bewegung ist:

```css
.book-list-item[data-status="reading"]::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 1px;
  background: var(--color-reading);
  opacity: 0.5;
}
```

#### Card-Tap-Flash

Beim Öffnen des Modals: kurzer `--color-surface-accent`-Hintergrundflash:

```ts
// onClick: kurz surface-accent setzen, dann Modal öffnen
card.style.background = 'var(--color-surface-accent)'
setTimeout(() => { card.style.background = ''; openModal() }, 80)
```

### SeriesCard: Cover-Stack

Das intuitivste visuelle Signal für „das ist eine Serie" — gestapelte Cover:

```css
.series-stack { position: relative; width: 80px; height: 112px; flex-shrink: 0; }
.series-stack .s-cover { position: absolute; top: 0; width: 80px; height: 112px; border-radius: var(--radius-sm); overflow: hidden; }
.series-stack .s-cover-3 { left: 4px; transform: rotate(-4deg); opacity: 0.45; z-index: 1; }
.series-stack .s-cover-2 { left: 2px; transform: rotate(-2deg); opacity: 0.7; z-index: 2; }
.series-stack .s-cover-1 { left: 0; transform: rotate(0deg); z-index: 3; box-shadow: var(--shadow-book); }
```

### Sternebewertung: Gestaffelte Fill-Animation

Sterne füllen sich von links nach rechts — 60ms Delay pro Stern. Letzter Stern: `star-burst` Keyframe. Gold-Farbe (`--color-star`), nicht Amber:

```css
.star-interactive .star-icon {
  color: var(--color-text-faint);
  transition: color 120ms ease, transform 120ms ease;
}
.star-interactive .star-icon.filled {
  color: var(--color-star);
}
/* Staffelung via style={{ animationDelay: `${i * 60}ms` }} in TSX */
.star-interactive .star-icon.filling {
  animation: starFill 120ms ease forwards;
}
.star-interactive .star-icon.star-last.filled {
  animation: starBurst 250ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes starFill {
  0%  { color: var(--color-text-faint); transform: scale(1); }
  50% { transform: scale(1.15); }
  100%{ color: var(--color-star); transform: scale(1); }
}
```

### BookDetailsModal: Cover-Skeleton

Während das Cover-Blob aus IndexedDB lädt: Skeleton in Buchrücken-Proportionen (2:3), nicht generischer grauer Block:

```tsx
{coverLoading ? (
  <div className="skeleton aspect-[2/3] w-full rounded-lg" aria-hidden />
) : (
  <img src={coverSrc} alt={book.title} className="w-full aspect-[2/3] object-cover rounded-lg" />
)}
```

---

## Phase 7: Layout-Rhythmus

### Vertikaler Rhythmus (Hauptseite)

```
┌─ Header (48px / 56px) ─────────────────────────────┐
│  Logo · YunoBib          Suche  Theme-Toggle        │
└────────────────────────────────────────────────────┘
  ↕ 0 (Header ist sticky, Tabs scrollen nicht weg)
┌─ Tabs (Bücher · Serien) ───────────────────────────┐
│  ↕ 24px padding-top                                 │
│  Bücher (42)    Serien (8)                          │
└────────────────────────────────────────────────────┘
  ↕ 16px gap
┌─ Buch-Grid ─────────────────────────────────────────┐
│  gap: 12px (mobile) / 20px (desktop)                │
│  padding: 0 1rem 2rem                               │
└────────────────────────────────────────────────────┘
```

### Wichtige Maße als Tokens

| Token | Mobile | Desktop |
|---|---|---|
| `--header-height` | 48px | 56px |
| Grid-Gap | 12px | 20px |
| Modal-Padding | 1.5rem | 2rem |
| Body-Padding-X | 1rem | 1.5rem |

---

## Phase 8: Logo — Custom SVG

Kein styled Text. Y-förmige Buchseiten — geometrisch, monochrom, `currentColor`.

```svg
<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="YunoBib">
  <path d="M7 5 L16 15 L25 5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="16" y1="15" x2="16" y2="27" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M11 27 L21 27" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.35"/>
</svg>
```

---

## Phase 9: Leere Zustände

### Bücher-Tab

```
[Logo-Illustration, 80px, color: --color-text-faint]
Deine Bibliothek wartet.             ← Zodiak italic, --text-lg
Füge dein erstes Buch hinzu —        ← General Sans, --text-sm, muted
per ISBN, Titel oder Autor.
[Button: Buch hinzufügen]            ← btn-primary
```

### Serien-Tab

```
[Linien-Illustration: 3 gestapelte Buchrücken, SVG, faint]
Noch keine Serien.
Erstelle eine Serie, um zusammengehörige
Bücher zu gruppieren.
[Button: Serie erstellen]
```

---

## Phase 10: UX-Micro-Patterns

### Swipe-to-Status (Mobile, Listenansicht)

Touch-Swipe auf einer Listenzeile → Status wechseln, ohne Modal:

- Rechts-Swipe (>60px): Status → `finished` — grüner Hintergrund als Swipe-Indikator
- Links-Swipe (>60px): Status → `unread` — neutraler Hintergrund
- Snap zurück wenn Swipe < 60px (kein ungewollter Trigger)

Implementierung: `onTouchStart` / `onTouchEnd` in `BookCard`, `translateX` via CSS `transform`, kein Library-Overhead.

### Scroll-Position-Restore

Beim Öffnen und Schließen eines Modals bleibt das Grid an der gleichen Scroll-Position:

```tsx
const scrollRef = useRef(0)
const openModal = () => { scrollRef.current = window.scrollY; setOpen(true) }
const closeModal = () => { setOpen(false); requestAnimationFrame(() => window.scrollTo(0, scrollRef.current)) }
```

### Tab-Zähler

```tsx
<button className="tab-btn" data-active={tab === 'books'}>
  Bücher
  <span className="tab-count">{bookCount}</span>
</button>
```

---

## DaisyUI-Klassen: Vollständige Ersatz-Tabelle

| DaisyUI-Klasse | Ersatz |
|---|---|
| `btn`, `btn-primary`, `btn-ghost`, `btn-sm` | `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-sm` (custom) |
| `modal`, `modal-box`, `modal-backdrop` | `.modal-overlay`, `.modal-box` (custom) |
| `badge` | `.status-pill` + Modifier (custom) |
| `tabs`, `tab` | `.tab-list`, `.tab-btn` (custom) |
| `input`, `select`, `textarea` | `.input`, `.select`, `.textarea` (custom) |
| `card`, `card-body` | `.book-card`, `.series-card` (custom) |
| `loading`, `loading-spinner` | `.skeleton` + CSS-only Spinner |
| `dropdown`, `dropdown-content` | Custom Popover via Headless Pattern |
| `base-100/200/300` | `--color-bg`, `--color-surface`, `--color-surface-2` |
| `base-content` | `--color-text` |
| `primary` | `--color-accent` |
| `warning` | `--color-star` (Sterne), `--color-accent` (CTAs) |
| `text-warning` | `text-[var(--color-star)]` |

---

## Migrations-Workflow

```bash
# 1. Feature-Branch
git checkout -b feat/remove-daisyui

# 2. DaisyUI entfernen
pnpm remove daisyui

# 3. tailwind.config.ts — DaisyUI-Plugin entfernen, Token-Mapping rein

# 4. globals.css — Komplettes Rewrite: Tokens, Base, Utilities

# 5. Komponenten-Reihenfolge (nach Aufwand & Wirkung):
#    globals.css + tailwind.config.ts    ~2h
#    ThemeProvider.tsx                   ~30min
#    Header.tsx                          ~1.5h
#    BookCard.tsx                        ~1h
#    SeriesCard.tsx                      ~45min
#    AddBookModal.tsx                    ~3h
#    BookDetailsModal.tsx                ~3h
#    SeriesDetailsModal.tsx              ~1.5h
#    AddSeriesModal.tsx                  ~1h
#    AddBookToSeriesModal.tsx            ~1h
#    BookSearch.tsx                      ~1.5h
#    AddBookButton.tsx                   ~30min
#    Leere Zustände                      ~1h
#    ─────────────────────────────────────────
#    Gesamt:                             ~18–20h

# 6. Nach jeder Komponente: pnpm dev, visuell prüfen (375px + 1280px)

# 7. pnpm build — muss fehlerfrei sein

# 8. PR auf main
```

---

## Qualitäts-Checkliste

- [ ] `pnpm remove daisyui` ausgeführt, kein DaisyUI-Import in `tailwind.config.ts`
- [ ] Keine `text-base-content`, `bg-base-*`, `text-primary`, `btn`, `modal`, `badge`, `tabs` mehr
- [ ] Dark Mode vollständig — alle Surfaces, Texte, Status, Schatten
- [ ] Light Mode vollständig — eigenständiger Charakter, nicht nur „aufgehellt"
- [ ] Hintergrund: `radial-gradient` in beiden Modi, kein solides Schwarz/Crème
- [ ] Body-Font 16px+, Zodiak nur ab 24px
- [ ] `letter-spacing: var(--tracking-wide)` auf Autoren/Muted-Text
- [ ] `font-variant-numeric: tabular-nums` auf Sternen und Zählern
- [ ] Cover-Hover: `perspective rotateY` Effekt vorhanden
- [ ] Cover-Vignette: `::after` Overlay auf allen Covers
- [ ] Series-Stack: gestapelte Cover-Darstellung
- [ ] Sterne: `--color-star` (#e8c87a), gestaffelte Fill-Animation
- [ ] Status-Pills: uppercase, `tracking-widest`
- [ ] `::selection` amber-toned
- [ ] `:focus-visible` amber-toned
- [ ] Custom Scrollbar (4px, `--color-border`)
- [ ] Modal: `perspective rotateX` Eingangs-Animation
- [ ] Leere Zustände für beide Tabs mit Illustration + CTA
- [ ] Swipe-to-Status auf Mobile
- [ ] Scroll-Position-Restore bei Modal close
- [ ] Tab-Zähler mit `tabular-nums`
- [ ] Mobile 375px: alle Touch-Targets ≥44px, Modals als Bottom-Sheet
- [ ] WCAG AA: Body-Text 4.5:1 auf allen Surfaces (Dark + Light)
- [ ] `prefers-reduced-motion`: alle Animationen respektieren es
- [ ] `pnpm build` fehlerfrei

---

*Stand: Mai 2026 — YunoBib / simplebib — v2*
