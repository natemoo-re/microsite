import { Config } from "@stylo/core";

const theme = {
  space: {
    "2xs": "base / 4",
    xs: "base / 2",
    base: 8,
    sm: "base * 1",
    md: "base * 2",
    lg: "base * 4",
    xl: "base * 6",
    "2xl": "base * 8",
    "3xl": "base * 12",
    "4xl": "base * 16",
  },
  sizes: {
    full: "100%",
  },
  widths: {
    screen: "100vw",
  },
  heights: {
    screen: "100vh",
  },
  colors: {
    pink: "#FF998B",
    mint: "#56E8A2",
    gray: {
      1: "#333",
      2: "#4F4F4F",
      3: "#828282",
      4: "#BDBDBD",
      5: "#E0E0E0",
      6: "#F2F2F2",
      7: "#FCFCFC",
    },
  },
  shadows: {
    xs: "0 0 0 1px rgb(black / 0.05)",
    sm: "0 1px 2px 0 rgb(black / 0.05)",
    default: "0 1px 3px 0 rgb(black / 0.1), 0 1px 2px 0 rgb(black / 0.06)",
    md: "0 4px 6px -1px rgb(black / 0.1), 0 2px 4px -1px rgb(black / 0.06)",
    lg: "0 10px 15px -3px rgb(black / 0.1), 0 4px 6px -2px rgb(black / 0.05)",
    xl: "0 20px 25px -5px rgb(black / 0.1), 0 10px 10px -5px rgb(black / 0.04)",
    "2xl": "0 25px 50px -12px rgb(black / 0.25)",
  },
  fonts: {
    fallback: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif`,
    headline: `degular-display, 'Degular Display', fallback`,
    body: `degular, Degular, fallback`,
    code: `zeitung-mono, 'Zeitung Mono Pro', 'Courier New', Courier, monospace`,
  },
  fontWeights: {
    normal: 400,
    medium: 500,
  },
  radii: {
    sm: 4,
    md: 8,
    lg: 16,
    full: 9999,
  },
  durations: {
    fast: "120ms",
    medium: "200ms",
    slow: "300ms",
  },
  easings: {
    out: "cubic-bezier(0.165, 0.84, 0.44, 1)",
  },
  media: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
};

export const config: Config = {
  prefix: "microsite",
  theme,
};
