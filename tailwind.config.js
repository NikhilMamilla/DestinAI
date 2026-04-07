/** @type {import('tailwindcss').Config} */
// ============================================================
//  DESTINAI — Complete Tailwind CSS Design System Config
//  Use this as your tailwind.config.js at the project root
// ============================================================

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue,html}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    // ── Override Tailwind's default screens with DestinAI breakpoints ──
    screens: {
      xs: "375px",   // Small mobile (iPhone SE)
      sm: "640px",   // Mobile landscape
      md: "768px",   // Tablet portrait
      lg: "1024px",  // Tablet landscape / small laptop
      xl: "1280px",  // Desktop
      "2xl": "1536px", // Large desktop
    },

    extend: {
      // ════════════════════════════════════════════════════════
      //  1. COLOR PALETTE
      // ════════════════════════════════════════════════════════
      colors: {

        // ── Primary — Midnight Navy ──────────────────────────
        // Usage: Navbars, hero sections, dark cards, overlays
        midnight: {
          50:  "#E8F0F7",   // ghost tint — hover backgrounds
          100: "#C5D4E8",   // very light navy
          200: "#8BAABF",   // muted navy
          300: "#5A7FA0",   // medium navy
          400: "#2A5280",   // atlas medium
          500: "#1A3A5C",   // Atlas Blue — section backgrounds
          600: "#122133",   // deep navy
          700: "#0D1E2E",   // near-dominant
          800: "#0B1A2E",   // Midnight Voyage — DOMINANT COLOR
          900: "#070F1A",   // deepest shadow
          DEFAULT: "#0B1A2E",
        },

        // ── Accent — Compass Gold ────────────────────────────
        // Usage: CTAs, price tags, star ratings, logo highlights
        gold: {
          50:  "#FFF9EC",   // warm white — card backgrounds
          100: "#FFF3D6",   // pale gold
          200: "#FFE0A8",   // soft gold
          300: "#FFC966",   // light gold
          400: "#FFB740",   // Compass Gold — PRIMARY ACCENT
          500: "#D48500",   // deeper gold — hover state
          600: "#B06C00",   // dark gold — active state
          700: "#7A4A00",   // very dark gold
          800: "#4A2C00",   // near-black gold
          900: "#2A1800",   // darkest
          DEFAULT: "#FFB740",
        },

        // ── Discovery — Horizon Teal ─────────────────────────
        // Usage: Map routes, transport chips, nav badges, pins
        teal: {
          50:  "#E0FAFA",   // lightest teal mist
          100: "#B3F0F0",   // light teal
          200: "#7FE0E0",   // soft teal glow
          300: "#40C8C8",   // medium teal
          400: "#2BB8B8",   // bright teal
          500: "#129090",   // Horizon Teal — DISCOVERY COLOR
          600: "#0D6E6E",   // strong teal — DEFAULT
          700: "#095252",   // dark teal
          800: "#063A3A",   // very dark teal
          900: "#032222",   // deepest teal
          DEFAULT: "#0D6E6E",
        },

        // ── Surface Light ─────────────────────────────────────
        // Usage: Light page backgrounds, card surfaces, inputs
        mist: {
          50:  "#FFFFFF",   // pure white
          100: "#F7F3EE",   // Parchment — warm page background
          200: "#F0EBE3",   // warm card bg
          300: "#E8F4FD",   // Cloud Mist — cool card bg
          400: "#D5E5F0",   // muted sky
          500: "#C2D5E4",   // medium mist
          600: "#AABFD2",   // soft slate
          700: "#8BAABF",   // muted blue-gray
          800: "#6B8FA8",   // slate blue
          900: "#4A6B80",   // dark slate
          DEFAULT: "#E8F4FD",
        },

        // ── Semantic — Aurora Violet (AI / Premium) ──────────
        // Usage: AI badges, itinerary glow, personalization UI
        aurora: {
          50:  "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",   // Aurora Violet — DEFAULT
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
          DEFAULT: "#8B5CF6",
        },

        // ── Semantic — Sunset Coral (Alerts / Deals) ─────────
        coral: {
          50:  "#FFF0F3",
          100: "#FFD6DD",
          200: "#FFB3BF",
          300: "#FF8096",
          400: "#F55070",
          500: "#E84560",   // Sunset Coral — DEFAULT
          600: "#C93050",
          700: "#A01E3C",
          800: "#78102A",
          900: "#500818",
          DEFAULT: "#E84560",
        },

        // ── Semantic — Rainforest (Success / Eco) ────────────
        forest: {
          50:  "#EDFFF4",
          100: "#C6F6D5",
          200: "#9AE6B4",
          300: "#68D391",
          400: "#48BB78",
          500: "#38A169",
          600: "#28A745",   // Rainforest — DEFAULT
          700: "#276749",
          800: "#1C4D34",
          900: "#0F3420",
          DEFAULT: "#28A745",
        },

        // ── Text ──────────────────────────────────────────────
        ink: {
          DEFAULT: "#2D2D2D",
          muted:   "#6B6B6B",
          subtle:  "#9E9E9E",
          ghost:   "#BDBDBD",
        },
      },

      // ════════════════════════════════════════════════════════
      //  2. TYPOGRAPHY — 5 Unique Font Families
      // ════════════════════════════════════════════════════════
      fontFamily: {
        // F1: Cinzel — Logo, hero headings, landmark names
        //     "Roman letterforms with classical engraved feel"
        display: ["Cinzel", "Georgia", "serif"],

        // F2: DM Serif Display — Section titles, destination cards
        editorial: ["DM Serif Display", "Georgia", "serif"],

        // F3: Josefin Sans — UI labels, tags, nav, prices
        label: ["Josefin Sans", "system-ui", "sans-serif"],

        // F4: Urbanist — Body copy, descriptions, app text
        body: ["Urbanist", "system-ui", "sans-serif"],

        // F5: Bebas Neue — Numbers, stats, ETAs, distances
        stat: ["Bebas Neue", "Impact", "sans-serif"],

        // Override Tailwind defaults too
        sans: ["Urbanist", "system-ui", "sans-serif"],
        serif: ["DM Serif Display", "Georgia", "serif"],
        mono: ["Space Mono", "ui-monospace", "monospace"],
      },

      // ── Font sizes ────────────────────────────────────────────
      fontSize: {
        // Micro labels
        "2xs":  ["10px", { lineHeight: "14px", letterSpacing: "0.1em" }],
        xs:     ["11px", { lineHeight: "16px" }],
        sm:     ["12px", { lineHeight: "18px" }],

        // Body
        base:   ["14px", { lineHeight: "22px" }],
        md:     ["15px", { lineHeight: "24px" }],
        lg:     ["16px", { lineHeight: "26px" }],

        // Titles
        xl:     ["18px", { lineHeight: "28px" }],
        "2xl":  ["20px", { lineHeight: "30px" }],
        "3xl":  ["24px", { lineHeight: "34px" }],
        "4xl":  ["28px", { lineHeight: "38px" }],
        "5xl":  ["36px", { lineHeight: "44px" }],

        // Display / Hero
        "6xl":  ["44px", { lineHeight: "50px" }],
        "7xl":  ["56px", { lineHeight: "62px" }],
        "8xl":  ["72px", { lineHeight: "78px" }],
        "9xl":  ["96px", { lineHeight: "100px" }],

        // Stat numbers (Bebas Neue)
        "stat-sm":  ["32px", { lineHeight: "1", letterSpacing: "0.04em" }],
        "stat-md":  ["48px", { lineHeight: "1", letterSpacing: "0.04em" }],
        "stat-lg":  ["64px", { lineHeight: "1", letterSpacing: "0.04em" }],
        "stat-xl":  ["96px", { lineHeight: "1", letterSpacing: "0.02em" }],
      },

      // ── Letter spacing ────────────────────────────────────────
      letterSpacing: {
        tightest: "-0.04em",
        tighter:  "-0.02em",
        tight:    "-0.01em",
        normal:   "0em",
        wide:     "0.05em",
        wider:    "0.1em",
        widest:   "0.2em",
        ultra:    "0.3em",      // For Josefin Sans category labels
        extreme:  "0.4em",     // For hero eyebrow text
      },

      // ════════════════════════════════════════════════════════
      //  3. SPACING & LAYOUT
      // ════════════════════════════════════════════════════════
      spacing: {
        // Named spacers for DestinAI sections
        "section":     "80px",   // Vertical section padding
        "section-sm":  "48px",   // Mobile section padding
        "card-pad":    "20px",   // Standard card padding
        "card-pad-lg": "28px",   // Large card padding
        "nav-h":       "64px",   // Navbar height
        "nav-h-mobile":"56px",   // Mobile navbar height
      },

      // ════════════════════════════════════════════════════════
      //  4. BORDER RADIUS
      // ════════════════════════════════════════════════════════
      borderRadius: {
        none: "0px",
        xs:   "4px",    // micro chips
        sm:   "6px",    // small badges
        md:   "8px",    // buttons, inputs
        lg:   "12px",   // cards
        xl:   "16px",   // panels
        "2xl":"20px",   // large cards, modals
        "3xl":"24px",   // hero sections, map containers
        "4xl":"32px",   // pill containers
        full: "9999px", // pill badges
      },

      // ════════════════════════════════════════════════════════
      //  5. BOX SHADOWS — DestinAI elevation system
      // ════════════════════════════════════════════════════════
      boxShadow: {
        // Light shadows (for light UI)
        "card":       "0 2px 12px rgba(11, 26, 46, 0.08)",
        "card-hover": "0 8px 24px rgba(11, 26, 46, 0.14)",
        "card-active":"0 4px 16px rgba(11, 26, 46, 0.10)",

        // Dark mode / navy context shadows
        "dark":       "0 4px 20px rgba(0, 0, 0, 0.4)",
        "dark-hover": "0 8px 32px rgba(0, 0, 0, 0.5)",

        // Gold glow — for featured cards, CTA hover
        "gold":       "0 4px 20px rgba(255, 183, 64, 0.3)",
        "gold-hover": "0 8px 32px rgba(255, 183, 64, 0.45)",

        // Teal glow — for map pins, route highlights
        "teal":       "0 4px 16px rgba(13, 110, 110, 0.3)",

        // Aurora glow — for AI feature cards
        "aurora":     "0 4px 20px rgba(139, 92, 246, 0.25)",

        // Button shadows
        "btn-primary":  "0 4px 14px rgba(255, 183, 64, 0.35)",
        "btn-dark":     "0 4px 14px rgba(11, 26, 46, 0.35)",

        // Input focus ring
        "input-focus":  "0 0 0 3px rgba(26, 58, 92, 0.15)",
        "input-gold":   "0 0 0 3px rgba(255, 183, 64, 0.2)",
      },

      // ════════════════════════════════════════════════════════
      //  6. GRADIENTS (defined as backgroundImage)
      // ════════════════════════════════════════════════════════
      backgroundImage: {
        // Hero gradients
        "hero-dark":     "linear-gradient(135deg, #0B1A2E 0%, #1A3A5C 50%, #0D2640 100%)",
        "hero-midnight": "linear-gradient(180deg, #0B1A2E 0%, #122133 100%)",
        "hero-atlas":    "linear-gradient(135deg, #0D2640 0%, #1A3A5C 100%)",

        // Card gradients
        "card-navy":     "linear-gradient(145deg, #1A3A5C, #0B1A2E)",
        "card-teal":     "linear-gradient(135deg, #1E4A7A, #0D6E6E)",
        "card-gold":     "linear-gradient(135deg, #FFB740, #D48500)",
        "card-aurora":   "linear-gradient(135deg, #8B5CF6, #1A3A5C)",

        // Overlays
        "overlay-dark":  "linear-gradient(to top, rgba(11,26,46,0.95) 0%, rgba(11,26,46,0) 60%)",
        "overlay-mid":   "linear-gradient(to top, rgba(11,26,46,0.7) 0%, transparent 100%)",
        "overlay-light": "linear-gradient(to bottom, rgba(232,244,253,0.95), rgba(247,243,238,0.95))",

        // Shimmer (loading skeleton)
        "shimmer":       "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",

        // Decorative
        "gold-strip":    "linear-gradient(90deg, transparent, #FFB740 50%, transparent)",
        "teal-strip":    "linear-gradient(90deg, transparent, #0D6E6E 50%, transparent)",
      },

      // ════════════════════════════════════════════════════════
      //  7. ANIMATIONS
      // ════════════════════════════════════════════════════════
      animation: {
        "fade-in":      "fadeIn 0.4s ease-out",
        "fade-up":      "fadeUp 0.5s ease-out",
        "slide-in-r":   "slideInRight 0.4s ease-out",
        "slide-in-l":   "slideInLeft 0.4s ease-out",
        "slide-up":     "slideUp 0.3s ease-out",
        "scale-in":     "scaleIn 0.3s ease-out",
        "pulse-gold":   "pulseGold 2s ease-in-out infinite",
        "pulse-teal":   "pulseTeal 2s ease-in-out infinite",
        "shimmer":      "shimmer 1.5s linear infinite",
        "float":        "float 4s ease-in-out infinite",
        "spin-slow":    "spin 8s linear infinite",
        "bounce-soft":  "bounceSoft 1s ease-in-out infinite",
        "ping-gold":    "pingGold 1.5s ease-out infinite",
      },

      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(24px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        slideInLeft: {
          from: { opacity: "0", transform: "translateX(-24px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        slideUp: {
          from: { transform: "translateY(100%)" },
          to:   { transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.94)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255,183,64,0.4)" },
          "50%":       { boxShadow: "0 0 0 12px rgba(255,183,64,0)" },
        },
        pulseTeal: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(13,110,110,0.4)" },
          "50%":       { boxShadow: "0 0 0 12px rgba(13,110,110,0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":       { transform: "translateY(-8px)" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":       { transform: "translateY(-4px)" },
        },
        pingGold: {
          "0%":   { transform: "scale(1)", opacity: "0.8" },
          "75%, 100%": { transform: "scale(1.8)", opacity: "0" },
        },
      },

      // ════════════════════════════════════════════════════════
      //  9. Z-INDEX SYSTEM
      // ════════════════════════════════════════════════════════
      zIndex: {
        auto:    "auto",
        0:       "0",
        10:      "10",    // Cards, content
        20:      "20",    // Sticky elements
        30:      "30",    // Dropdowns
        40:      "40",    // Map overlay UI
        50:      "50",    // Navbar
        60:      "60",    // Drawer / Bottom sheet
        70:      "70",    // Modal
        80:      "80",    // Toast / Snackbar
        90:      "90",    // Tooltip
        100:     "100",   // Critical overlays
      },
    },
  },
  plugins: [],
};