import type { Metadata } from "next";
import { Providers } from "./providers";
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: "TI Assistant",
  description: "Sistema de gerenciamento de TI",
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
