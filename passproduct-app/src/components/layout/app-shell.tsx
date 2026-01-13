"use client";

import { useEffect } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { useWalletStore, useAlertStore } from "@/store";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { fetchProducts } = useWalletStore();
  const { fetchAlerts } = useAlertStore();

  useEffect(() => {
    // Initialize data on mount
    fetchProducts();
    fetchAlerts();
  }, [fetchProducts, fetchAlerts]);

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
