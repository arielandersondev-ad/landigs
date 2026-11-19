import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const serif = Cormorant_Garamond({
  variable: "--nf-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sans = Source_Sans_3({
  variable: "--nf-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SUMMER · Terrenos en el altiplano paceño",
  description:
    "Explora en el mapa los terrenos de SUMMER en Callutaca, Achocalla, Mecapaca, Viacha, Pucarani y Laja. Medidas, colindancias y precios por lote.",
};

export const viewport: Viewport = {
  themeColor: "#f3e6cc",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
