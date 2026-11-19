export type LotStatus = "disponible" | "reservado" | "vendido";

export type Rect = { x: number; y: number; w: number; h: number };

export type Lot = Rect & {
  id: string;
  code: string;
  block: string;
  front: number;
  depth: number;
  area: number;
  pricePerM2: number;
  price: number;
  status: LotStatus;
  corner: boolean;
  facing: string;
  neighbors: { frente: string; fondo: string; izquierda: string; derecha: string };
  /** Centro del lote en coordenadas del mundo (ya rotado). */
  cx: number;
  cy: number;
  utm: { e: number; n: number };
};

export type Street = Rect & { name: string; horizontal: boolean; avenue: boolean };

export type PlaceMap = {
  world: { w: number; h: number };
  angle: number;
  origin: { x: number; y: number };
  frame: Rect;
  streets: Street[];
  greens: (Rect & { trees: { x: number; y: number; r: number }[] })[];
  equipment: Rect[];
  blocks: (Rect & { label: string })[];
  lots: Lot[];
  stream: string;
};

export type Place = {
  id: string;
  name: string;
  municipality: string;
  summary: string;
  altitude: number;
  distanceKm: number;
  pricePerM2: number;
  services: string[];
  region: { x: number; y: number };
  utmBase: { e: number; n: number };
  layout: { cols: number; rows: number; angle: number; green: number[]; equipment: number[]; seed: number };
  avenue: string;
};

export const places: Place[] = [
  {
    id: "callutaca",
    name: "Callutaca",
    municipality: "El Alto · carretera a Laja",
    summary: "Loteo plano con vista a la cordillera, a 10 minutos de la carretera a Laja.",
    altitude: 3950,
    distanceKm: 9,
    pricePerM2: 42,
    services: ["Agua potable", "Energía eléctrica", "Calles abiertas"],
    region: { x: 700, y: 520 },
    utmBase: { e: 578420, n: 8174310 },
    layout: { cols: 4, rows: 3, angle: -12, green: [5], equipment: [10], seed: 11 },
    avenue: "Av. Callutaca",
  },
  {
    id: "achocalla",
    name: "Achocalla",
    municipality: "Municipio de Achocalla",
    summary: "Clima templado junto a las lagunas. Terrenos aptos para vivienda con huerto.",
    altitude: 3800,
    distanceKm: 14,
    pricePerM2: 68,
    services: ["Agua potable", "Energía eléctrica", "Alcantarillado"],
    region: { x: 860, y: 640 },
    utmBase: { e: 588960, n: 8168740 },
    layout: { cols: 3, rows: 3, angle: 16, green: [4], equipment: [], seed: 23 },
    avenue: "Av. Los Lagos",
  },
  {
    id: "mecapaca",
    name: "Mecapaca",
    municipality: "Municipio de Mecapaca",
    summary: "Valle cálido a orillas del río. Lotes amplios para casa de campo.",
    altitude: 2850,
    distanceKm: 32,
    pricePerM2: 85,
    services: ["Agua de riego", "Energía eléctrica", "Calles ripiadas"],
    region: { x: 1050, y: 790 },
    utmBase: { e: 604150, n: 8162020 },
    layout: { cols: 3, rows: 2, angle: -24, green: [2], equipment: [], seed: 5 },
    avenue: "Camino a Mecapaca",
  },
  {
    id: "viacha",
    name: "Viacha",
    municipality: "Municipio de Viacha",
    summary: "Zona en crecimiento junto a la avenida ferroviaria. El mejor precio por metro.",
    altitude: 3850,
    distanceKm: 22,
    pricePerM2: 36,
    services: ["Energía eléctrica", "Calles abiertas"],
    region: { x: 600, y: 680 },
    utmBase: { e: 571880, n: 8163990 },
    layout: { cols: 4, rows: 3, angle: 6, green: [1, 10], equipment: [6], seed: 41 },
    avenue: "Av. Ferroviaria",
  },
  {
    id: "pucarani",
    name: "Pucarani",
    municipality: "Municipio de Pucarani",
    summary: "Camino al lago Titicaca. Terrenos de inversión con planimetría aprobada.",
    altitude: 3870,
    distanceKm: 38,
    pricePerM2: 28,
    services: ["Energía eléctrica", "Planimetría aprobada"],
    region: { x: 560, y: 285 },
    utmBase: { e: 566310, n: 8189470 },
    layout: { cols: 3, rows: 3, angle: -4, green: [4], equipment: [], seed: 17 },
    avenue: "Ruta 2",
  },
  {
    id: "laja",
    name: "Laja",
    municipality: "Municipio de Laja",
    summary: "Pueblo histórico del altiplano. Lotes frente a la plaza nueva.",
    altitude: 3880,
    distanceKm: 33,
    pricePerM2: 32,
    services: ["Agua potable", "Energía eléctrica"],
    region: { x: 470, y: 440 },
    utmBase: { e: 559740, n: 8176630 },
    layout: { cols: 4, rows: 2, angle: 28, green: [3], equipment: [], seed: 29 },
    avenue: "Av. Fundación",
  },
];

