"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wallet,
  Store,
  MessageCircle,
  ShoppingBag,
  Settings,
  HelpCircle,
  ChevronLeft,
} from "lucide-react";
import { useUIStore } from "@/store";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Mi Wallet",
    href: "/wallet",
    icon: Wallet,
    description: "Tus productos",
  },
  {
    label: "Marketplace",
    href: "/marketplace",
    icon: Store,
    description: "Comprar y vender",
  },
  {
    label: "Mensajes",
    href: "/chat",
    icon: MessageCircle,
    description: "Conversaciones",
  },
  {
    label: "Pedidos",
    href: "/orders",
    icon: ShoppingBag,
    description: "Compras y ventas",
  },
];

const bottomItems = [
  {
    label: "Ajustes",
    href: "/settings",
    icon: Settings,
  },
  {
    label: "Ayuda",
    href: "/help",
    icon: HelpCircle,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 bottom-0 z-40 w-64 bg-background border-r border-border",
          "transform transition-transform duration-300 ease-out",
          "md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full p-4">
          {/* Close button (mobile) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-1 transition-colors md:hidden"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Main navigation */}
          <nav className="flex-1 space-y-1 mt-8 md:mt-0">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-accent/10 text-accent"
                      : "text-foreground-muted hover:text-foreground hover:bg-surface-1"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive && "text-accent"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-xs text-foreground-subtle">
                      {item.description}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Wallet value summary */}
          <div className="my-6 p-4 rounded-xl bg-surface-1 border border-border">
            <p className="text-xs text-foreground-muted mb-1">Valor de tu wallet</p>
            <p className="text-2xl font-semibold text-foreground tabular-nums">
              3.485 €
            </p>
            <p className="text-xs text-jade mt-1">↑ 2.3% este mes</p>
          </div>

          {/* Bottom navigation */}
          <nav className="space-y-1 border-t border-border pt-4">
            {bottomItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl transition-colors",
                    isActive
                      ? "bg-surface-1 text-foreground"
                      : "text-foreground-muted hover:text-foreground hover:bg-surface-1"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
