# YunoBib — Custom Design System Plan
> DaisyUI-Entfernung & Aufbau eines eigenständigen visuellen Systems

---

## Ausgangslage

YunoBib verwendet aktuell **Tailwind CSS v4 + DaisyUI v5** als UI-Fundament. DaisyUI bringt ein fertiges Theme-System mit semantischen Klassen (`btn`, `card`, `modal`, `badge`, `tabs`, `select` usw.), das tief in allen Komponenten verwurzelt ist.

**Warum raus?**
- DaisyUI-Klassen erzwingen ein generisches, wiedererkennbar-template-haftes Aussehen
- Das Theme-System kämpft gegen unsere Custom-Farbtokens statt mit ihnen
- Viele DaisyUI-Komponenten (z. B. `modal`, `drawer`, `dropdown`) bringen komplexes JS-Verhalten und CSS mit, das wir nicht vollständig kontrollieren
- Das Ziel ist ein Design, das sich nach *YunoBib* anfühlt — nicht nach "eine App, die DaisyUI benutzt"

---

## Was DaisyUI aktuell macht

### Genutzte DaisyUI-Klassen (Bestandsaufnahme)

| Klasse | Verwendet in | Ersatz |
|---|---|---|
| `btn`, `btn-primary`, `btn-ghost`, `btn-sm` | alle Modals, Header, AddBookButton | Custom `.btn` utility |
| `modal`, `modal-box`, `modal-backdrop` | AddBookModal, BookDetailsModal, SeriesDetailsModal, AddSeriesModal, AddBookToSeriesModal | Custom Modal-Komponente |
| `badge` | Status-Anzeigen (unread/reading/finished) | Custom `.status-pill` utility |
| `tabs`, `tab` | app/page.tsx (Books / Serien) | Custom Tab-Komponente |
| `input`, `select`, `textarea`, `label` | alle Formularfelder | Custom Form-utilities |
| `card`, `card-body` | BookCard, SeriesCard | Komplett eigene Implementierung |
| `loading`, `loading-spinner` | BookSearch, überall | CSS-only Spinner |
| `dropdown`, `dropdown-content` | Header (Theme-Switcher) | Custom Dropdown |
| `base-100`, `base-200`, `base-300`, `base-content` | als CSS-Variable-Referenzen | Custom `--color-*` Tokens |
| `primary`, `secondary`, `warning`, `error` | Farbreferenzen | Custom `--color-accent`, `--color-status-*` |
| `status-unread`, `status-reading`, `status-finished` | BookCard, BookDetailsModal | Custom CSS-Utilities (bereits eigene Klassen) |

---

## Ziel: Eigenständiges Design-Token-System

### Art Direction

> **"Die Nachtstunde in einer gut gelebten Bibliothek"**

Warme Dunkelheit, altes Holz, crème Papier. Keine Nostalgie-Dekoration — distilliert, zeitlos, ruhig. Dark-first, weil eine Bibliothek abends am schönsten ist.

---

## Phase 1: Typografie

**Weg von Playfair Display + Lora** (Tailwind-Config aktuell so eingestellt). Beide sind zu weit verbreitet und haben zu viel "Design-Template"-Energie.

### Neue Font-Paarung

```css
--font-display: 'Zodiak', 'Georgia', serif;
--font-body:    'General Sans', 'Helvetica Neue', sans-serif;
```

- **Zodiak** (Fontshare): Eleganter, leicht antiquierter Serif mit modernem Schnitt. Für Buchtitel in Detailansichten, Serien-Namen, Hauptüberschriften. Nur ab `--text-xl` (24px+).
- **General Sans** (Fontshare): Geometrisch, klar, warm. Keine Ecken wie Inter. Für alle Body-Texte, Labels, Buttons, Metadaten (Autoren, Status).

```html
<!-- In app/layout.tsx -->
<link href="https://api.fontshare.com/v2/css?f[]=zodiak@400,500,700&f[]=general-sans@300,400,500,600&display=swap" rel="stylesheet">
```

### Fluid Type Scale

