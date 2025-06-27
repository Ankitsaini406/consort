module.exports = {
  // ...

  theme: {
    extend: {
      backgroundImage: {
        // Left Fades
        'fade-left-white': 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 25%, rgba(255,255,255,0.6) 60%, rgba(255,255,255,0) 100%)',
        'fade-left-neutral-50': 'linear-gradient(to right, rgba(250,250,250,1) 0%, rgba(250,250,250,0.95) 25%, rgba(250,250,250,0.6) 60%, rgba(250,250,250,0) 100%)',
        'fade-left-neutral-100': 'linear-gradient(to right, rgba(245,245,245,1) 0%, rgba(245,245,245,0.95) 25%, rgba(245,245,245,0.6) 60%, rgba(245,245,245,0) 100%)',

        // Right Fades
        'fade-right-white': 'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 25%, rgba(255,255,255,0.6) 60%, rgba(255,255,255,0) 100%)',
        'fade-right-neutral-50': 'linear-gradient(to left, rgba(250,250,250,1) 0%, rgba(250,250,250,0.95) 25%, rgba(250,250,250,0.6) 60%, rgba(250,250,250,0) 100%)',
        'fade-right-neutral-100': 'linear-gradient(to left, rgba(245,245,245,1) 0%, rgba(245,245,245,0.95) 25%, rgba(245,245,245,0.6) 60%, rgba(245,245,245,0) 100%)',
      },
      colors: {
        brand: {
          50: "rgb(239, 244, 251)",
          100: "rgb(219, 229, 245)",
          200: "rgb(184, 201, 234)",
          300: "rgb(150, 172, 222)",
          400: "rgb(113, 138, 208)",
          500: "rgb(79, 107, 196)",
          600: "rgb(60, 82, 169)",
          700: "rgb(50, 64, 134)",
          800: "rgb(45, 62, 128)",
          900: "rgb(39, 60, 119)",
        },
        neutral: {
          0: "rgb(255, 255, 255)",
          50: "rgb(249, 250, 251)",
          100: "rgb(243, 244, 246)",
          200: "rgb(229, 231, 235)",
          300: "rgb(209, 213, 219)",
          400: "rgb(156, 163, 175)",
          500: "rgb(107, 114, 128)",
          600: "rgb(75, 85, 99)",
          700: "rgb(55, 65, 81)",
          800: "rgb(31, 41, 55)",
          900: "rgb(17, 24, 39)",
          950: "rgb(3, 7, 18)",
        },
        error: {
          50: "rgb(254, 242, 242)",
          100: "rgb(254, 226, 226)",
          200: "rgb(254, 202, 202)",
          300: "rgb(252, 165, 165)",
          400: "rgb(248, 113, 113)",
          500: "rgb(239, 68, 68)",
          600: "rgb(220, 38, 38)",
          700: "rgb(185, 28, 28)",
          800: "rgb(153, 27, 27)",
          900: "rgb(127, 29, 29)",
        },
        warning: {
          50: "rgb(255, 251, 235)",
          100: "rgb(254, 243, 199)",
          200: "rgb(253, 230, 138)",
          300: "rgb(252, 211, 77)",
          400: "rgb(251, 191, 36)",
          500: "rgb(245, 158, 11)",
          600: "rgb(217, 119, 6)",
          700: "rgb(180, 83, 9)",
          800: "rgb(146, 64, 14)",
          900: "rgb(120, 53, 15)",
        },
        success: {
          50: "rgb(247, 254, 231)",
          100: "rgb(236, 252, 202)",
          200: "rgb(216, 249, 153)",
          300: "rgb(187, 244, 81)",
          400: "rgb(154, 230, 0)",
          500: "rgb(124, 207, 0)",
          600: "rgb(94, 165, 0)",
          700: "rgb(73, 125, 0)",
          800: "rgb(60, 99, 0)",
          900: "rgb(53, 83, 14)",
        },
        // Brand colors
        "brand-primary": "#3C52A9",
        "consort-blue": "#324086",
        "consort-red": "#CB0447",
        "consort-orange": "#FF4E46",
        "brand-border": "#EBF1FA",
        // Text colors

        "default-font": "#111827",
        "subtext-color": "#777e8d",
        // Background colors

        white: "#FFFFFF",
        "default-background": "#FFFFFF",
        // Neutral / border

        "neutral-border": "#E5E7EB",
        // Red scale

        "red-50": "#FEE1E6",
        "red-100": "#FEC3CF",
        "red-200": "#FD87A2",
        "red-400": "#FA0F56",
        "red-700": "#A5032E",
        "red-900": "#82031C",
        // Orange scale

        "orange-50": "#FFEFEB",
        "orange-100": "#FFE2DB",
        "orange-200": "#FFBEB3",
        "orange-700": "#F01C00",
        "orange-800": "#C71E00"
      },
      fontSize: {
        // ───── HERO ─────
        "hero-sm": [
          "2.125rem", // 34px
          {
            lineHeight: "2.375rem", // 38px
            fontWeight: "700",
            letterSpacing: "-0.030em",
          },
        ],
        "hero-md": [
          "3.125rem", // 50px
          {
            lineHeight: "3.375rem", // 54px
            fontWeight: "800",
            letterSpacing: "-0.0275em",
          },
        ],
        "hero": [
          "3.625rem", // 58px
          {
            lineHeight: "4.125rem", // 66px
            fontWeight: "800",
            letterSpacing: "-0.0325em",
          },
        ],

        // ───── HEADING 1 ─────
        "heading-1-sm": [
          "2rem", // 32px
          {
            lineHeight: "2.25rem",
            fontWeight: "700",
            letterSpacing: "-0.027em",
          },
        ],
        "heading-1-md": [
          "2.75rem", // 44px
          {
            lineHeight: "3.125rem",
            fontWeight: "700",
            letterSpacing: "-0.03em",
          },
        ],
        "heading-1": [
          "3.25rem", // 52px
          {
            lineHeight: "3.625rem",
            fontWeight: "700",
            letterSpacing: "-0.0325em",
          },
        ],

        // ───── HEADING 2 ─────
        "heading-2-sm": [
          "1.625rem", // 26px
          {
            lineHeight: "2rem",
            fontWeight: "700",
            letterSpacing: "-0.022em",
          },
        ],
        "heading-2-md": [
          "2.25rem", // 36px
          {
            lineHeight: "2.5rem",
            fontWeight: "700",
            letterSpacing: "-0.025em",
          },
        ],
        "heading-2": [
          "2.75rem", // 44px
          {
            lineHeight: "3.125rem",
            fontWeight: "700",
            letterSpacing: "-0.03em",
          },
        ],

        // ───── HEADING 3 ─────
        "heading-3-sm": [
          "1.5rem", // 22px
          {
            lineHeight: "1.75rem",
            fontWeight: "700",
            letterSpacing: "-0.015em",
          },
        ],
        "heading-3-md": [
          "1.875rem", // 30px
          {
            lineHeight: "2.125rem",
            fontWeight: "700",
            letterSpacing: "-0.02em",
          },
        ],
        "heading-3": [
          "2.25rem", // 36px
          {
            lineHeight: "2.5rem",
            fontWeight: "700",
            letterSpacing: "-0.025em",
          },
        ],

        // ───── HEADING 4 ─────
        "heading-4-sm": [
          "1.25rem", // 18px
          {
            lineHeight: "1.5rem",
            fontWeight: "800",
            letterSpacing: "-0.01em",
          },
        ],
        "heading-4-md": [
          "1.375rem", // 22px
          {
            lineHeight: "1.75rem",
            fontWeight: "800",
            letterSpacing: "-0.015em",
          },
        ],
        "heading-4": [
          "1.675rem", // 26px
          {
            lineHeight: "2rem",
            fontWeight: "800",
            letterSpacing: "-0.025em",
          },
        ],

        // ───── BODY XL ─────
        "body-xl-sm": [
          "1.125rem", // 18px
          {
            lineHeight: "1.625rem",
            fontWeight: "500",
            letterSpacing: "-0.005em",
          },
        ],
        "body-xl-md": [
          "1.25rem", // 20px
          {
            lineHeight: "1.75rem",
            fontWeight: "500",
            letterSpacing: "-0.0075em",
          },
        ],
        "body-xl": [
          "1.5rem", // 24px
          {
            lineHeight: "2rem",
            fontWeight: "500",
            letterSpacing: "-0.01em",
          },
        ],
        // ───── BODY ─────
        "body-mobile": [
          "0.875rem", // 14px
          {
            lineHeight: "1.375rem",
            fontWeight: "500",
            letterSpacing: "0em",
          },
        ],
        "body-md": [
          "0.95rem", // 15.2px
          {
            lineHeight: "1.5rem",
            fontWeight: "500",
            letterSpacing: "-0.0025em",
          },
        ],
        body: [
          "1rem", // 16px
          {
            lineHeight: "1.625rem", // 26px
            fontWeight: "500",
            letterSpacing: "-0.005em",
          },
        ],
        "body-lg": [
          "1.125rem", // 18px
          {
            lineHeight: "1.625rem", // 26px
            fontWeight: "500",
            letterSpacing: "-0.005em",
          },
        ],
        "body-lg-md": [
          "1.125rem", // 18px
          {
            lineHeight: "1.625rem", // 26px
            fontWeight: "500",
            letterSpacing: "-0.005em",
          },
        ],
        "body-lg-sm": [
          "1.125rem", // 18px
          {
            lineHeight: "1.625rem", // 26px
            fontWeight: "500",
            letterSpacing: "-0.005em",
          },
        ],

        // ───── BODY BOLD ─────
        "body-bold-mobile": [
          "0.875rem",
          {
            lineHeight: "1.375rem",
            fontWeight: "700",
            letterSpacing: "0em",
          },
        ],
        "body-bold-md": [
          "0.95rem",
          {
            lineHeight: "1.5rem",
            fontWeight: "700",
            letterSpacing: "-0.0025em",
          },
        ],
        "body-bold": [
          "1rem",
          {
            lineHeight: "1.625rem",
            fontWeight: "700",
            letterSpacing: "-0.005em",
          },
        ],

        // ───── BODY BLOG ─────
        "body-blog-mobile": [
          "1rem", // 16px
          {
            lineHeight: "1.5rem",
            fontWeight: "700",
            letterSpacing: "-0.01em",
          },
        ],
        "body-blog-md": [
          "1.05rem", // ~16.8px
          {
            lineHeight: "1.625rem",
            fontWeight: "700",
            letterSpacing: "-0.0125em",
          },
        ],
        "body-blog": [
          "1.125rem", // 18px
          {
            lineHeight: "1.5rem",
            fontWeight: "700",
            letterSpacing: "-0.02em",
          },
        ],

        // ───── BODY LOW HEIGHT ─────
        "body-low-height-mobile": [
          "0.875rem",
          {
            lineHeight: "1.125rem",
            fontWeight: "500",
            letterSpacing: "0em",
          },
        ],
        "body-low-height-md": [
          "0.95rem",
          {
            lineHeight: "1.25rem",
            fontWeight: "500",
            letterSpacing: "-0.0025em",
          },
        ],
        "body-low-height": [
          "1rem",
          {
            lineHeight: "1.25rem",
            fontWeight: "500",
            letterSpacing: "0em",
          },
        ],

        // ───── CAPTION ─────
        "caption-mobile": [
          "0.75rem", // 12px
          {
            lineHeight: "1.125rem",
            fontWeight: "500",
            letterSpacing: "0.01em",
          },
        ],
        "caption-md": [
          "0.8125rem", // 13px
          {
            lineHeight: "1.25rem",
            fontWeight: "500",
            letterSpacing: "0.005em",
          },
        ],
        caption: [
          "0.875rem", // 14px
          {
            lineHeight: "1.25rem",
            fontWeight: "500",
            letterSpacing: "0em",
          },
        ],

        // ───── CAPTION BOLD ─────
        "caption-bold-mobile": [
          "0.75rem",
          {
            lineHeight: "1.125rem",
            fontWeight: "700",
            letterSpacing: "0.01em",
          },
        ],
        "caption-bold-md": [
          "0.8125rem",
          {
            lineHeight: "1.25rem",
            fontWeight: "700",
            letterSpacing: "0.005em",
          },
        ],
        "caption-bold": [
          "0.875rem",
          {
            lineHeight: "1.25rem",
            fontWeight: "700",
            letterSpacing: "0em",
          },
        ],

      },



      fontFamily: {
        "caption": ["var(--font-manrope)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        "caption-bold": ["var(--font-manrope)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        "body": ["var(--font-manrope)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        "body-bold": ["var(--font-manrope)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        "heading-3": ["var(--font-manrope)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        "heading-2": ["var(--font-manrope)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        "heading-1": ["var(--font-manrope)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        "hero-md": ["var(--font-manrope)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        "hero": ["var(--font-manrope)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        "hero-sm": ["var(--font-manrope)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        "monospace-body": ["var(--font-manrope)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        "heading-4": ["var(--font-manrope)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        "body-xl": ["var(--font-manrope)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        "body-xl-bold": ["var(--font-manrope)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        "body-lg": ["var(--font-manrope)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        "body-blog": ["var(--font-manrope)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        "body-lg-bold": ["var(--font-manrope)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        "body-low-height": ["var(--font-manrope)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        "inter": ["var(--font-inter)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        "manrope": ["var(--font-manrope)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        "sora": ["Sora", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        "onest": ["Onest", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        // Add default sans-serif with proper fallbacks
        "sans": ["var(--font-manrope)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0, 0, 0, 0.04)', // soft shadow for inputs/cards
        DEFAULT: '0 1px 3px rgba(0, 0, 0, 0.06)', // general-purpose shadow
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04)', // card-level elevation
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.04)', // modals, elevated containers
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', // overlays
        overlay: '0 12px 20px rgba(0, 0, 0, 0.08)', // specific for dropdowns/popovers
        a1: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0px 8px 32px -4px rgba(0, 0, 0, 0.08), 0px 4px 8px -4px rgba(0, 0, 0, 0.11)', //custom shadow carousel
        none: 'none',
      },
      borderRadius: {
        sm: "8px",
        md: "16px",
        DEFAULT: "12px",
        lg: "20px",
        full: "9999px",
        "rounded-card": "36px",
      },
      container: {
        padding: {
          DEFAULT: "16px",
          sm: "calc((100vw + 16px - 640px) / 2)",
          md: "calc((100vw + 16px - 768px) / 2)",
          lg: "calc((100vw + 16px - 1024px) / 2)",
          xl: "calc((100vw + 16px - 1280px) / 2)",
          "2xl": "calc((100vw + 16px - 1536px) / 2)",
        },
      },
      spacing: {
        112: "28rem",
        144: "36rem",
        192: "48rem",
        256: "64rem",
        320: "80rem",
      },
      screens: {
        mobile: {
          max: "767px",
        },
      },
    },
  },
};
