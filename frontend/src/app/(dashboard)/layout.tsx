'use client';

import Sidebar from '@/components/Sidebar';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Não mostrar o sidebar nas páginas de login e registro
  if (pathname === '/login' || pathname === '/register' || pathname === '/') {
    return children;
  }

  return (
    <Sidebar>
      {children}
    </Sidebar>
  );
} 