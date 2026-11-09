function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return [r, g, b];
}

function channelLuminance(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

export function contrastRatio(hexA: string, hexB: string): number {
  const lumA = relativeLuminance(hexA);
  const lumB = relativeLuminance(hexB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

export const tokens = {
  light: {
    bg: "#EAE3D6",
    surface: "#F1EBE0",
    band: "#E1D9C7",
    text: "#1A1712",
    muted: "#514C42",
    accent: "#44691F",
    accentHover: "#33500F",
    accentSubtle: "#DBE4CA",
    onAccent: "#F4F0E6",
    border: "#D3CEBB",
    borderStrong: "#7D7764",
  },
  dark: {
    bg: "#14150F",
    surface: "#1D1F16",
    band: "#191B13",
    text: "#EAE5D8",
    muted: "#A8A292",
    accent: "#9CC47A",
    accentHover: "#B6DA95",
    accentSubtle: "#25301B",
    onAccent: "#14150F",
    border: "#363A2B",
    borderStrong: "#6E7459",
  },
} as const;
