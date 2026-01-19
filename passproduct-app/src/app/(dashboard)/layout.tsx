"use client";

import { AppShell } from "@/components/layout";
import { AddProductModal } from "@/components/wallet";
import { UserSync } from "@/components/auth/user-sync";
import { useUIStore } from "@/store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAddProductModalOpen, setAddProductModalOpen } = useUIStore();

  return (
    <AppShell>
      {/* Sincronizar usuario con BD cuando se carga el dashboard */}
      <UserSync />
      {children}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setAddProductModalOpen(false)}
      />
    </AppShell>
  );
}
