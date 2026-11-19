"use client";

import { formatNumber, formatUsd, statusLabel, type Lot, type Place } from "@/lib/places";

type Props = {
  open: boolean;
  lot: Lot | null;
  place: Place | null;
  onClose: () => void;
  onStep: (delta: number) => void;
};

function LotSketch({ lot }: { lot: Lot }) {
  const max = 140;
  const k = max / Math.max(lot.front, lot.depth);
  const w = lot.front * k;
  const h = lot.depth * k;
  const ox = Math.max((220 - w) / 2, 118);
  const oy = 26;
  return (
    <svg className="sketch" viewBox={`0 0 240 ${h + 60}`} aria-hidden="true">
      <defs>
        <pattern id="sketch-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" className="sketch__hatch" />
        </pattern>
      </defs>
      <text x={ox + w / 2} y="12" textAnchor="middle" className="sketch__street">
        {lot.neighbors.frente.toUpperCase()} · FRENTE
      </text>
      <rect x={ox} y={oy} width={w} height={h} className="sketch__lot" />
      <rect x={ox} y={oy} width={w} height={h} fill="url(#sketch-hatch)" />
      <path d={`M${ox} ${oy + h + 8} H${ox + w} M${ox} ${oy + h + 4} V${oy + h + 12} M${ox + w} ${oy + h + 4} V${oy + h + 12}`} className="sketch__dim" />
      <path d={`M${ox + w + 8} ${oy} V${oy + h} M${ox + w + 4} ${oy} H${ox + w + 12} M${ox + w + 4} ${oy + h} H${ox + w + 12}`} className="sketch__dim" />
      <text x={ox - 14} y={oy + h / 2} textAnchor="end" className="sketch__area">
        {formatNumber(lot.area, lot.area % 1 ? 1 : 0)} m²
      </text>
      <text x={ox - 14} y={oy + h / 2 + 16} textAnchor="end" className="sketch__code">
        Lote {lot.code}
      </text>
      <text
        x={ox + w + 20}
        y={oy + h / 2}
        className="sketch__label"
        transform={`rotate(90 ${ox + w + 20} ${oy + h / 2})`}
        textAnchor="middle"
      >
        {formatNumber(lot.depth, 2)} m
      </text>
      <text x={ox + w / 2} y={oy + h + 26} textAnchor="middle" className="sketch__label">
        {formatNumber(lot.front, 2)} m
      </text>
    </svg>
  );
}

export function LotPanel({ open, lot, place, onClose, onStep }: Props) {
  return (
    <aside className="panel glass" data-open={open} aria-hidden={!open} aria-label="Detalles del terreno" inert={!open}>
      {lot && place && (
        <div className="panel__inner">
          <div className="panel__head">
            <div>
              <p className="eyebrow">
                {place.name} · Manzana {lot.block}
              </p>
              <h2 className="panel__title">Lote {lot.code}</h2>
            </div>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar detalles">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>

          <div className="panel__price-row">
            <p className="panel__price">{formatUsd(lot.price)}</p>
            <span className={`status status--${lot.status}`}>{statusLabel[lot.status]}</span>
          </div>
          <p className="panel__ppm">
            USD {lot.pricePerM2} por m² {lot.corner && "· incluye 8 % por esquina"}
          </p>

          <LotSketch lot={lot} />

          <dl className="facts">
            <div>
              <dt>Superficie</dt>
              <dd>{formatNumber(lot.area, lot.area % 1 ? 1 : 0)} m²</dd>
            </div>
            <div>
              <dt>Frente × fondo</dt>
              <dd>
                {formatNumber(lot.front, 2)} × {formatNumber(lot.depth, 0)} m
              </dd>
            </div>
            <div>
              <dt>Frente orientado al</dt>
              <dd>{lot.facing}</dd>
            </div>
            <div>
              <dt>Ubicación</dt>
              <dd>{lot.corner ? "Esquina" : "Medianero"}</dd>
            </div>
            <div>
              <dt>Altitud</dt>
              <dd>{formatNumber(place.altitude)} m s.n.m.</dd>
            </div>
            <div>
              <dt>Distancia a El Alto</dt>
              <dd>{place.distanceKm} km</dd>
            </div>
          </dl>

          <h3 className="panel__sub">Colindancias</h3>
          <dl className="bounds">
            <div>
              <dt>Frente</dt>
              <dd>{lot.neighbors.frente}</dd>
            </div>
            <div>
              <dt>Fondo</dt>
              <dd>{lot.neighbors.fondo}</dd>
            </div>
            <div>
              <dt>Izquierda</dt>
              <dd>{lot.neighbors.izquierda}</dd>
            </div>
            <div>
              <dt>Derecha</dt>
              <dd>{lot.neighbors.derecha}</dd>
            </div>
          </dl>

          <h3 className="panel__sub">Georreferencia</h3>
          <p className="utm">
            UTM WGS-84 · Zona 19 S
            <span>
              E {formatNumber(lot.utm.e)} · N {formatNumber(lot.utm.n)}
            </span>
          </p>

          <h3 className="panel__sub">Servicios y documentos</h3>
          <ul className="tags">
            {place.services.map((s) => (
              <li key={s}>{s}</li>
            ))}
            <li>Folio real</li>
            <li>Plano georreferenciado</li>
          </ul>

          <div className="panel__actions">
            {lot.status === "vendido" ? (
              <span className="btn btn--sun btn--disabled" aria-disabled="true">
                Lote vendido
              </span>
            ) : (
              <a
                className="btn btn--sun"
                href={`https://wa.me/59170000000?text=${encodeURIComponent(
                  `Hola SUMMER, me interesa el lote ${lot.code} en ${place.name}.`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {lot.status === "reservado" ? "Avisarme si se libera" : "Solicitar este lote"}
              </a>
            )}
            <div className="panel__stepper">
              <button type="button" className="btn btn--glass" onClick={() => onStep(-1)}>
                ← Anterior
              </button>
              <button type="button" className="btn btn--glass" onClick={() => onStep(1)}>
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
