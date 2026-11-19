"use client";

import type { KeyboardEvent } from "react";
import { getPlaceMap, statusLabel, type Lot, type Place } from "@/lib/places";
import { softRamp } from "@/lib/relief";
import { MapCanvas, useRelief, type Focus } from "./MapCanvas";

const reliefCache = new Map<string, Parameters<typeof useRelief>[0]>();

/** Opciones estables por zona: la textura se genera una sola vez por lugar. */
function reliefFor(place: Place) {
  let o = reliefCache.get(place.id);
  if (!o) {
    const { world } = getPlaceMap(place);
    o = {
      key: `place-${place.id}`,
      width: world.w,
      height: world.h,
      seed: place.layout.seed,
      frequency: 0.0026,
      relief: 5,
      ramp: softRamp,
      noiseWeight: 0.6,
      heightField: "",
      pad: 600,
    };
    reliefCache.set(place.id, o);
  }
  return o;
}

type Props = {
  place: Place;
  selectedId: string | null;
  onSelectLot: (lot: Lot) => void;
  onClear: () => void;
};

export function PlaceMap({ place, selectedId, onSelectLot, onClear }: Props) {
  const map = getPlaceMap(place);
  const { world, origin, angle } = map;

  const relief = useRelief(reliefFor(place));

  const selected = map.lots.find((l) => l.id === selectedId) ?? null;
  const focus: Focus = selected ? { cx: selected.cx, cy: selected.cy, w: 1100 } : null;

  const onKey = (e: KeyboardEvent, lot: Lot) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelectLot(lot);
    }
  };

  const rotate = `rotate(${angle} ${origin.x} ${origin.y})`;

  return (
    <MapCanvas
      label={`Plano demostrativo de ${place.name}`}
      worldW={world.w}
      worldH={world.h}
      maxCrop={2.8}
      focus={focus}
      onBackground={onClear}
    >
      {relief && (
        <image
          href={relief}
          x={-600}
          y={-600}
          width={world.w + 1200}
          height={world.h + 1200}
          preserveAspectRatio="none"
          className="fade-in"
          pointerEvents="none"
        />
      )}

      <path d={map.stream} className="plan__stream" pointerEvents="none" />
      <path d={map.stream} className="plan__stream-core" pointerEvents="none" />

      <g transform={rotate}>
        <rect
          x={map.frame.x - 10}
          y={map.frame.y - 10}
          width={map.frame.w + 20}
          height={map.frame.h + 20}
          className="plan__frame"
          pointerEvents="none"
        />
        {map.streets.map((s) => (
          <g key={`${s.name}-${s.x}-${s.y}`} pointerEvents="none">
            <rect x={s.x} y={s.y} width={s.w} height={s.h} className={s.avenue ? "plan__avenue" : "plan__street"} />
            {s.avenue && (
              <line x1={s.x} y1={s.y + s.h / 2} x2={s.x + s.w} y2={s.y + s.h / 2} className="plan__avenue-line" />
            )}
          </g>
        ))}

        {map.greens.map((g) => (
          <g key={`g-${g.x}-${g.y}`} pointerEvents="none">
            <rect x={g.x} y={g.y} width={g.w} height={g.h} className="plan__green" />
            {g.trees.map((t, i) => (
              <circle key={i} cx={t.x} cy={t.y} r={t.r} className="plan__tree" />
            ))}
            <text x={g.x + g.w / 2} y={g.y + g.h / 2 + 6} textAnchor="middle" className="plan__area-label">
              ÁREA VERDE
            </text>
          </g>
        ))}

        {map.equipment.map((q) => (
          <g key={`q-${q.x}-${q.y}`} pointerEvents="none">
            <rect x={q.x} y={q.y} width={q.w} height={q.h} className="plan__equip" />
            <text x={q.x + q.w / 2} y={q.y + q.h / 2 + 6} textAnchor="middle" className="plan__area-label">
              EQUIPAMIENTO
            </text>
          </g>
        ))}

        {map.lots.map((lot) => {
          const isSel = lot.id === selectedId;
          return (
            <g
              key={lot.id}
              className={`plot plot--${lot.status}${isSel ? " plot--selected" : ""}`}
              role="button"
              tabIndex={0}
              aria-pressed={isSel}
              aria-label={`Lote ${lot.code}, ${Math.round(lot.area)} metros cuadrados, ${statusLabel[lot.status]}`}
              onClick={() => onSelectLot(lot)}
              onKeyDown={(e) => onKey(e, lot)}
            >
              <rect x={lot.x} y={lot.y} width={lot.w} height={lot.h} />
              <text x={lot.x + lot.w / 2} y={lot.y + lot.h / 2 + 5} textAnchor="middle">
                {lot.code.slice(2)}
              </text>
            </g>
          );
        })}

        {map.blocks.map((b) => (
          <text key={b.label} x={b.x + 4} y={b.y - 10} className="plan__block" pointerEvents="none">
            MZ {b.label}
          </text>
        ))}

        {map.streets.map((s) => (
          <text
            key={`t-${s.name}-${s.x}-${s.y}`}
            className="plan__street-name"
            textAnchor="middle"
            pointerEvents="none"
            x={s.horizontal ? s.x + s.w / 2 : s.x + s.w / 2}
            y={s.horizontal ? s.y + s.h / 2 + 5 : s.y + s.h / 2}
            transform={s.horizontal ? undefined : `rotate(90 ${s.x + s.w / 2} ${s.y + s.h / 2})`}
            dy={s.horizontal ? (s.avenue ? -10 : 0) : 5}
          >
            {s.name.toUpperCase()}
          </text>
        ))}

        {selected && (
          <rect
            x={selected.x - 3}
            y={selected.y - 3}
            width={selected.w + 6}
            height={selected.h + 6}
            className="plot-ring"
            pointerEvents="none"
          />
        )}
      </g>

    </MapCanvas>
  );
}
