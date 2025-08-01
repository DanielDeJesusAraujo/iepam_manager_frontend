import type { Metadata } from "next";
import { Providers } from "./providers";
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: "IEPAM Manager",
  description: "Sistema de gerenciamento de IEPAM",
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
