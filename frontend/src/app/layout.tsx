import type { Metadata } from "next";
import { Providers } from "./providers";
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: "IEPAM suprimentos",
  description: "Sistema de gerenciamento de IEPAM",
  icons: {
    icon: "/iepam-favicon.ico",
    shortcut: "/iepam-favicon.ico",
    apple: "/iepam-favicon.ico"
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="font-sans">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
