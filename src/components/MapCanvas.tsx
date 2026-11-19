"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { getRelief } from "@/lib/relief";

type Box = { x: number; y: number; w: number; h: number };
export type Focus = { cx: number; cy: number; w: number } | null;

type Props = {
  label: string;
  worldW: number;
  worldH: number;
  centerX?: number;
  centerY?: number;
  /** Cuánto puede recortarse el mundo para llenar la pantalla (1 = encajar completo). */
  maxCrop?: number;
  focus?: Focus;
  onBackground?: () => void;
  children: ReactNode;
};

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function useRelief(options: Parameters<typeof getRelief>[0]) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    getRelief(options).then((u) => {
      if (alive) setUrl(u);
    });
    return () => {
      alive = false;
    };
  }, [options]);
  return url;
}

export function MapCanvas({
  label,
  worldW,
  worldH,
  centerX = worldW / 2,
  centerY = worldH / 2,
  maxCrop = 1.35,
  focus = null,
  onBackground,
  children,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const vb = useRef<Box>({ x: 0, y: 0, w: worldW, h: worldH });
  const size = useRef({ w: 0, h: 0 });
  const frame = useRef<number | null>(null);
  const focusRef = useRef<Focus>(focus);
  const gesture = useRef({
    moved: false,
    pointers: new Map<number, { x: number; y: number }>(),
    start: { x: 0, y: 0 },
    pinch: 0,
  });

  const apply = useCallback(() => {
    const b = vb.current;
    const svg = svgRef.current;
    if (!svg) return;
    svg.setAttribute("viewBox", `${b.x} ${b.y} ${b.w} ${b.h}`);
    // Unidades del mapa por píxel: permite que marcadores y etiquetas mantengan tamaño fijo.
    svg.style.setProperty("--k", String(b.w / Math.max(size.current.w, 1)));
  }, []);

  const clamp = useCallback(
    (b: Box): Box => {
      const w = Math.min(Math.max(b.w, worldW * 0.08), worldW * 1.6);
      const h = (w * size.current.h) / Math.max(size.current.w, 1);
      return {
        w,
        h,
        x: Math.min(Math.max(b.x, -w * 0.45), worldW - w * 0.55),
        y: Math.min(Math.max(b.y, -h * 0.45), worldH - h * 0.55),
      };
    },
    [worldW, worldH],
  );

  const fitBox = useCallback((): Box => {
    const { w, h } = size.current;
    const cover = Math.max(w / worldW, h / worldH);
    const contain = Math.min(w / worldW, h / worldH);
    const s = Math.min(cover, contain * maxCrop);
    const bw = w / s;
    const bh = h / s;
    return { x: centerX - bw / 2, y: centerY - bh / 2, w: bw, h: bh };
  }, [worldW, worldH, centerX, centerY, maxCrop]);

  const focusBox = useCallback((f: NonNullable<Focus>): Box => {
    const { w, h } = size.current;
    const desktop = w >= 900;
    const bw = desktop ? f.w : f.w * 0.75;
    const bh = (bw * h) / w;
    const fx = desktop ? 1 / 3 : 0.5;
    const fy = desktop ? 0.5 : 0.26;
    return { x: f.cx - bw * fx, y: f.cy - bh * fy, w: bw, h: bh };
  }, []);

  const stop = () => {
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = null;
  };

  const animateTo = useCallback(
    (target: Box, ms = 850) => {
      stop();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        vb.current = target;
        apply();
        return;
      }
      const from = { ...vb.current };
      const t0 = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / ms);
        const k = ease(t);
        vb.current = {
          x: from.x + (target.x - from.x) * k,
          y: from.y + (target.y - from.y) * k,
          w: from.w + (target.w - from.w) * k,
          h: from.h + (target.h - from.h) * k,
        };
        apply();
        frame.current = t < 1 ? requestAnimationFrame(step) : null;
      };
      frame.current = requestAnimationFrame(step);
    },
    [apply],
  );

  // Tamaño del contenedor: mantiene el aspecto del viewBox igual al de la pantalla.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const first = size.current.w === 0;
      size.current = { w: entry.contentRect.width, h: entry.contentRect.height };
      if (!first && frame.current) return;
      vb.current = focusRef.current ? focusBox(focusRef.current) : fitBox();
      apply();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [apply, fitBox, focusBox]);

  // Zoom al terreno seleccionado o regreso a la vista general.
  const fx = focus?.cx;
  const fy = focus?.cy;
  const fw = focus?.w;
  useEffect(() => {
    focusRef.current = fx === undefined ? null : { cx: fx, cy: fy as number, w: fw as number };
    if (size.current.w === 0) return;
    animateTo(focusRef.current ? focusBox(focusRef.current) : fitBox());
  }, [fx, fy, fw, animateTo, fitBox, focusBox]);

  const zoomAt = useCallback(
    (factor: number, clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return;
      stop();
      const rect = svg.getBoundingClientRect();
      const b = vb.current;
      const px = b.x + ((clientX - rect.left) / rect.width) * b.w;
      const py = b.y + ((clientY - rect.top) / rect.height) * b.h;
      const w = b.w * factor;
      const k = w / b.w;
      vb.current = clamp({ x: px - (px - b.x) * k, y: py - (py - b.y) * k, w, h: b.h * k });
      apply();
    },
    [apply, clamp],
  );

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomAt(Math.exp(e.deltaY * 0.0015), e.clientX, e.clientY);
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    const g = gesture.current;
    g.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (g.pointers.size === 1) {
      g.moved = false;
      g.start = { x: e.clientX, y: e.clientY };
    }
    if (g.pointers.size === 2) {
      const [a, b] = [...g.pointers.values()];
      g.pinch = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const g = gesture.current;
    const prev = g.pointers.get(e.pointerId);
    if (!prev) return;
    const svg = svgRef.current as SVGSVGElement;
    if (!g.moved && Math.hypot(e.clientX - g.start.x, e.clientY - g.start.y) > 5) {
      g.moved = true;
      svg.setPointerCapture(e.pointerId);
      stop();
    }
    g.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (!g.moved) return;

    if (g.pointers.size === 2) {
      const [a, b] = [...g.pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (g.pinch > 0) zoomAt(g.pinch / dist, (a.x + b.x) / 2, (a.y + b.y) / 2);
      g.pinch = dist;
      return;
    }
    const rect = svg.getBoundingClientRect();
    const v = vb.current;
    vb.current = clamp({
      ...v,
      x: v.x - ((e.clientX - prev.x) / rect.width) * v.w,
      y: v.y - ((e.clientY - prev.y) / rect.height) * v.h,
    });
    apply();
  };

  const endPointer = (e: PointerEvent<SVGSVGElement>) => {
    const g = gesture.current;
    g.pointers.delete(e.pointerId);
    if (g.pointers.size < 2) g.pinch = 0;
    // `moved` se limpia tras el click para que un arrastre no seleccione un lote.
    if (g.pointers.size === 0) window.setTimeout(() => (g.moved = false), 0);
  };

  const zoomButton = (factor: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width * (focus && rect.width >= 900 ? 1 / 3 : 0.5);
    zoomAt(factor, cx, rect.top + rect.height / 2);
  };

  return (
    <div ref={wrapRef} className="map-canvas">
      <svg
        ref={svgRef}
        className="map-canvas__svg"
        viewBox={`0 0 ${worldW} ${worldH}`}
        role="group"
        aria-label={label}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onClickCapture={(e) => {
          if (gesture.current.moved) {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
      >
        <rect
          x={-worldW}
          y={-worldH}
          width={worldW * 3}
          height={worldH * 3}
          fill="var(--terrain-base)"
          onClick={onBackground}
        />
        {children}
      </svg>
      <div className="zoom glass" role="group" aria-label="Zoom del mapa">
        <button type="button" onClick={() => zoomButton(0.7)} aria-label="Acercar">
          +
        </button>
        <button type="button" onClick={() => zoomButton(1.4)} aria-label="Alejar">
          −
        </button>
        <button
          type="button"
          onClick={() => animateTo(focusRef.current ? focusBox(focusRef.current) : fitBox())}
          aria-label="Restablecer vista"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
