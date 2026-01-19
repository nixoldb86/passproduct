"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";

// Componente que sincroniza el usuario de Clerk con la BD
export function UserSync() {
  const { isSignedIn, isLoaded } = useUser();
  const hasSynced = useRef(false);

  useEffect(() => {
    // Solo sincronizar si está logueado y no se ha sincronizado antes
    if (isLoaded && isSignedIn && !hasSynced.current) {
      hasSynced.current = true;
      
      // Sincronizar usuario con la BD
      fetch("/api/db/users/sync", { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            console.log("✅ Usuario sincronizado con BD");
          } else {
            console.error("Error sincronizando usuario:", data.error);
          }
        })
        .catch((error) => {
          console.error("Error en sincronización:", error);
        });
    }
  }, [isLoaded, isSignedIn]);

  return null; // Este componente no renderiza nada
}
