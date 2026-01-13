"use client";

import { AppShell } from "@/components/layout";
import { AddProductModal } from "@/components/wallet";
import { useUIStore } from "@/store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAddProductModalOpen, setAddProductModalOpen } = useUIStore();

  return (
    <AppShell>
      {children}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setAddProductModalOpen(false)}
      />
    </AppShell>
  );
}
