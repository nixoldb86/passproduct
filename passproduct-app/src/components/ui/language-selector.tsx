"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Globe, Check } from "lucide-react";
import { useI18n, locales, localeNames, localeCodes, Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface LanguageSelectorProps {
  variant?: "default" | "compact";
  className?: string;
}

// Circular flag icons as SVG components
function FlagIcon({ locale, size = 20 }: { locale: Locale; size?: number }) {
  const flags: Record<Locale, JSX.Element> = {
    es: (
      // Spain - Red/Yellow/Red horizontal stripes
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <clipPath id="circleClipES">
          <circle cx="16" cy="16" r="15" />
        </clipPath>
        <g clipPath="url(#circleClipES)">
          <rect width="32" height="32" fill="#c60b1e" />
          <rect y="8" width="32" height="16" fill="#ffc400" />
        </g>
        <circle cx="16" cy="16" r="15" stroke="#333" strokeWidth="1" fill="none" />
      </svg>
    ),
    en: (
      // UK - Union Jack
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <clipPath id="circleClipEN">
          <circle cx="16" cy="16" r="15" />
        </clipPath>
        <g clipPath="url(#circleClipEN)">
          <rect width="32" height="32" fill="#012169" />
          <path d="M0,0 L32,32 M32,0 L0,32" stroke="#fff" strokeWidth="6" />
          <path d="M0,0 L32,32" stroke="#c8102e" strokeWidth="2" />
          <path d="M32,0 L0,32" stroke="#c8102e" strokeWidth="2" />
          <path d="M16,0 V32 M0,16 H32" stroke="#fff" strokeWidth="10" />
          <path d="M16,0 V32 M0,16 H32" stroke="#c8102e" strokeWidth="6" />
        </g>
        <circle cx="16" cy="16" r="15" stroke="#333" strokeWidth="1" fill="none" />
      </svg>
    ),
    fr: (
      // France - Blue/White/Red vertical stripes
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <clipPath id="circleClipFR">
          <circle cx="16" cy="16" r="15" />
        </clipPath>
        <g clipPath="url(#circleClipFR)">
          <rect width="32" height="32" fill="#fff" />
          <rect width="11" height="32" fill="#0055a4" />
          <rect x="21" width="11" height="32" fill="#ef4135" />
        </g>
        <circle cx="16" cy="16" r="15" stroke="#333" strokeWidth="1" fill="none" />
      </svg>
    ),
    it: (
      // Italy - Green/White/Red vertical stripes
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <clipPath id="circleClipIT">
          <circle cx="16" cy="16" r="15" />
        </clipPath>
        <g clipPath="url(#circleClipIT)">
          <rect width="32" height="32" fill="#fff" />
          <rect width="11" height="32" fill="#009246" />
          <rect x="21" width="11" height="32" fill="#ce2b37" />
        </g>
        <circle cx="16" cy="16" r="15" stroke="#333" strokeWidth="1" fill="none" />
      </svg>
    ),
    pt: (
      // Portugal - Green/Red with yellow armillary
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <clipPath id="circleClipPT">
          <circle cx="16" cy="16" r="15" />
        </clipPath>
        <g clipPath="url(#circleClipPT)">
          <rect width="32" height="32" fill="#ff0000" />
          <rect width="12" height="32" fill="#006600" />
          <circle cx="12" cy="16" r="6" fill="#ffcc00" />
          <circle cx="12" cy="16" r="4" fill="#ff0000" />
          <circle cx="12" cy="16" r="2.5" fill="#fff" />
        </g>
        <circle cx="16" cy="16" r="15" stroke="#333" strokeWidth="1" fill="none" />
      </svg>
    ),
  };

  return flags[locale];
}

export function LanguageSelector({ variant = "default", className }: LanguageSelectorProps) {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-lg transition-colors",
          variant === "default"
            ? "px-3 py-2 text-sm text-foreground-muted hover:text-foreground hover:bg-surface-1"
            : "p-2 text-foreground-muted hover:text-foreground hover:bg-surface-1"
        )}
        aria-label="Select language"
      >
        {variant === "default" ? (
          <>
            <Globe className="h-4 w-4" />
            <span className="font-medium">{localeCodes[locale]}</span>
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")} />
          </>
        ) : (
          <>
            <Globe className="h-4 w-4" />
            <span className="text-xs font-semibold">{localeCodes[locale]}</span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-surface-1 border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-1.5">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleSelect(loc)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                  locale === loc
                    ? "bg-accent/10 text-accent"
                    : "text-foreground hover:bg-surface-2"
                )}
              >
                {/* Circular flag */}
                <FlagIcon locale={loc} size={22} />
                {/* Language name */}
                <span className="flex-1 text-left font-medium">{localeNames[loc]}</span>
                {/* Check */}
                {locale === loc && (
                  <Check className="h-4 w-4 text-accent" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
