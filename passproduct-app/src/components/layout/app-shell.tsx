"use client";

import { useEffect } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { useWalletStore, useAlertStore } from "@/store";
import { usePresence } from "@/hooks";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { products, fetchProducts } = useWalletStore();
  const { alerts, fetchAlerts } = useAlertStore();

  // Actualizar presencia del usuario periódicamente
  usePresence();

  useEffect(() => {
    // Solo cargar si no hay datos (evita re-fetch en navegación)
    if (products.length === 0) {
      fetchProducts();
    }
    if (alerts.length === 0) {
      fetchAlerts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      <main className="md:pl-64 min-h-[calc(100vh-64px)]">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