export const services = [
  { name: "Catastro", text: "Registro y actualización catastral ante el gobierno municipal." },
  { name: "Planos georreferenciados", text: "Coordenadas UTM WGS-84 con GPS diferencial y estación total." },
  { name: "Levantamiento topográfico", text: "Curvas de nivel, perfiles y cálculo de volúmenes." },
  { name: "Saneamiento legal", text: "Folio real, trámites en Derechos Reales y sucesiones." },
  { name: "Planimetrías y loteos", text: "Diseño y aprobación de urbanizaciones y divisiones." },
  { name: "Avalúos comerciales", text: "Valuación de terrenos para venta, crédito o herencia." },
];

export const statusLabel: Record<LotStatus, string> = {
  disponible: "Disponible",
  reservado: "Reservado",
  vendido: "Vendido",
};

export const formatNumber = (value: number, decimals = 0) => {
  const [int, dec] = value.toFixed(decimals).split(".");
  const withDots = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return dec ? `${withDots},${dec}` : withDots;
};

export const formatUsd = (value: number) => `USD ${formatNumber(value)}`;

/* ---------- Generador de planos demostrativos ---------- */

/** Unidades de dibujo por metro. */
export const UNIT = 4;
const BLOCK_L = 96 * UNIT;
const BLOCK_D = 56 * UNIT;
const STREET = 12 * UNIT;
const AVENUE = 20 * UNIT;
const MARGIN = 300;

const hNames = ["Calle Illampu", "Calle Sajama", "Calle Huayna Potosí", "Calle Mururata", "Calle Chacaltaya"];
const vNames = ["Calle Tunari", "Pasaje Cóndor", "Calle Wiphala", "Pasaje Kantuta", "Calle Totora"];
const compass = ["Norte", "Noreste", "Este", "Sureste", "Sur", "Suroeste", "Oeste", "Noroeste"];

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const bearing = (deg: number) => compass[Math.round((((deg % 360) + 360) % 360) / 45) % 8];

const cache = new Map<string, PlaceMap>();

