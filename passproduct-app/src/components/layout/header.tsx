"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { Menu, Search, Plus } from "lucide-react";
import Link from "next/link";
import { useUIStore } from "@/store";
import { Button, LanguageSelector, NotificationBell } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n";

export function Header() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { toggleSidebar, setAddProductModalOpen } = useUIStore();
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-1 transition-colors md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-semibold text-foreground tracking-tight">
              Pass<span className="text-accent">Product</span>
            </span>
          </Link>
        </div>

        {/* Center - Search (desktop) */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-subtle" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.header.searchPlaceholder}
              className="w-full h-10 pl-10 pr-4 bg-surface-1 border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-subtle focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all"
            />
          </div>
        </form>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isLoaded && user ? (
            <>
              {/* Add Product Button */}
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setAddProductModalOpen(true)}
                className="hidden sm:inline-flex"
              >
                {t.nav.addProduct}
              </Button>

              {/* Language Selector */}
              <LanguageSelector variant="compact" />

              {/* Notifications */}
              <NotificationBell />

              {/* User Menu */}
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                    userButtonPopoverCard: "bg-surface-1 border border-border",
                    userButtonPopoverActionButton: "text-foreground hover:bg-surface-2",
                    userButtonPopoverActionButtonText: "text-foreground",
                    userButtonPopoverFooter: "hidden",
                  },
                }}
              />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <LanguageSelector variant="compact" />
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">
                  {t.nav.signIn}
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">{t.nav.createAccount}</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
