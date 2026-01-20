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
  Phone,
  Check,
  Send,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button, Card, Input } from "@/components/ui";

interface PrivacySettings {
  showLastSeen: boolean;
  showReadReceipts: boolean;
}

interface PhoneVerification {
  phone: string;
  isVerified: boolean;
  verificationCode?: string;
}

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    showLastSeen: true,
    showReadReceipts: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Phone verification state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [verificationStep, setVerificationStep] = useState<"idle" | "code-sent" | "verifying">("idle");
  const [verificationCode, setVerificationCode] = useState("");

  // Cargar configuración de privacidad y teléfono
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fetch privacy settings
        const privacyResponse = await fetch("/api/db/users/privacy");
        if (privacyResponse.ok) {
          const data = await privacyResponse.json();
          if (data.success && data.privacy) {
            setPrivacySettings(data.privacy);
          }
          // Also load phone from the same response if available
          if (data.phone) {
            setPhoneNumber(data.phone);
            setIsPhoneVerified(data.isPhoneVerified || false);
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoaded && user) {
      fetchSettings();
    } else if (isLoaded) {
      setIsLoading(false);
    }
  }, [isLoaded, user]);

  // Format phone number for display
  const formatPhoneDisplay = (phone: string) => {
    if (!phone) return "";
    // Format as +34 XXX XXX XXX
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length >= 9) {
      const countryCode = cleaned.slice(0, -9) || "34";
      const number = cleaned.slice(-9);
      return `+${countryCode} ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
    }
    return phone;
  };

  // Handle phone save
  const handleSavePhone = async () => {
    if (!phoneNumber.trim()) {
      setPhoneError("Introduce un número de teléfono");
      return;
    }
    
    // Basic validation for Spanish phone numbers
    const cleanedPhone = phoneNumber.replace(/\D/g, "");
    if (cleanedPhone.length < 9) {
      setPhoneError("El número debe tener al menos 9 dígitos");
      return;
    }
    
    setIsSavingPhone(true);
    setPhoneError(null);
    
    try {
      const response = await fetch("/api/db/users/phone", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanedPhone }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsEditingPhone(false);
        setVerificationStep("code-sent");
        // Phone saved, now waiting for verification code
      } else {
        setPhoneError(data.error || "Error al guardar el teléfono");
      }
    } catch (error) {
      console.error("Error saving phone:", error);
      setPhoneError("Error al guardar el teléfono");
    } finally {
      setIsSavingPhone(false);
    }
  };

  // Handle verification code submission
  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setPhoneError("Introduce el código de 6 dígitos");
      return;
    }
    
    setVerificationStep("verifying");
    setPhoneError(null);
    
    try {
      const response = await fetch("/api/db/users/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsPhoneVerified(true);
        setVerificationStep("idle");
        setVerificationCode("");
      } else {
        setPhoneError(data.error || "Código incorrecto");
        setVerificationStep("code-sent");
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      setPhoneError("Error al verificar el código");
      setVerificationStep("code-sent");
    }
  };

  // Cancel phone editing
  const handleCancelPhoneEdit = () => {
    setIsEditingPhone(false);
    setVerificationStep("idle");
    setVerificationCode("");
    setPhoneError(null);
  };

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
                <div className="flex items-center gap-1 text-jade text-xs">
                  <Check className="h-3 w-3" />
                  Verificado
                </div>
              </div>
              
              {/* Teléfono */}
              <div className="py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-foreground-muted" />
                    <p className="font-medium text-foreground">Teléfono</p>
                  </div>
                  {isPhoneVerified && (
                    <div className="flex items-center gap-1 text-jade text-xs">
                      <Check className="h-3 w-3" />
                      Verificado
                    </div>
                  )}
                </div>
                
                {!isEditingPhone && verificationStep === "idle" ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-foreground-muted">
                      {phoneNumber ? formatPhoneDisplay(phoneNumber) : "No configurado"}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingPhone(true)}
                    >
                      {phoneNumber ? "Cambiar" : "Añadir"}
                    </Button>
                  </div>
                ) : verificationStep === "code-sent" || verificationStep === "verifying" ? (
                  <div className="space-y-3">
                    <p className="text-sm text-foreground-muted">
                      Hemos enviado un código de verificación a {formatPhoneDisplay(phoneNumber)}
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Código de 6 dígitos"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="flex-1"
                        maxLength={6}
                      />
                      <Button
                        onClick={handleVerifyCode}
                        isLoading={verificationStep === "verifying"}
                        disabled={verificationCode.length !== 6}
                      >
                        Verificar
                      </Button>
                    </div>
                    <button
                      onClick={handleCancelPhoneEdit}
                      className="text-sm text-foreground-muted hover:text-foreground"
                    >
                      Cancelar
                    </button>
                    {phoneError && (
                      <p className="text-sm text-error">{phoneError}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
                          +34
                        </span>
                        <Input
                          placeholder="612 345 678"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="pl-12"
                        />
                      </div>
                      <Button
                        onClick={handleSavePhone}
                        isLoading={isSavingPhone}
                        leftIcon={<Send className="h-4 w-4" />}
                      >
                        Enviar código
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-foreground-subtle">
                        Te enviaremos un SMS con el código de verificación
                      </p>
                      <button
                        onClick={handleCancelPhoneEdit}
                        className="text-sm text-foreground-muted hover:text-foreground"
                      >
                        Cancelar
                      </button>
                    </div>
                    {phoneError && (
                      <p className="text-sm text-error">{phoneError}</p>
                    )}
                  </div>
                )}
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
              <div className="flex items-center justify-between py-4 border-b border-border gap-4">
                <div className="flex items-start gap-3 flex-1">
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
                  className={`relative flex-shrink-0 w-14 h-8 rounded-full transition-all duration-200 ${
                    privacySettings.showLastSeen
                      ? "bg-jade"
                      : "bg-gray-600"
                  } ${isSaving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span
                    className={`absolute top-1 w-6 h-6 rounded-full shadow-md transition-all duration-200 ${
                      privacySettings.showLastSeen 
                        ? "left-7 bg-white" 
                        : "left-1 bg-gray-300"
                    }`}
                  />
                </button>
              </div>

              {/* Confirmación de lectura */}
              <div className="flex items-center justify-between py-4 gap-4">
                <div className="flex items-start gap-3 flex-1">
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
                  className={`relative flex-shrink-0 w-14 h-8 rounded-full transition-all duration-200 ${
                    privacySettings.showReadReceipts
                      ? "bg-jade"
                      : "bg-gray-600"
                  } ${isSaving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span
                    className={`absolute top-1 w-6 h-6 rounded-full shadow-md transition-all duration-200 ${
                      privacySettings.showReadReceipts 
                        ? "left-7 bg-white" 
                        : "left-1 bg-gray-300"
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
