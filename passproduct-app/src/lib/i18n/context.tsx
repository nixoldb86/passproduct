"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Locale, translations, TranslationKeys, locales } from "./translations";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = "passproduct-locale";

// Detectar idioma del navegador
function detectBrowserLocale(): Locale {
  if (typeof window === "undefined") return "es";
  
  const browserLang = navigator.language.split("-")[0];
  if (locales.includes(browserLang as Locale)) {
    return browserLang as Locale;
  }
  return "es"; // Default
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");
  const [isHydrated, setIsHydrated] = useState(false);

  // Cargar idioma guardado o detectar del navegador
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && locales.includes(saved)) {
      setLocaleState(saved);
    } else {
      const detected = detectBrowserLocale();
      setLocaleState(detected);
    }
    setIsHydrated(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    // También actualizar el atributo lang del HTML
    document.documentElement.lang = newLocale;
  };

  const value: I18nContextType = {
    locale,
    setLocale,
    t: translations[locale],
  };

  // Evitar flash de contenido incorrecto durante hidratación
  if (!isHydrated) {
    return (
      <I18nContext.Provider value={{ ...value, t: translations.es }}>
        {children}
      </I18nContext.Provider>
    );
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

// Hook de conveniencia para solo las traducciones
export function useTranslations() {
  const { t } = useI18n();
  return t;
}
