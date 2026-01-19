"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Settings,
  Shield,
  Eye,
  EyeOff,
  CheckCheck,
  Clock,
  Bell,
  Globe,
  User,
  Lock,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button, Card } from "@/components/ui";

interface PrivacySettings {
  showLastSeen: boolean;
  showReadReceipts: boolean;
}

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    showLastSeen: true,
    showReadReceipts: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Cargar configuración de privacidad
  useEffect(() => {
    const fetchPrivacySettings = async () => {
      try {
        const response = await fetch("/api/db/users/privacy");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.privacy) {
            setPrivacySettings(data.privacy);
          }
        }
      } catch (error) {
        console.error("Error fetching privacy settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoaded && user) {
      fetchPrivacySettings();
    } else if (isLoaded) {
      setIsLoading(false);
    }
  }, [isLoaded, user]);

  const updatePrivacySetting = async (
    key: keyof PrivacySettings,
    value: boolean
  ) => {
    setIsSaving(true);
    const previousValue = privacySettings[key];
    
    // Optimistic update
    setPrivacySettings((prev) => ({ ...prev, [key]: value }));

    try {
      const response = await fetch("/api/db/users/privacy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });

      if (!response.ok) {
        // Revert on error
        setPrivacySettings((prev) => ({ ...prev, [key]: previousValue }));
      }
    } catch (error) {
      console.error("Error updating privacy setting:", error);
      setPrivacySettings((prev) => ({ ...prev, [key]: previousValue }));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Lock className="h-12 w-12 text-foreground-subtle mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Inicia sesión
        </h2>
        <p className="text-foreground-muted">
          Necesitas iniciar sesión para ver los ajustes
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground flex items-center gap-3">
          <Settings className="h-7 w-7" />
          Ajustes
        </h1>
        <p className="text-foreground-muted mt-1">
          Configura tu cuenta y preferencias de privacidad
        </p>
      </div>

      <div className="space-y-6">
        {/* Sección de cuenta */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-accent/10 rounded-lg">
                <User className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Cuenta</h2>
                <p className="text-sm text-foreground-muted">
                  Información de tu perfil
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">Nombre</p>
                  <p className="text-sm text-foreground-muted">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">Email</p>
                  <p className="text-sm text-foreground-muted">
                    {user.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Sección de privacidad */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Privacidad</h2>
                <p className="text-sm text-foreground-muted">
                  Controla quién puede ver tu información
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Última conexión */}
              <div className="flex items-center justify-between py-4 border-b border-border">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-surface-2 rounded-lg mt-0.5">
                    <Clock className="h-4 w-4 text-foreground-muted" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Última conexión
                    </p>
                    <p className="text-sm text-foreground-muted mt-0.5">
                      {privacySettings.showLastSeen
                        ? "Otros usuarios pueden ver cuándo estuviste en línea por última vez"
                        : "Tu última conexión está oculta para otros usuarios"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    updatePrivacySetting(
                      "showLastSeen",
                      !privacySettings.showLastSeen
                    )
                  }
                  disabled={isSaving}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    privacySettings.showLastSeen
                      ? "bg-accent"
                      : "bg-surface-3"
                  } ${isSaving ? "opacity-50" : ""}`}
                >
                  <span
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      privacySettings.showLastSeen ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Confirmación de lectura */}
              <div className="flex items-center justify-between py-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-surface-2 rounded-lg mt-0.5">
                    <CheckCheck className="h-4 w-4 text-foreground-muted" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Confirmación de lectura
                    </p>
                    <p className="text-sm text-foreground-muted mt-0.5">
                      {privacySettings.showReadReceipts
                        ? "Otros usuarios verán el doble check verde cuando leas sus mensajes"
                        : "El doble check verde está desactivado para tus conversaciones"}
                    </p>
                    {!privacySettings.showReadReceipts && (
                      <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        Tampoco podrás ver cuando lean los tuyos
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() =>
                    updatePrivacySetting(
                      "showReadReceipts",
                      !privacySettings.showReadReceipts
                    )
                  }
                  disabled={isSaving}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    privacySettings.showReadReceipts
                      ? "bg-accent"
                      : "bg-surface-3"
                  } ${isSaving ? "opacity-50" : ""}`}
                >
                  <span
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      privacySettings.showReadReceipts ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Info adicional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-surface-2 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <EyeOff className="h-5 w-5 text-foreground-muted flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground-muted">
              Si desactivas estas opciones, tampoco podrás ver la información
              equivalente de otros usuarios. Tu privacidad es bidireccional.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
