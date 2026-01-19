"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Shield, ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import {
  IdCapture,
  ExtractedIdData,
  SelfieCapture,
  VerificationResult,
  VerificationResultDisplay,
} from "@/components/verify";

type Step = "intro" | "id" | "selfie" | "result";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const returnTo = searchParams.get("returnTo") || "/sell";

  const [currentStep, setCurrentStep] = useState<Step>("intro");
  const [idImage, setIdImage] = useState<string | null>(null);
  const [idData, setIdData] = useState<ExtractedIdData | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [faceDescriptor, setFaceDescriptor] = useState<Float32Array | null>(null);
  const [faceResult, setFaceResult] = useState<VerificationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);

  // Check if user is already verified
  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!isLoaded || !user) return;

      try {
        const response = await fetch("/api/verify/status");
        const data = await response.json();

        if (data.isVerified) {
          setIsAlreadyVerified(true);
        }
      } catch (error) {
        console.error("Error checking verification status:", error);
      }
    };

    checkVerificationStatus();
  }, [isLoaded, user]);

  const handleIdCapture = (imageData: string) => {
    setIdImage(imageData);
  };

  const handleIdDataExtracted = (data: ExtractedIdData | null) => {
    setIdData(data);
  };

  const handleSelfieCapture = (
    imageData: string,
    descriptor: Float32Array | null
  ) => {
    setSelfieImage(imageData);
    setFaceDescriptor(descriptor);
  };

  const handleFaceVerificationResult = (result: VerificationResult) => {
    setFaceResult(result);
    if (result.isMatch || result.faceDetected) {
      setCurrentStep("result");
    }
  };

  const handleComplete = async () => {
    if (!idData || !user) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/verify/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: idData.documentType,
          documentNumber: idData.documentNumber,
          firstName: idData.firstName,
          lastName: idData.lastName,
          dateOfBirth: idData.dateOfBirth,
          expirationDate: idData.expirationDate,
          faceMatchScore: faceResult?.faceMatchScore || 0,
          livenessScore: faceResult?.livenessVerified ? 1 : 0,
          ocrConfidence: idData.confidence,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to the original destination
        router.push(returnTo);
      } else {
        console.error("Verification failed:", data.error);
      }
    } catch (error) {
      console.error("Error completing verification:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setCurrentStep("id");
    setIdImage(null);
    setIdData(null);
    setSelfieImage(null);
    setFaceDescriptor(null);
    setFaceResult(null);
  };

  const canProceedFromId = idData && idData.confidence > 0.3;

  // Render steps
  const steps = [
    { key: "intro", label: "Introducción" },
    { key: "id", label: "Documento" },
    { key: "selfie", label: "Selfie" },
    { key: "result", label: "Resultado" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <Shield className="h-16 w-16 text-foreground-muted mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Inicia sesión para verificarte
        </h1>
        <p className="text-foreground-muted mb-6">
          Necesitas tener una cuenta para completar la verificación de identidad.
        </p>
        <Button onClick={() => router.push("/sign-in")}>Iniciar sesión</Button>
      </div>
    );
  }

  if (isAlreadyVerified) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4"
        >
          <Check className="h-10 w-10 text-green-500" />
        </motion.div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Ya estás verificado
        </h1>
        <p className="text-foreground-muted mb-6">
          Tu identidad ya ha sido verificada anteriormente.
        </p>
        <Button onClick={() => router.push(returnTo)}>Continuar</Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pb-8">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className={`flex items-center ${
                index < steps.length - 1 ? "flex-1" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  index <= currentStepIndex
                    ? "bg-accent text-[#0C0C0E]"
                    : "bg-surface-2 text-foreground-muted"
                }`}
              >
                {index < currentStepIndex ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded transition-colors ${
                    index < currentStepIndex ? "bg-accent" : "bg-surface-2"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-foreground-muted">
          {steps.map((step) => (
            <span key={step.key} className="text-center">
              {step.label}
            </span>
          ))}
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        {currentStep === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-accent/20 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-10 w-10 text-accent" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Verificación de identidad
              </h1>
              <p className="text-foreground-muted mt-2">
                Para vender en PassProduct necesitamos verificar tu identidad.
                Es rápido y seguro.
              </p>
            </div>

            <div className="bg-surface-1 rounded-xl p-4 border border-border space-y-4">
              <h3 className="font-medium text-foreground">
                ¿Qué necesitarás?
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-accent">1</span>
                  </div>
                  <div>
                    <p className="text-foreground font-medium">
                      Documento de identidad
                    </p>
                    <p className="text-sm text-foreground-muted">
                      DNI, NIE o Pasaporte válido y no caducado
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-accent">2</span>
                  </div>
                  <div>
                    <p className="text-foreground font-medium">
                      Cámara del dispositivo
                    </p>
                    <p className="text-sm text-foreground-muted">
                      Para tomar foto del documento y un selfie
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-accent">3</span>
                  </div>
                  <div>
                    <p className="text-foreground font-medium">
                      Buena iluminación
                    </p>
                    <p className="text-sm text-foreground-muted">
                      Asegúrate de estar en un lugar bien iluminado
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-surface-1 rounded-xl p-4 border border-border">
              <h3 className="font-medium text-foreground mb-2">
                🔒 Tu privacidad es importante
              </h3>
              <p className="text-sm text-foreground-muted">
                Solo almacenamos un hash de tu número de documento para prevenir
                duplicados. Tu información personal no se comparte con terceros.
              </p>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={() => setCurrentStep("id")}
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Comenzar verificación
            </Button>
          </motion.div>
        )}

        {currentStep === "id" && (
          <motion.div
            key="id"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <IdCapture
              onCapture={handleIdCapture}
              onExtractedData={handleIdDataExtracted}
              isProcessing={isProcessing}
            />

            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setCurrentStep("intro")}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Atrás
              </Button>
              <Button
                className="flex-1"
                onClick={() => setCurrentStep("selfie")}
                disabled={!canProceedFromId}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Siguiente
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === "selfie" && (
          <motion.div
            key="selfie"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <SelfieCapture
              idFaceImage={idData?.faceImage || null}
              onCapture={handleSelfieCapture}
              onVerificationResult={handleFaceVerificationResult}
              isProcessing={isProcessing}
            />

            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setCurrentStep("id")}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Atrás
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <VerificationResultDisplay
              idData={idData}
              faceResult={faceResult}
              isSubmitting={isSubmitting}
              onComplete={handleComplete}
              onRetry={handleRetry}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
