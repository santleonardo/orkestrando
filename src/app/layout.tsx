import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/providers/SessionProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { RoleProvider } from "@/providers/RoleProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orkestrando — Plataforma Educacional",
  description:
    "Plataforma educacional completa com gestão de turmas, atividades, materiais e comunicação entre coordenadores, professores e alunos.",
  keywords: [
    "Orkestrando",
    "educação",
    "plataforma educacional",
    "gestão escolar",
    "Next.js",
    "TypeScript",
  ],
  authors: [{ name: "Orkestrando" }],
  openGraph: {
    title: "Orkestrando — Plataforma Educacional",
    description: "Gestão educacional inteligente para coordenadores, professores e alunos.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <SessionProvider>
          <AuthProvider>
            <RoleProvider>
              <div className="min-h-screen flex flex-col">
                {children}
              </div>
            </RoleProvider>
          </AuthProvider>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
