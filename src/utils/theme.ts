import type { ColorSchemeName } from "react-native";

export function palette(scheme: ColorSchemeName) {
  const dark = scheme === "dark";
  return {
    background: dark ? "#111315" : "#F6F7F9",
    surface: dark ? "#1C2024" : "#FFFFFF",
    surfaceAlt: dark ? "#252A30" : "#ECEFF3",
    text: dark ? "#F4F6F8" : "#17202A",
    muted: dark ? "#9EA7B3" : "#687382",
    border: dark ? "#303741" : "#DDE2E8",
    tint: dark ? "#7DD3C7" : "#177E73",
    accent: dark ? "#F5C16C" : "#B86E00",
    danger: dark ? "#FF8A8A" : "#B42318",
    success: dark ? "#8EE6A8" : "#18794E",
    warning: dark ? "#FFD27D" : "#9A6700"
  };
}

export const categoryColors = [
  "#177E73",
  "#D97706",
  "#4169E1",
  "#C2410C",
  "#7C3AED",
  "#0E7490",
  "#BE185D",
  "#4D7C0F",
  "#9333EA",
  "#64748B"
];
