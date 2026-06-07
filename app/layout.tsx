import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAU Bolivia - Régimen Agropecuario Unificado",
  description: "Plataforma de gestión del Régimen Agropecuario Unificado para Bolivia",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
