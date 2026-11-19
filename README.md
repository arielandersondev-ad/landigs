# Muestra de landing moderna — SUMMER

Landing de una sola pantalla para SUMMER (venta de terrenos, topografía y catastro). El mapa ocupa todo el body; header, etiquetas y footer flotan con transparencia.

```bash
npm run dev     # http://localhost:3000
npm run build && npm start
```

## Estructura
- `src/lib/places.ts`: zonas del catálogo, servicios y generador de planos demostrativos (manzanas, calles, áreas verdes, lotes con medidas, colindancias y UTM).
- `src/lib/relief.ts`: textura de relieve generada con filtros SVG y rasterizada una sola vez.
- `src/components/MapCanvas.tsx`: lienzo con zoom (rueda, pellizco y botones), arrastre y zoom animado a un lote.
- `src/components/RegionMap.tsx`: mapa regional con marcadores.
- `src/components/PlaceMap.tsx`: plano de cada zona.
- `src/components/MapExperience.tsx`: transición entre mapas, header, catálogo, servicios y footer.
- `src/components/LotPanel.tsx`: panel de detalles (1/3 derecho en escritorio, hoja inferior en móvil).
- `src/app/globals.css`: tokens de color (celeste + amarillo sobre base cálida) y estilos.

Los mapas son ilustrativos; precios, medidas, coordenadas y contacto son de muestra.
