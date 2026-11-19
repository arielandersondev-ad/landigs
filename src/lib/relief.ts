/**
 * Genera una textura de relieve (tinte hipsométrico + sombreado) a partir de
 * ruido fractal SVG y la rasteriza una sola vez, para que desplazar y hacer
 * zoom sobre el mapa no vuelva a calcular filtros costosos en cada frame.
 */

type ReliefOptions = {
  key: string;
  width: number;
  height: number;
  /** Contenido SVG en escala de grises que define la tendencia de altura (blanco = alto). */
  heightField: string;
  seed: number;
  frequency: number;
  relief: number;
  /** Colores de bajo a alto. */
  ramp: string[];
  noiseWeight?: number;
  /** Margen extra alrededor del mundo para que el borde de la textura nunca se vea. */
  pad?: number;
};

const cache = new Map<string, Promise<string>>();

const channel = (ramp: string[], offset: number) =>
  ramp.map((hex) => (parseInt(hex.slice(1 + offset, 3 + offset), 16) / 255).toFixed(3)).join(" ");

function buildSvg(o: ReliefOptions, scale: number) {
  const nw = o.noiseWeight ?? 0.45;
  const pad = o.pad ?? 0;
  const tw = o.width + pad * 2;
  const th = o.height + pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(tw * scale)}" height="${Math.round(
    th * scale,
  )}" viewBox="${-pad} ${-pad} ${tw} ${th}">
  <defs>
    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${
      Math.max(o.width, o.height) / 28
    }"/></filter>
    <filter id="terrain" filterUnits="userSpaceOnUse" x="${-pad}" y="${-pad}" width="${tw}" height="${th}" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="${o.frequency}" numOctaves="6" seed="${o.seed}" result="raw"/>
      <feColorMatrix in="raw" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" result="noise"/>
      <feComposite in="SourceGraphic" in2="noise" operator="arithmetic" k2="${1 - nw + 0.1}" k3="${nw}" k4="-0.12" result="h"/>
      <feColorMatrix in="h" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  1 0 0 0 0" result="height"/>
      <feComponentTransfer in="height" result="tint">
        <feFuncR type="table" tableValues="${channel(o.ramp, 0)}"/>
        <feFuncG type="table" tableValues="${channel(o.ramp, 2)}"/>
        <feFuncB type="table" tableValues="${channel(o.ramp, 4)}"/>
        <feFuncA type="linear" slope="0" intercept="1"/>
      </feComponentTransfer>
      <feDiffuseLighting in="height" surfaceScale="${o.relief}" diffuseConstant="1.05" lighting-color="#fff7ea" result="light">
        <feDistantLight azimuth="315" elevation="42"/>
      </feDiffuseLighting>
      <feComposite in="tint" in2="light" operator="arithmetic" k1="1.12" k2="0.04"/>
    </filter>
  </defs>
  <g filter="url(#terrain)">
    <rect x="${-pad}" y="${-pad}" width="${tw}" height="${th}" fill="#808080"/>
    <g filter="url(#blur)">${o.heightField}</g>
  </g>
</svg>`;
}

async function rasterize(o: ReliefOptions): Promise<string> {
  const pad = o.pad ?? 0;
  const scale = Math.min(1.25, 2600 / Math.max(o.width + pad * 2, o.height + pad * 2));
  const svg = buildSvg(o, scale);
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  try {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || Math.round((o.width + pad * 2) * scale);
    canvas.height = img.naturalHeight || Math.round((o.height + pad * 2) * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.88));
    return blob ? URL.createObjectURL(blob) : dataUrl;
  } catch {
    return dataUrl;
  }
}

export function getRelief(o: ReliefOptions) {
  let p = cache.get(o.key);
  if (!p) {
    p = rasterize(o);
    cache.set(o.key, p);
  }
  return p;
}

/** Rampa cálida: valle terracota → altiplano arena → cerros ocre → nieve. */
export const warmRamp = ["#b8774a", "#d6a874", "#e8d0a2", "#e4c58f", "#cf9f68", "#ad7d52", "#f5efe6"];
/** Rampa suave para planos de detalle (poca variación). */
export const softRamp = ["#dcc49a", "#e6d3ae", "#eddfc0", "#e9d7b3", "#e0c99f"];