export function getPlaceMap(place: Place): PlaceMap {
  const hit = cache.get(place.id);
  if (hit) return hit;

  const { cols, rows, angle, green, equipment, seed } = place.layout;
  const rand = rng(seed);
  const avenueRow = Math.max(0, Math.floor(rows / 2) - 1);

  const hGap = (k: number) => (k === avenueRow && rows > 1 ? AVENUE : STREET);
  const gridW = cols * BLOCK_L + (cols - 1) * STREET;
  const gridH = rows * BLOCK_D + Array.from({ length: rows - 1 }, (_, k) => hGap(k)).reduce((a, b) => a + b, 0);
  const frameW = gridW + 2 * STREET;
  const frameH = gridH + 2 * STREET;
  const world = { w: frameW + 2 * MARGIN, h: frameH + 2 * MARGIN };
  const origin = { x: world.w / 2, y: world.h / 2 };
  const x0 = MARGIN + STREET;
  const y0 = MARGIN + STREET;

  const rowY: number[] = [];
  let acc = y0;
  for (let r = 0; r < rows; r++) {
    rowY.push(acc);
    acc += BLOCK_D + (r < rows - 1 ? hGap(r) : 0);
  }
  const colX = Array.from({ length: cols }, (_, c) => x0 + c * (BLOCK_L + STREET));

  const hStreetName = (j: number) => (j - 1 === avenueRow && rows > 1 ? place.avenue : hNames[j % hNames.length]);
  const vStreetName = (j: number) => vNames[(j + seed) % vNames.length];

  const streets: Street[] = [];
  for (let j = 0; j <= rows; j++) {
    const y = j === 0 ? y0 - STREET : j === rows ? rowY[rows - 1] + BLOCK_D : rowY[j - 1] + BLOCK_D;
    const h = j === 0 || j === rows ? STREET : hGap(j - 1);
    streets.push({ x: x0 - STREET, y, w: frameW, h, name: hStreetName(j), horizontal: true, avenue: h === AVENUE });
  }
  for (let j = 0; j <= cols; j++) {
    const x = j === 0 ? x0 - STREET : colX[j - 1] + BLOCK_L;
    streets.push({ x, y: y0 - STREET, w: STREET, h: frameH, name: vStreetName(j), horizontal: false, avenue: false });
  }

  const rad = (angle * Math.PI) / 180;
  const rotate = (x: number, y: number) => ({
    x: origin.x + (x - origin.x) * Math.cos(rad) - (y - origin.y) * Math.sin(rad),
    y: origin.y + (x - origin.x) * Math.sin(rad) + (y - origin.y) * Math.cos(rad),
  });

  const greens: PlaceMap["greens"] = [];
  const equip: Rect[] = [];
  const blocks: PlaceMap["blocks"] = [];
  const lots: Lot[] = [];
  let letter = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const bx = colX[c];
      const by = rowY[r];
      if (green.includes(idx)) {
        const trees = Array.from({ length: 26 }, () => ({
          x: bx + 20 + rand() * (BLOCK_L - 40),
          y: by + 20 + rand() * (BLOCK_D - 40),
          r: 7 + rand() * 9,
        }));
        greens.push({ x: bx, y: by, w: BLOCK_L, h: BLOCK_D, trees });
        continue;
      }
      if (equipment.includes(idx)) {
        equip.push({ x: bx, y: by, w: BLOCK_L, h: BLOCK_D });
        continue;
      }
      const label = String.fromCharCode(65 + letter++);
      blocks.push({ x: bx, y: by, w: BLOCK_L, h: BLOCK_D, label });
      const n = 8 + Math.floor(rand() * 3);
      const lw = BLOCK_L / n;
      const lh = BLOCK_D / 2;
      const front = 96 / n;
      const depth = 28;
      for (let row = 0; row < 2; row++) {
        for (let i = 0; i < n; i++) {
          const roll = rand();
          const status: LotStatus = roll < 0.56 ? "disponible" : roll < 0.72 ? "reservado" : "vendido";
          const corner = i === 0 || i === n - 1;
          const pricePerM2 = Math.round(place.pricePerM2 * (corner ? 1.08 : 1));
          const area = front * depth;
          const num = row * n + i + 1;
          const code = `${label}-${String(num).padStart(2, "0")}`;
          const lx = bx + i * lw;
          const ly = by + row * lh;
          const center = rotate(lx + lw / 2, ly + lh / 2);
          const sideCode = (k: number) => `Lote ${label}-${String(row * n + k + 1).padStart(2, "0")}`;
          lots.push({
            id: `${place.id}:${code}`,
            code,
            block: label,
            x: lx,
            y: ly,
            w: lw,
            h: lh,
            front,
            depth,
            area,
            pricePerM2,
            price: Math.round((area * pricePerM2) / 50) * 50,
            status,
            corner,
            facing: bearing(row === 0 ? angle : 180 + angle),
            neighbors: {
              frente: row === 0 ? hStreetName(r) : hStreetName(r + 1),
              fondo: `Lote ${label}-${String((1 - row) * n + i + 1).padStart(2, "0")}`,
              izquierda: i === 0 ? vStreetName(c) : sideCode(i - 1),
              derecha: i === n - 1 ? vStreetName(c + 1) : sideCode(i + 1),
            },
            cx: center.x,
            cy: center.y,
            utm: {
              e: Math.round(place.utmBase.e + (center.x - origin.x) / UNIT),
              n: Math.round(place.utmBase.n - (center.y - origin.y) / UNIT),
            },
          });
        }
      }
    }
  }

  const sx = x0 - STREET - 220;
  const ex = x0 + gridW + STREET + 220;
  const sy = y0 + gridH + STREET + 120;
  const stream = `M${sx} ${sy} C ${sx + 300} ${sy + 90}, ${(sx + ex) / 2 - 200} ${sy - 40}, ${(sx + ex) / 2} ${sy + 50} S ${ex - 160} ${sy + 160}, ${ex} ${sy + 60}`;

  const map: PlaceMap = {
    world,
    angle,
    origin,
    frame: { x: x0 - STREET, y: y0 - STREET, w: frameW, h: frameH },
    streets,
    greens,
    equipment: equip,
    blocks,
    lots,
    stream,
  };
  cache.set(place.id, map);
  return map;
}

export function countByStatus(lots: Lot[]) {
  return lots.reduce<Record<LotStatus, number>>(
    (acc, l) => {
      acc[l.status] += 1;
      return acc;
    },
    { disponible: 0, reservado: 0, vendido: 0 },
  );
}
