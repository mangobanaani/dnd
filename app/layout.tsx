import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";
import { Header } from "./components/navigation/header";
import { ToastProvider } from "./components/ui/toast";
import { ConfirmDialogProvider } from "./components/ui/confirm-dialog";
import { ErrorBoundary } from "./components/error-boundary";
import { CommandPaletteWrapper } from "./components/command-palette-wrapper";
import { AppInitializer } from "./components/app-initializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "D&D Campaign Manager",
  description: "A modern, beautiful campaign management tool for D&D 5e",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} antialiased`}
      >
        <ErrorBoundary>
          <ThemeProvider defaultTheme="dark" storageKey="dnd-theme">
            <ToastProvider>
              <ConfirmDialogProvider>
                <AppInitializer />
                <Header />
                {children}
                <CommandPaletteWrapper />
              </ConfirmDialogProvider>
            </ToastProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
