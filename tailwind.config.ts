import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Design tokens for the Actuate storefront.
        // Deep graphite base with a violet + cyan dual-accent system,
        // referencing RGB peripheral lighting without being a cliché single-accent dark theme.
        base: {
          DEFAULT: "#0B0E14",
          panel: "#12161C",
          raised: "#171C24",
          border: "#232937",
        },
        ink: {
          DEFAULT: "#E8EAF0",
          muted: "#9096A8",
          faint: "#5C6377",
        },
        accent: {
          violet: "#7C5CFC",
          "violet-dim": "#5B41C4",
          cyan: "#3DF2C4",
          "cyan-dim": "#2AB596",
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      backgroundImage: {
        "actuate-glow": "linear-gradient(135deg, #7C5CFC 0%, #3DF2C4 100%)",
      },
      borderRadius: {
        keycap: "10px",
      },
      boxShadow: {
        keycap: "inset 0 1px 0 0 rgba(255,255,255,0.04), 0 1px 2px 0 rgba(0,0,0,0.4)",
        "keycap-glow": "0 0 0 1px rgba(124,92,252,0.4), 0 0 24px -4px rgba(124,92,252,0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
