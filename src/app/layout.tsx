import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Derecho Penal Chile | NewCooltura Informada",
  description: "Derecho penal, calculadora de penas, beneficios intrapenitenciarios y procedimientos",
  keywords: ["derecho penal", "penas Chile", "beneficios carcelarios", "delitos", "procedimiento penal"],
  openGraph: {
    title: "Derecho Penal Chile - NewCooltura Informada",
    description: "Penas y procedimientos penales",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
