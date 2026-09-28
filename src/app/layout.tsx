import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ludothèque — Ma ludothèque",
  description:
    "Vos jeux, vos parties et tous les bons moments autour de la table.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#315f4d",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
