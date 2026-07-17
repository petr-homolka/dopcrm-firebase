/** @type {import('tailwindcss').Config} */
// Tokeny podle DESIGN.md §2-4 — redesign "Connecteam" (2026-07-04), nahrazuje
// starý "Přítomnost"/Amie design systém (archiv docs/DESIGN-amie-archiv.md).
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── Legacy Amie tokeny — PONECHÁNY dokud se obrazovky postupně
        // nepřevedou na novou paletu (Krok 3 redesignu). Bez nich by
        // nepřevedené obrazovky přišly o barvy dřív, než na ně dojde řada.
        primary: {
          50: '#EDF6F5',
          100: '#D7EAE7',
          600: '#1A6B64',
          700: '#14544F',
          900: '#0F3D3A',
        },

        // ── Connecteam redesign (DESIGN.md §2.1) ──────────────────────
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#2E7CF6',
          600: '#1E6FF5',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        accent: {
          50: '#ECFEFF',
          100: '#CFFAFE',
          500: '#0FB3B1',
          600: '#0891A2',
          700: '#0E7490',
        },
        surface: {
          canvas: '#F5F7FA',
          card: '#FFFFFF',
          sidebar: '#FFFFFF',
          muted: '#F8FAFC',
          tint: '#EFF6FF',
        },
        border: {
          subtle: '#EEF1F5',
          default: '#E5E9F0',
          strong: '#D9DEE7',
        },
        ink: {
          900: '#0F172A',
          800: '#1A2B49',
          700: '#334155',
          600: '#4A5568',
          500: '#64748B',
          400: '#6B7A90',
          300: '#A0AEC0',
        },
        success: { 50: '#DCFCE7', 500: '#22C55E', 600: '#16A34A', 700: '#166534' },
        warning: { 50: '#FEF3C7', 500: '#F59E0B', 600: '#D97706', 700: '#92400E' },
        danger: { 50: '#FEE2E2', 200: '#FECACA', 500: '#EF4444', 600: '#DC2626', 700: '#991B1B' },
        info: { 50: '#DBEAFE', 500: '#2E7CF6', 600: '#1E6FF5' },

        // Barvy modulů — dlaždice v sidebaru (DESIGN.md §2.2).
        module: {
          today: '#2E7CF6',
          families: '#3ECF8E',
          calendar: '#F5A623',
          timeline: '#7B61FF',
          documents: '#0FB3B1',
          allowances: '#F2C94C',
          team: '#5B6B8C',
          admin: '#6B7280',
        },

        // Sémantické barvy entit (DESIGN.md §2.3) — přebarveno z Amie, stejné
        // sémantické role a API (`Badge` tone="family"|"ospod"|"court"|"bio"|"crisis"),
        // NESMÍ regresovat rozlišitelnost (§8 bod 5).
        entity: {
          family: { text: '#047857', bg: '#ECFDF5' },
          ospod: { text: '#1D4ED8', bg: '#EFF6FF' },
          court: { text: '#334155', bg: '#F8FAFC' },
          bio: { text: '#92400E', bg: '#FFFBEB' },
          crisis: { text: '#991B1B', bg: '#FEE2E2' },
        },

        // Barvy shift bloků v kalendáři (DESIGN.md §2.4) — sytá plná barva,
        // bílý text; odlišné od entity tinted pills výše.
        shift: {
          visit: '#2E7D5B',
          ospod: '#1E40AF',
          court: '#4A5A78',
          bio: '#B58B2E',
          crisis: '#B23A3A',
          methodics: '#6B4EA0',
          education: '#2A8FA0',
        },

        // ── Mobilní PWA — "Connecteam Native Feel" (2026-07-06 v2) ─────
        // ÚPLNĚ SAMOSTATNÁ paleta pro src/mobile/ — nikdy nepoužívat v
        // src/modules/ (desktop). Hodnoty ověřené proti reálnému Connecteam
        // bookshelf.min.css (--ct-gray-10/-6, --ct-orange-6, --ct-red-6) a
        // proti skutečné iOS system-blue (#007AFF) — na výslovnou žádost
        // BEZ zelené (žádné "positive" surface); success zůstává jen jako
        // token pro budoucí použití, nikde se aktivně nepoužívá.
        native: {
          bg: '#F2F2F7',        // pozadí appky mimo karty (iOS systémová šedá)
          surface: '#FFFFFF',   // karty, listy, sheets
          primary: '#007AFF',   // iOS system blue — VŠECHNA primární CTA i "pozitivní" stavy
          success: '#007AFF',   // vědomě = primary (žádná zelená v appce, 2026-07-06)
          warning: '#FF9500',   // = Connecteam --ct-orange-6 (shoduje se s iOS orange)
          danger: '#F23F3F',    // = Connecteam --ct-red-6
          text: '#203040',      // = Connecteam --ct-gray-10 (tmavá navy-gray, ne čistá černá)
          textMuted: '#8B939C', // = Connecteam --ct-gray-6 (téměř identické s dřívějším #8E8E93)
          separator: '#E5E5EA', // 1px linky (nikdy skutečný border-box stín)
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        // Mobilní appka — Connecteam sám používá 'Noto Sans' (bookshelf.min.css,
        // --ct-font-family-primary), ne Plus Jakarta Sans. Vlastní typografická
        // identita izolovaná od desktopu stejně jako `native.*` barvy.
        native: ['Noto Sans Variable', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        // Přesné hodnoty z Connecteam bookshelf.min.css: --ct-card-border-radius
        // (--ct-border-radius-default) a --ct-input-border-radius (nested).
        'native-card': '18px',
        'native-input': '10px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(16 24 40 / 0.05), 0 1px 3px 0 rgb(16 24 40 / 0.06)',
        lg: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [],
};
