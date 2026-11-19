"use client";

import type { KeyboardEvent } from "react";
import { places } from "@/lib/places";
import { warmRamp } from "@/lib/relief";
import { MapCanvas, useRelief } from "./MapCanvas";

const W = 1600;
const H = 1000;
const HUB = { x: 820, y: 455 };

const reliefOptions = {
  key: "region",
  width: W,
  height: H,
  seed: 8,
  frequency: 0.0042,
  relief: 13,
  pad: 500,
  ramp: warmRamp,
  heightField: `
    <path d="M990 -80 C1080 120 1230 220 1300 420 S1440 640 1350 860" stroke="#fff" stroke-width="250" fill="none" stroke-linecap="round"/>
    <circle cx="1330" cy="770" r="120" fill="#fff"/>
    <circle cx="1090" cy="160" r="90" fill="#fff"/>
    <path d="M905 470 C935 545 990 605 1012 690 S1085 830 1140 1080" stroke="#202020" stroke-width="150" fill="none" stroke-linecap="round"/>
    <circle cx="865" cy="650" r="70" fill="#4a4a4a"/>
    <path d="M-600 -600 L560 -600 L560 -80 C520 60 420 120 360 180 C290 240 180 260 -80 360 L-600 420 Z" fill="#6a6a6a"/>
  `,
};

const lake =
  "M-600 -600 L540 -600 L540 -60 C512 26 452 78 392 140 C336 200 262 196 210 252 C160 306 74 296 -60 336 L-600 420 Z";

export function RegionMap({
  highlighted,
  onSelect,
}: {
  highlighted: string | null;
  onSelect: (id: string) => void;
}) {
  const relief = useRelief(reliefOptions);

  const onKey = (e: KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(id);
    }
  };

  return (
    <MapCanvas label="Mapa regional del altiplano paceño" worldW={W} worldH={H} centerX={740} centerY={520} maxCrop={2.1}>
      {relief && (
        <image
          href={relief}
          x={-reliefOptions.pad}
          y={-reliefOptions.pad}
          width={W + reliefOptions.pad * 2}
          height={H + reliefOptions.pad * 2}
          preserveAspectRatio="none"
          className="fade-in"
        />
      )}

      <path d={lake} className="region__lake" />
      <path d={lake} className="region__lake-edge" />
      <text x="70" y="262" className="region__water-label" transform="rotate(-20 70 262)">
        Lago Titicaca
      </text>

      <path d="M905 470 C935 545 990 605 1012 690 S1085 830 1140 1080" className="region__river" />
      <text x="1040" y="905" className="region__water-label region__water-label--sm" transform="rotate(62 1040 905)">
        Río La Paz
      </text>

      <g className="region__roads">
        {places.map((p) => (
          <path
            key={p.id}
            d={`M${HUB.x} ${HUB.y} Q ${(HUB.x + p.region.x) / 2 + 30} ${(HUB.y + p.region.y) / 2 - 40} ${p.region.x} ${p.region.y}`}
            data-active={highlighted === p.id}
          />
        ))}
      </g>

      <g className="region__peaks">
        {[
          { x: 1095, y: 165, name: "Huayna Potosí", alt: "6.088 m" },
          { x: 1335, y: 760, name: "Illimani", alt: "6.438 m" },
          { x: 1250, y: 360, name: "Cordillera Real", alt: "" },
        ].map((p) => (
          <g key={p.name} transform={`translate(${p.x} ${p.y})`}>
            <g className="fixed-size">
              {p.alt && <path d="M-7 5 L0 -7 L7 5 Z" />}
              <text y={p.alt ? 22 : 0} textAnchor="middle" className={p.alt ? "" : "region__range"}>
                {p.name}
              </text>
              {p.alt && (
                <text y="36" textAnchor="middle" className="region__alt">
                  {p.alt}
                </text>
              )}
            </g>
          </g>
        ))}
      </g>

      <g className="region__cities">
        <g transform={`translate(${HUB.x} ${HUB.y})`}>
          <g className="fixed-size">
            <rect x="-5" y="-5" width="10" height="10" />
            <text x="12" y="5">
              El Alto
            </text>
          </g>
        </g>
        <g transform="translate(935 535)">
          <g className="fixed-size">
            <rect x="-5" y="-5" width="10" height="10" />
            <text x="12" y="5">
              La Paz
            </text>
          </g>
        </g>
      </g>

      {places.map((p) => {
        const label = `${p.name}`;
        const sub = `desde USD ${p.pricePerM2}/m²`;
        const width = Math.max(label.length * 9.4, sub.length * 6.4) + 30;
        return (
          <g
            key={p.id}
            transform={`translate(${p.region.x} ${p.region.y})`}
            className="marker"
            data-active={highlighted === p.id}
            role="button"
            tabIndex={0}
            aria-label={`Ver plano de ${p.name}`}
            onClick={() => onSelect(p.id)}
            onKeyDown={(e) => onKey(e, p.id)}
          >
            <g className="fixed-size">
              <circle r="22" className="marker__halo" />
              <circle r="8" className="marker__dot" />
              <g transform="translate(16 -50)">
                <rect width={width} height="42" rx="6" className="marker__pill" />
                <text x="14" y="19" className="marker__name">
                  {label}
                </text>
                <text x="14" y="34" className="marker__sub">
                  {sub}
                </text>
              </g>
            </g>
          </g>
        );
      })}
    </MapCanvas>
  );
}