```css
--text-xs:   clamp(0.75rem,  0.7rem  + 0.25vw, 0.875rem); /* 12px → 14px */
--text-sm:   clamp(0.875rem, 0.8rem  + 0.35vw, 1rem);     /* 14px → 16px */
--text-base: clamp(1rem,     0.95rem + 0.25vw, 1.125rem);  /* 16px → 18px */
--text-lg:   clamp(1.125rem, 1rem    + 0.75vw, 1.5rem);    /* 18px → 24px */
--text-xl:   clamp(1.5rem,   1.2rem  + 1.25vw, 2.25rem);   /* 24px → 36px */
```

**Regeln:**
- Zodiak (`--font-display`) ausschließlich ab `--text-xl`
- Alles darunter: General Sans (`--font-body`)
- Maximal 4 Textstile pro Seite

---

## Phase 2: Farbsystem

DaisyUI-semantische Farbnamen (`primary`, `base-100` usw.) komplett ersetzen durch explizite Custom-Tokens.

### Dark Mode (Standard)

```css
:root, [data-theme="dark"] {
  --color-bg:              #0e0c0b;
  --color-surface:         #161412;
  --color-surface-2:       #1d1a17;
  --color-surface-elevated:#252118;
  --color-border:          oklch(from #e8e2d8 l c h / 0.10);
  --color-divider:         oklch(from #e8e2d8 l c h / 0.06);

  --color-text:            #e8e2d8;
  --color-text-muted:      #7a7168;
  --color-text-faint:      #4a4540;
  --color-text-inverse:    #0e0c0b;

  /* Akzent — Amber Terracotta. DER einzige Farbakzent. */
  --color-accent:          #c9956a;
  --color-accent-hover:    #d9a87d;
  --color-accent-active:   #b07d55;
  --color-accent-muted:    oklch(from #c9956a l c h / 0.15);

  /* Status-Farben — minimal, kein RGB-Bombardement */
  --color-reading:         #6a9e8f;
  --color-reading-muted:   oklch(from #6a9e8f l c h / 0.15);
  --color-finished:        #c9956a; /* gleich wie Akzent */
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

  /* Schatten — warm getönt, kein reines Schwarz */
  --shadow-sm: 0 1px 3px oklch(0.08 0.02 60 / 0.4);
  --shadow-md: 0 4px 16px oklch(0.08 0.02 60 / 0.5);
  --shadow-lg: 0 12px 40px oklch(0.08 0.02 60 / 0.6);

  /* Übergänge */
  --transition: 180ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Light Mode

```css
[data-theme="light"] {
  --color-bg:              #f5f2ee;
  --color-surface:         #faf8f4;
  --color-surface-2:       #ffffff;
  --color-surface-elevated:#ffffff;
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

  --color-reading:         #3d7a6a;
  --color-reading-muted:   oklch(from #3d7a6a l c h / 0.12);
  --color-finished:        #a3704a;
  --color-unread:          #c0b8ae;

  --color-error:           #8b3a2a;
  --color-success:         #3d7a6a;

  --shadow-sm: 0 1px 3px oklch(0.15 0.02 60 / 0.12);
  --shadow-md: 0 4px 16px oklch(0.15 0.02 60 / 0.10);
  --shadow-lg: 0 12px 40px oklch(0.15 0.02 60 / 0.14);
}
```

**Farbphilosophie:** 1 Akzent (Amber), 1 Status-Grün (Reading), Neutral für alles andere. Maximal 2 Nicht-Neutral-Töne pro Viewport sichtbar.

---

## Phase 3: Tailwind-Konfiguration

`tailwind.config.ts` wird radikal vereinfacht — kein DaisyUI, nur Custom-Token-Mapping.

```ts
// tailwind.config.ts — nach Umbau
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
        bg:       'var(--color-bg)',
        surface:  'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        border:   'var(--color-border)',
        text:     'var(--color-text)',
        muted:    'var(--color-text-muted)',
        faint:    'var(--color-text-faint)',
        accent:   'var(--color-accent)',
        reading:  'var(--color-reading)',
        finished: 'var(--color-finished)',
        unread:   'var(--color-unread)',
        error:    'var(--color-error)',
      },
      animation: {
        'fade-up':  'fadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in':  'fadeIn 0.3s ease-out forwards',
        'modal-in': 'modalIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shimmer':  'shimmer 1.6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:   { '0%': { opacity: '0', transform: 'translateY(14px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:   { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        modalIn:  { '0%': { opacity: '0', transform: 'translateY(20px) scale(0.97)' }, '100%': { opacity: '1', transform: 'translateY(0) scale(1)' } },
        shimmer:  { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  // Kein plugins: [daisyui]
}

export default config
```

**package.json:** `daisyui` aus `devDependencies` entfernen. Nach Umbau: `pnpm remove daisyui`.

---

## Phase 4: Custom CSS Utilities (`app/globals.css`)

Alle DaisyUI-Klassen werden durch eigene, schlanke CSS-Utilities ersetzt. Keine externe Abhängigkeit mehr.

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
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: background var(--transition), color var(--transition), border-color var(--transition);
  white-space: nowrap;
  user-select: none;
}
.btn:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }

/* Primär: Akzentfarbe — für die ONE wichtige Aktion pro Screen */
.btn-primary {
  background: var(--color-accent);
  color: var(--color-text-inverse);
  border-color: var(--color-accent);
}
.btn-primary:hover { background: var(--color-accent-hover); border-color: var(--color-accent-hover); }

/* Ghost: Nur Text, kein Hintergrund */
.btn-ghost {
  background: transparent;
  color: var(--color-text-muted);
}
.btn-ghost:hover { background: oklch(from var(--color-text) l c h / 0.06); color: var(--color-text); }

/* Outline: Dezenter Rahmen */
.btn-outline {
  background: transparent;
  color: var(--color-text);
  border-color: var(--color-border);
}
.btn-outline:hover { background: oklch(from var(--color-text) l c h / 0.06); }

.btn-sm { padding: 0.3rem 0.75rem; font-size: var(--text-xs); }
.btn-icon { padding: 0.5rem; aspect-ratio: 1; }
```

### Status-Pills (ersetzt DaisyUI `badge`)

```css
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.55rem;
  font-size: var(--text-xs);
  font-weight: 500;
  border-radius: var(--radius-full);
  letter-spacing: 0.01em;
}
.status-pill::before {
  content: '';
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.7;
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
}
.input:focus, .select:focus, .textarea:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-muted);
}
.input::placeholder { color: var(--color-text-faint); }
```

### Modal

```css
.modal-overlay {
  position: fixed; inset: 0; z-index: 50;
  background: oklch(0.08 0.01 60 / 0.7);
  backdrop-filter: blur(4px);
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
  animation: modalIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@media (min-width: 640px) {
  .modal-box {
    max-width: 560px;
    border-radius: var(--radius-xl);
    max-height: 85dvh;
  }
}
```

### Tabs

```css
.tab-list {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--color-divider);
  position: relative;
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
}
.tab-btn:hover { color: var(--color-text); }
.tab-btn[data-active="true"] {
  color: var(--color-text);
}
.tab-btn[data-active="true"]::after {
  content: '';
  position: absolute;
  bottom: -1px; left: 1.25rem; right: 1.25rem;
  height: 2px;
  background: var(--color-accent);
  border-radius: 1px;
}
```

### Skeleton Loader

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-surface-2) 25%,
    oklch(from var(--color-surface-2) calc(l + 0.04) c h) 50%,
    var(--color-surface-2) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.6s ease-in-out infinite;
  border-radius: var(--radius-sm);
}
```

---

## Phase 5: Komponenten-Umbau

Reihenfolge nach Aufwand und visueller Wirkung:

### 1. `globals.css` + `tailwind.config.ts`
Fundament zuerst. Alle Token definieren, DaisyUI-Import entfernen, Custom-Utilities anlegen. Dauer: ~2h

### 2. `ThemeProvider.tsx`
DaisyUI setzt `data-theme` auf `<html>`. Wir übernehmen das selbst — gleiches Attribut, aber eigene CSS-Logik. Minimale Änderung, hohe Auswirkung. Dauer: ~30min

### 3. `Header.tsx`
Blur-Navbar, neues Logo (inline SVG), Tab-Wechsel mit eigenem Tab-System, Theme-Toggle ohne DaisyUI-Dropdown. Dauer: ~1.5h

### 4. `BookCard.tsx`
Bereits halb custom (eigene `book-card`, `status-*`, `cover-placeholder` Klassen). Restliche DaisyUI-Referenzen (`text-base-content`, `text-warning`, `bg-base-300`) auf Custom-Tokens umschreiben. Dauer: ~1h

### 5. `SeriesCard.tsx`
Analog zu BookCard. Dauer: ~45min

### 6. `AddBookModal.tsx` (größte Datei: 14KB)
`modal`, `btn`, `input`, `select`, `badge` — alle DaisyUI. Komplett auf Custom-Utilities. Dauer: ~3h

### 7. `BookDetailsModal.tsx` (14.7KB)
Analog zu AddBookModal. Zusätzlich: Status-Änderung als Pill-Toggle statt Select-Dropdown. Dauer: ~3h

### 8. `SeriesDetailsModal.tsx` + `AddSeriesModal.tsx` + `AddBookToSeriesModal.tsx`
Gleiche Behandlung. Dauer: ~2.5h

### 9. `BookSearch.tsx`
Search-Input, Ergebnis-Karten. Dauer: ~1.5h

### 10. `AddBookButton.tsx`
FAB (Floating Action Button). Dauer: ~30min

**Gesamtschätzung: ~16–18 Stunden Entwicklungsarbeit**

---

## Phase 6: Logo — Custom SVG

Kein styled Text. Ein geometrisches Mark: Y-förmige Buchseiten.

```svg
<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="YunoBib">
  <!-- Buchseiten die ein Y formen -->
  <path d="M7 5 L16 15 L25 5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="16" y1="15" x2="16" y2="27" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Subtile Buchboden-Linie -->
  <path d="M11 27 L21 27" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.35"/>
</svg>
```

Monochrom, `currentColor`. Funktioniert auf 16px und 200px. Kein Hintergrund, keine Farbe.

---

## Phase 7: Leere Zustände

Niemals "No items" oder leere Listen ohne Erklärung.

### Bücher-Tab (leer)
```
[Logo-Illustration, groß, gedimmt]
Deine Bibliothek wartet.
Füge dein erstes Buch hinzu — per ISBN, Titel oder Autor.
[Button: Buch hinzufügen]
```

### Serien-Tab (leer)
```
[Linien-Illustration: gestapelte Buchrücken]
Noch keine Serien.
Erstelle eine Serie, um zusammengehörige Bücher zu gruppieren.
[Button: Serie erstellen]
```

---

## Migration: Schritt für Schritt (Git-Workflow)

```bash
# 1. Feature-Branch
git checkout -b feat/remove-daisyui

# 2. DaisyUI entfernen
pnpm remove daisyui

# 3. tailwind.config.ts anpassen (kein DaisyUI-Plugin)

# 4. globals.css: Token-System + Custom Utilities

# 5. Komponenten einzeln umbauen — nach obiger Reihenfolge

# 6. Nach jedem Komponenten-Umbau: visuell prüfen (pnpm dev)

# 7. PR auf main wenn alle Komponenten fertig
```

**Wichtig:** Nicht alles auf einmal. Jede Komponente wird einzeln umgebaut und getestet, bevor die nächste dran ist.

---

## Qualitäts-Checkliste (nach Umbau)

- [ ] `pnpm remove daisyui` ausgeführt, kein Import mehr in `tailwind.config.ts`
- [ ] Kein `data-theme` mit DaisyUI-Theme-Namen (`light`/`dark` als Wert bleiben, aber die CSS dahinter ist eigenes)
- [ ] Alle `text-base-content`, `bg-base-*`, `text-primary`, `btn`, `modal`, `badge`, `tabs` ersetzt
- [ ] Dark Mode funktioniert vollständig — alle Surfaces, alle Texte, alle Status-Farben
- [ ] Light Mode funktioniert vollständig
- [ ] Mobile: 375px — alle Touch-Targets ≥44px, Modals als Bottom-Sheet
- [ ] WCAG AA: Body-Text 4.5:1 Kontrast auf allen Surfaces (Dark + Light)
- [ ] Keine Farbe kleiner als `--text-xs` (12px)
- [ ] Zodiak nur ab 24px+, General Sans für alles darunter
- [ ] Animationen respektieren `prefers-reduced-motion`
- [ ] Leere Zustände für beide Tabs designed
- [ ] `pnpm build` fehlerfrei

---

*Stand: Mai 2026 — YunoBib / simplebib*
