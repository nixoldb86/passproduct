"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";

const PRESENCE_UPDATE_INTERVAL = 60000; // 1 minuto

export function usePresence() {
  const { isSignedIn } = useUser();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;

    const updatePresence = async () => {
      try {
        await fetch("/api/db/users/presence", { method: "POST" });
      } catch (error) {
        // Silent fail - no es crítico si falla
      }
    };

    // Actualizar inmediatamente al montar
    updatePresence();

    // Configurar intervalo
    intervalRef.current = setInterval(updatePresence, PRESENCE_UPDATE_INTERVAL);

    // También actualizar cuando el usuario vuelve a la pestaña
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updatePresence();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isSignedIn]);
}
