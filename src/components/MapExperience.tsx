"use client";

import { useEffect, useRef, useState, type AnimationEvent } from "react";
import { countByStatus, getPlaceMap, places, services, statusLabel, type Lot, type LotStatus } from "@/lib/places";
import { FloatingMenu } from "./FloatingMenu";
import { LotPanel } from "./LotPanel";
import { PlaceMap } from "./PlaceMap";
import { RegionMap } from "./RegionMap";

type Scene = { uid: number; key: string; phase: "enter" | "idle" | "exit" };

function SunMark() {
  return (
    <svg className="brand__mark" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="17" r="9" fill="var(--sun)" />
      <path d="M4 26h32M8 31h24M13 36h14" stroke="var(--sky-deep)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function MapExperience() {
  const uid = useRef(1);
  const [scenes, setScenes] = useState<Scene[]>([{ uid: 0, key: "region", phase: "idle" }]);
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const [hovered, setHovered] = useState<string | null>(null);
  const [lot, setLot] = useState<Lot | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const current = [...scenes].reverse().find((s) => s.phase !== "exit")?.key ?? "region";
  const place = places.find((p) => p.id === current) ?? null;
  const placeLots = place ? getPlaceMap(place).lots : [];
  const counts = countByStatus(placeLots);

  const go = (key: string) => {
    if (key === current) return;
    setPanelOpen(false);
    setLot(null);
    setDir(key === "region" ? "back" : "fwd");
    const id = uid.current++;
    setScenes((prev) => [
      ...prev.filter((s) => s.phase !== "exit").map((s) => ({ ...s, phase: "exit" as const })),
      { uid: id, key, phase: "enter" },
    ]);
  };

  const onSceneEnd = (e: AnimationEvent<HTMLDivElement>, s: Scene) => {
    if (e.target !== e.currentTarget) return;
    setScenes((prev) =>
      prev.flatMap((x) => (x.uid !== s.uid ? [x] : x.phase === "exit" ? [] : [{ ...x, phase: "idle" as const }])),
    );
  };

  const selectLot = (l: Lot) => {
    setLot(l);
    setPanelOpen(true);
  };

  const step = (delta: number) => {
    if (!lot) return;
    const i = placeLots.findIndex((l) => l.id === lot.id);
    selectLot(placeLots[(i + delta + placeLots.length) % placeLots.length]);
  };

  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanelOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panelOpen]);

  return (
    <div className="app" data-panel={panelOpen} data-view={place ? "place" : "region"}>
      <div className="stage">
        {scenes.map((s) => {
          const p = places.find((x) => x.id === s.key);
          return (
            <div
              key={s.uid}
              className="scene"
              data-phase={s.phase}
              data-dir={dir}
              inert={s.phase === "exit"}
              onAnimationEnd={(e) => onSceneEnd(e, s)}
            >
              {p ? (
                <PlaceMap
                  place={p}
                  selectedId={panelOpen && lot ? lot.id : null}
                  onSelectLot={selectLot}
                  onClear={() => setPanelOpen(false)}
                />
              ) : (
                <RegionMap highlighted={hovered} onSelect={go} />
              )}
            </div>
          );
        })}
      </div>

      <header className="topbar glass">
        <a href="#" className="brand" onClick={(e) => (e.preventDefault(), go("region"))} aria-label="SUMMER, volver al mapa general">
          <SunMark />
          <span className="brand__text">
            <span className="brand__word">SUMMER</span>
            <span className="brand__sub">Bienes raíces · Topografía · Catastro</span>
          </span>
        </a>
        <div className="topbar__end">
          <span className="topbar__contact">
            <small>Atención</small>+591 2 000 0000
          </span>
          <a className="btn btn--sun" href="https://wa.me/59170000000" target="_blank" rel="noopener noreferrer">
            Contactar
          </a>
        </div>
      </header>

      <div className="float-tl">
        <FloatingMenu label="Catálogo" hint={place ? place.name : `${places.length} zonas`} direction="down" className="catalog">
          {(close) => (
            <ul className="catalog__list" onPointerLeave={() => setHovered(null)}>
              {places.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    aria-current={p.id === current}
                    onPointerEnter={() => setHovered(p.id)}
                    onFocus={() => setHovered(p.id)}
                    onClick={() => {
                      close();
                      setHovered(null);
                      go(p.id);
                    }}
                  >
                    <span className="catalog__name">{p.name}</span>
                    <span className="catalog__meta">
                      {p.municipality} · {p.distanceKm} km
                    </span>
                    <span className="catalog__price">USD {p.pricePerM2}/m²</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </FloatingMenu>
        {place && (
          <button type="button" className="chip glass back" onClick={() => go("region")}>
            <span aria-hidden="true">←</span> Mapa general
          </button>
        )}
      </div>

      <div className="float-bl glass" aria-live="polite">
        {place ? (
          <>
            <p className="legend__title">
              {place.name} <span>· {placeLots.length} lotes</span>
            </p>
            <ul className="legend">
              {(Object.keys(statusLabel) as LotStatus[]).map((s) => (
                <li key={s}>
                  <span className={`legend__dot legend__dot--${s}`} aria-hidden="true" />
                  {statusLabel[s]} <b>{counts[s]}</b>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="legend__hint">Elige una zona en el mapa o en el catálogo para ver sus terrenos.</p>
        )}
      </div>

      <div className="float-br">
        <FloatingMenu label="Servicios" hint="6" direction="up" className="services">
          {() => (
            <>
              <ul className="services__list">
                {services.map((s, i) => (
                  <li key={s.name}>
                    <span className="services__num">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="services__name">{s.name}</span>
                      <span className="services__text">{s.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <a
                className="btn btn--sun btn--block"
                href={`https://wa.me/59170000000?text=${encodeURIComponent("Hola SUMMER, quiero cotizar un servicio.")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Cotizar un servicio
              </a>
            </>
          )}
        </FloatingMenu>
      </div>

      <LotPanel open={panelOpen} lot={lot} place={place} onClose={() => setPanelOpen(false)} onStep={step} />

      <footer className="veil">
        <span>© 2026 SUMMER Bienes Raíces</span>
        <span className="veil__sep" aria-hidden="true">
          ·
        </span>
        <span>Mapas ilustrativos; medidas y precios referenciales</span>
      </footer>
    </div>
  );
}
