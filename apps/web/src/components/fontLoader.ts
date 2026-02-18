// src/components/fontLoader.ts
// Client-side QCF v2 font loader. Loads page-specific fonts from the Quran CDN.

const loaded = new Set<number>();

const QCF_V2_CDN_BASE =
  "https://verses.quran.foundation/fonts/quran/hafs/v2/woff2";

export function ensureQcfFontLoaded(page: number) {
  if (typeof document === "undefined") return;
  if (loaded.has(page)) return;

  const family = `p${page}-v2`;
  const url = `${QCF_V2_CDN_BASE}/p${page}.woff2`;

  const styleId = `qcf2-font-${page}`;
  if (document.getElementById(styleId)) {
    loaded.add(page);
    return;
  }

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
@font-face {
  font-family: "${family}";
  src: url("${url}") format("woff2");
  font-display: swap;
}
`;
  document.head.appendChild(style);
  loaded.add(page);
}
