"use client";

import { Check, X, Shield, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { motion } from "framer-motion";
import { ExtractedIdData } from "./id-capture";
import { VerificationResult as FaceVerificationResult } from "./selfie-capture";

interface VerificationResultProps {
  idData: ExtractedIdData | null;
  faceResult: FaceVerificationResult | null;
  isSubmitting: boolean;
  onComplete: () => void;
  onRetry: () => void;
}

export function VerificationResult({
  idData,
  faceResult,
  isSubmitting,
  onComplete,
  onRetry,
}: VerificationResultProps) {
  // Verification is considered complete if:
  // - ID data was extracted with reasonable confidence
  // - Liveness check passed (head turns)
  // - Either face match passed OR face comparison was not available
  const livenessOK = faceResult?.livenessVerified || false;
  const ocrOK = idData && idData.confidence > 0.3;
  const faceComparisonAvailable = faceResult && faceResult.faceMatchScore > 0;
  const faceMatchOK = !faceComparisonAvailable || faceResult?.isMatch;
  
  const isFullyVerified = ocrOK && livenessOK && faceMatchOK;
  
  const checks = [
    {
      label: "Documento de identidad legible",
      passed: !!idData && idData.confidence > 0.3,
      detail: idData ? `${idData.documentType} - ${idData.documentNumber}` : "No detectado",
    },
    {
      label: "Datos del documento extraídos",
      passed: !!idData?.firstName && !!idData?.lastName,
      detail: idData ? `${idData.firstName} ${idData.lastName}` : "No disponible",
    },
    {
      label: "Documento no caducado",
      passed: idData?.expirationDate ? new Date(idData.expirationDate.split('/').reverse().join('-')) > new Date() : false,
      detail: idData?.expirationDate || "No disponible",
    },
    {
      label: "Verificación de presencia (giros de cabeza)",
      passed: livenessOK,
      detail: livenessOK ? "✓ Completada" : "No completada",
    },
    {
      label: "Coincidencia facial",
      passed: faceComparisonAvailable ? (faceResult?.isMatch || false) : true,
      detail: faceComparisonAvailable
        ? `${Math.round((faceResult?.faceMatchScore || 0) * 100)}% de similitud`
        : "No disponible (verificado por liveness)",
    },
  ];

  const passedChecks = checks.filter(c => c.passed).length;
  const totalChecks = checks.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
            isFullyVerified
              ? "bg-green-500/20"
              : passedChecks >= 3
              ? "bg-yellow-500/20"
              : "bg-red-500/20"
          }`}
        >
          {isFullyVerified ? (
            <Shield className="h-10 w-10 text-green-500" />
          ) : passedChecks >= 3 ? (
            <AlertTriangle className="h-10 w-10 text-yellow-500" />
          ) : (
            <X className="h-10 w-10 text-red-500" />
          )}
        </motion.div>
        
        <h3 className="text-xl font-semibold text-foreground mt-4">
          {isFullyVerified
            ? "¡Verificación completada!"
            : passedChecks >= 3
            ? "Verificación parcial"
            : "Verificación fallida"}
        </h3>
        
        <p className="text-foreground-muted mt-1">
          {isFullyVerified
            ? "Tu identidad ha sido verificada correctamente"
            : passedChecks >= 3
            ? "Algunos pasos no se completaron correctamente"
            : "No se pudo verificar tu identidad"}
        </p>
      </div>

      {/* Verification checks */}
      <div className="bg-surface-1 rounded-xl p-4 border border-border">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-foreground">
            Comprobaciones
          </span>
          <span className="text-sm text-foreground-muted">
            {passedChecks}/{totalChecks} completadas
          </span>
        </div>
        
        <div className="space-y-3">
          {checks.map((check, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                check.passed ? "bg-green-500/20" : "bg-red-500/20"
              }`}>
                {check.passed ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <X className="h-3 w-3 text-red-500" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  check.passed ? "text-foreground" : "text-foreground-muted"
                }`}>
                  {check.label}
                </p>
                <p className="text-xs text-foreground-subtle">
                  {check.detail}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Verified user info */}
      {isFullyVerified && idData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/30 rounded-xl p-4"
        >
          <h4 className="text-sm font-medium text-green-400 mb-3">
            Información verificada
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-foreground-muted">Nombre:</span>
              <p className="text-foreground">{idData.firstName}</p>
            </div>
            <div>
              <span className="text-foreground-muted">Apellidos:</span>
              <p className="text-foreground">{idData.lastName}</p>
            </div>
            <div>
              <span className="text-foreground-muted">Documento:</span>
              <p className="text-foreground">
                {idData.documentType} ****{idData.documentNumber.slice(-4)}
              </p>
            </div>
            <div>
              <span className="text-foreground-muted">Válido hasta:</span>
              <p className="text-foreground">{idData.expirationDate}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {isFullyVerified ? (
          <Button
            className="w-full"
            size="lg"
            onClick={onComplete}
            disabled={isSubmitting}
            leftIcon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          >
            {isSubmitting ? "Guardando..." : "Continuar"}
          </Button>
        ) : (
          <>
            <Button
              variant="secondary"
              className="flex-1"
              size="lg"
              onClick={onRetry}
            >
              Intentar de nuevo
            </Button>
            {passedChecks >= 3 && (
              <Button
                className="flex-1"
                size="lg"
                onClick={onComplete}
                disabled={isSubmitting}
              >
                Continuar de todas formas
              </Button>
            )}
          </>
        )}
      </div>

      {/* Security note */}
      <p className="text-xs text-center text-foreground-subtle">
        Tu información se procesa de forma segura y no se almacena en texto plano.
        Solo guardamos un hash de tu número de documento para prevenir duplicados.
      </p>
    </div>
  );
}
