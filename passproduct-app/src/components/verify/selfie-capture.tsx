"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";

// Importar face-api dinámicamente solo en el cliente
type FaceApiType = typeof import("@vladmandic/face-api");
let faceapi: FaceApiType | null = null;

interface SelfieCaptureProps {
  idFaceImage: string | null;
  onCapture: (imageData: string, faceDescriptor: Float32Array | null) => void;
  onVerificationResult: (result: VerificationResult) => void;
  isProcessing: boolean;
}

export interface VerificationResult {
  faceDetected: boolean;
  livenessVerified: boolean;
  faceMatchScore: number;
  isMatch: boolean;
  message: string;
}

type LivenessStep = "ready" | "turn-right" | "turn-left" | "verifying" | "done";

export function SelfieCapture({
  idFaceImage,
  onCapture,
  onVerificationResult,
  isProcessing,
}: SelfieCaptureProps) {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [facePosition, setFacePosition] = useState<{ x: number; y: number; size: number } | null>(null);
  const [stableStatus, setStableStatus] = useState<"ok" | "position" | "size" | "no-face">("no-face");
  const [livenessStep, setLivenessStep] = useState<LivenessStep>("ready");
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [turnedRight, setTurnedRight] = useState(false);
  const [turnedLeft, setTurnedLeft] = useState(false);
  const [currentHeadAngle, setCurrentHeadAngle] = useState<number>(0); // -1 = left, 0 = center, 1 = right
  const [idFaceStatus, setIdFaceStatus] = useState<string>("Esperando imagen del ID...");
  const [readyToStart, setReadyToStart] = useState(false); // Stable state for showing start button
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const idFaceDescriptorRef = useRef<Float32Array | null>(null);
  const centerFaceXRef = useRef<number | null>(null); // Store initial center position
  
  // Smoothing refs for stable detection
  const positionHistoryRef = useRef<Array<{ x: number; y: number; size: number }>>([]);
  const statusHistoryRef = useRef<Array<"ok" | "position" | "size" | "no-face">>([]);
  const lastDetectionTimeRef = useRef<number>(0);
  const okStartTimeRef = useRef<number | null>(null); // When status became "ok"
  const notOkStartTimeRef = useRef<number | null>(null); // When status became "not ok"
  const SMOOTHING_FRAMES = 5; // Number of frames to average
  const MIN_DETECTION_INTERVAL = 100; // Minimum ms between detections
  const READY_DELAY_MS = 800; // Must be "ok" for this long to show button
  const NOT_READY_DELAY_MS = 1200; // Must be "not ok" for this long to hide button

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Cargar face-api dinámicamente solo en el cliente
        if (!faceapi) {
          console.log("Cargando face-api...");
          const faceapiModule = await import("@vladmandic/face-api");
          faceapi = faceapiModule;
          console.log("face-api cargado");
        }
        
        const MODEL_URL = "/models";
        
        console.log("Cargando modelos de detección facial...");
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        console.log("Modelos cargados correctamente");
        
        setModelsLoaded(true);
        
        // If we have an ID face image, extract its descriptor
        if (idFaceImage) {
          await extractIdFaceDescriptor(idFaceImage);
        }
      } catch (error) {
        console.error("Error loading face-api models:", error);
        setCameraError("Error al cargar los modelos. Verifica tu conexión e intenta de nuevo.");
      }
    };
    
    loadModels();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Extract ID face descriptor when idFaceImage changes
  useEffect(() => {
    if (modelsLoaded && idFaceImage && !idFaceDescriptorRef.current) {
      console.log("idFaceImage received, extracting face descriptor...");
      extractIdFaceDescriptor(idFaceImage);
    }
  }, [modelsLoaded, idFaceImage]);

  // Extract face descriptor from ID image
  const extractIdFaceDescriptor = async (imageData: string) => {
    if (!faceapi) {
      console.log("face-api not loaded yet");
      setIdFaceStatus("⏳ Esperando modelos...");
      return;
    }
    
    // Validate imageData is a proper image URL
    if (!imageData || !imageData.startsWith('data:image/')) {
      console.log("No valid ID face image provided:", imageData?.substring(0, 50));
      setIdFaceStatus("❌ Imagen del ID no válida");
      return;
    }
    
    setIdFaceStatus("🔍 Buscando cara en el ID...");
    console.log("Extracting face descriptor from ID image...");
    console.log("Image data length:", imageData.length);
    
    try {
      const img = await faceapi.fetchImage(imageData);
      console.log("Image loaded, dimensions:", img.width, "x", img.height);
      setIdFaceStatus(`📷 Imagen cargada (${img.width}x${img.height}), detectando...`);
      
      // Try with very low threshold first
      let detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.1, inputSize: 416 }))
        .withFaceLandmarks(true)
        .withFaceDescriptor();
      
      if (!detection) {
        // Try with even larger input size
        console.log("First attempt failed, trying with larger input...");
        setIdFaceStatus("🔍 Reintentando con mayor resolución...");
        detection = await faceapi
          .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.1, inputSize: 608 }))
          .withFaceLandmarks(true)
          .withFaceDescriptor();
      }
      
      if (detection) {
        idFaceDescriptorRef.current = detection.descriptor;
        const score = detection.detection.score;
        console.log("✅ Face descriptor extracted from ID! Score:", score);
        setIdFaceStatus(`✅ Cara del ID detectada (${Math.round(score * 100)}%)`);
      } else {
        console.log("⚠️ No face detected in ID image after retries");
        setIdFaceStatus("⚠️ No se detectó cara en el ID");
      }
    } catch (error) {
      console.error("Error extracting ID face descriptor:", error);
      setIdFaceStatus(`❌ Error: ${(error as Error).message}`);
    }
  };

  const startCamera = useCallback(async () => {
    console.log("startCamera llamado, modelsLoaded:", modelsLoaded);
    
    if (!modelsLoaded) {
      setCameraError("Los modelos aún se están cargando. Espera un momento.");
      return;
    }
    
    setCameraError(null);
    setIsStartingCamera(true);
    
    try {
      console.log("Solicitando acceso a la cámara...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      
      console.log("Cámara obtenida:", stream);
      streamRef.current = stream;
      
      // Activar la vista de cámara primero para que el video element se renderice
      setCameraActive(true);
      setIsStartingCamera(false);
    } catch (error: unknown) {
      console.error("Error accessing camera:", error);
      setIsStartingCamera(false);
      
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      const errorName = error instanceof Error ? error.name : "";
      
      if (errorName === "NotAllowedError" || errorMessage.includes("Permission denied")) {
        setCameraError("Permiso de cámara denegado. Permite el acceso en la configuración de tu navegador.");
      } else if (errorName === "NotFoundError" || errorMessage.includes("NotFoundError")) {
        setCameraError("No se encontró ninguna cámara en este dispositivo.");
      } else if (errorName === "NotReadableError") {
        setCameraError("La cámara está siendo usada por otra aplicación.");
      } else {
        setCameraError(`Error al acceder a la cámara: ${errorName || errorMessage}`);
      }
    }
  }, [modelsLoaded]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Calculate position status
  const calculateStatus = (pos: { x: number; y: number; size: number } | null): "ok" | "position" | "size" | "no-face" => {
    if (!pos) return "no-face";
    
    const isXCentered = Math.abs(pos.x - 0.5) < 0.18; // Slightly more permissive
    const isYCentered = Math.abs(pos.y - 0.5) < 0.18;
    const isSizeOk = pos.size > 0.22 && pos.size < 0.65; // Slightly more permissive
    
    if (!isSizeOk) {
      return "size";
    }
    if (!isXCentered || !isYCentered) {
      return "position";
    }
    return "ok";
  };

  // Face detection loop
  const startFaceDetection = useCallback(() => {
    const detect = async () => {
      if (!videoRef.current || !overlayCanvasRef.current || !cameraActive || !faceapi) return;
      
      const video = videoRef.current;
      const canvas = overlayCanvasRef.current;
      
      if (video.readyState !== 4) {
        animationRef.current = requestAnimationFrame(detect);
        return;
      }
      
      // Throttle detection to reduce flickering
      const now = Date.now();
      if (now - lastDetectionTimeRef.current < MIN_DETECTION_INTERVAL) {
        animationRef.current = requestAnimationFrame(detect);
        return;
      }
      lastDetectionTimeRef.current = now;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      try {
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 }))
          .withFaceLandmarks(true);
        
        if (detection && detection.detection && detection.detection.box) {
          const box = detection.detection.box;
          
          // Validate box has valid values
          if (box.x === null || box.y === null || box.width === null || box.height === null ||
              isNaN(box.x) || isNaN(box.y) || isNaN(box.width) || isNaN(box.height)) {
            // Add "no-face" to history
            statusHistoryRef.current.push("no-face");
            if (statusHistoryRef.current.length > SMOOTHING_FRAMES) {
              statusHistoryRef.current.shift();
            }
            // Only update if consistently no face
            const noFaceCount = statusHistoryRef.current.filter(s => s === "no-face").length;
            if (noFaceCount >= SMOOTHING_FRAMES - 1) {
              setFaceDetected(false);
              setFacePosition(null);
              setStableStatus("no-face");
            }
            animationRef.current = requestAnimationFrame(detect);
            return;
          }
          
          const centerX = box.x + box.width / 2;
          const centerY = box.y + box.height / 2;
          
          const currentPos = {
            x: centerX / canvas.width,
            y: centerY / canvas.height,
            size: box.width / canvas.width,
          };
          
          // Add to position history for smoothing
          positionHistoryRef.current.push(currentPos);
          if (positionHistoryRef.current.length > SMOOTHING_FRAMES) {
            positionHistoryRef.current.shift();
          }
          
          // Calculate smoothed position (average of recent positions)
          const smoothedPos = {
            x: positionHistoryRef.current.reduce((sum, p) => sum + p.x, 0) / positionHistoryRef.current.length,
            y: positionHistoryRef.current.reduce((sum, p) => sum + p.y, 0) / positionHistoryRef.current.length,
            size: positionHistoryRef.current.reduce((sum, p) => sum + p.size, 0) / positionHistoryRef.current.length,
          };
          
          // Calculate current status
          const currentStatus = calculateStatus(smoothedPos);
          
          // Add to status history
          statusHistoryRef.current.push(currentStatus);
          if (statusHistoryRef.current.length > SMOOTHING_FRAMES) {
            statusHistoryRef.current.shift();
          }
          
          // Only change stable status if majority of recent frames agree
          const statusCounts = statusHistoryRef.current.reduce((acc, s) => {
            acc[s] = (acc[s] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          const dominantStatus = Object.entries(statusCounts).sort((a, b) => b[1] - a[1])[0];
          if (dominantStatus && dominantStatus[1] >= Math.ceil(SMOOTHING_FRAMES / 2)) {
            setStableStatus(dominantStatus[0] as "ok" | "position" | "size" | "no-face");
          }
          
          setFaceDetected(true);
          setFacePosition(smoothedPos);
          
          // Check for head rotation in liveness detection mode
          if (livenessStep === "turn-right" || livenessStep === "turn-left") {
            const landmarks = detection.landmarks;
            if (!landmarks) {
              animationRef.current = requestAnimationFrame(detect);
              return;
            }
            
            const nose = landmarks.getNose();
            const leftEye = landmarks.getLeftEye();
            const rightEye = landmarks.getRightEye();
            
            // Validate landmarks exist
            if (!nose || !leftEye || !rightEye || nose.length < 4 || leftEye.length === 0 || rightEye.length === 0) {
              animationRef.current = requestAnimationFrame(detect);
              return;
            }
            
            // Get nose tip and eye centers
            const noseTip = nose[3]; // Nose tip
            if (!noseTip || noseTip.x === undefined) {
              animationRef.current = requestAnimationFrame(detect);
              return;
            }
            
            const leftEyeCenter = {
              x: leftEye.reduce((sum, p) => sum + (p?.x || 0), 0) / leftEye.length,
              y: leftEye.reduce((sum, p) => sum + (p?.y || 0), 0) / leftEye.length
            };
            const rightEyeCenter = {
              x: rightEye.reduce((sum, p) => sum + (p?.x || 0), 0) / rightEye.length,
              y: rightEye.reduce((sum, p) => sum + (p?.y || 0), 0) / rightEye.length
            };
            
            // Calculate eye midpoint
            const eyeMidpoint = {
              x: (leftEyeCenter.x + rightEyeCenter.x) / 2,
              y: (leftEyeCenter.y + rightEyeCenter.y) / 2
            };
            
            // Calculate horizontal offset of nose from eye midpoint (normalized)
            const eyeDistance = Math.abs(rightEyeCenter.x - leftEyeCenter.x);
            if (eyeDistance === 0) {
              animationRef.current = requestAnimationFrame(detect);
              return;
            }
            
            const noseOffset = (noseTip.x - eyeMidpoint.x) / eyeDistance;
            
            // Store initial center position
            if (centerFaceXRef.current === null) {
              centerFaceXRef.current = noseOffset;
            }
            
            // Calculate relative angle from center (-1 = full left, 0 = center, 1 = full right)
            const relativeAngle = noseOffset - (centerFaceXRef.current || 0);
            setCurrentHeadAngle(relativeAngle);
            
            // Thresholds for detecting turns (video is mirrored, so directions are inverted)
            const TURN_THRESHOLD = 0.25;
            
            if (livenessStep === "turn-right") {
              // Due to mirror, turning right moves nose to left in video coordinates
              if (relativeAngle < -TURN_THRESHOLD) {
                console.log("✅ Giro a la derecha detectado!");
                setTurnedRight(true);
                setLivenessStep("turn-left");
                centerFaceXRef.current = null; // Reset center for next turn
              }
            } else if (livenessStep === "turn-left") {
              // Due to mirror, turning left moves nose to right in video coordinates
              if (relativeAngle > TURN_THRESHOLD) {
                console.log("✅ Giro a la izquierda detectado!");
                setTurnedLeft(true);
                setTimeout(() => captureAndVerify(), 500);
              }
            }
          }
          
          // Draw face guide feedback
          const isInCenter = Math.abs(centerX / canvas.width - 0.5) < 0.15 &&
                            Math.abs(centerY / canvas.height - 0.5) < 0.15;
          const isSizeOk = box.width / canvas.width > 0.25 && box.width / canvas.width < 0.6;
          
          ctx.strokeStyle = isInCenter && isSizeOk ? "#22c55e" : "#eab308";
          ctx.lineWidth = 3;
          ctx.strokeRect(box.x, box.y, box.width, box.height);
        } else {
          setFaceDetected(false);
          setFacePosition(null);
        }
      } catch (error) {
        // Ignore detection errors, just continue
      }
      
      animationRef.current = requestAnimationFrame(detect);
    };
    
    detect();
  }, [cameraActive, livenessStep]);

  // Video is assigned via callback ref, no need for useEffect

  // Start face detection when camera becomes active
  useEffect(() => {
    if (cameraActive && modelsLoaded) {
      startFaceDetection();
    }
  }, [cameraActive, modelsLoaded, startFaceDetection]);

  // Debounced "ready to start" state - prevents button flickering
  useEffect(() => {
    const isCurrentlyOk = faceDetected && stableStatus === "ok";
    
    if (isCurrentlyOk) {
      // Face is in good position
      notOkStartTimeRef.current = null; // Reset not-ok timer
      
      if (!okStartTimeRef.current) {
        okStartTimeRef.current = Date.now();
      }
      
      // Only set readyToStart after being "ok" for READY_DELAY_MS
      const elapsed = Date.now() - okStartTimeRef.current;
      if (elapsed >= READY_DELAY_MS && !readyToStart) {
        setReadyToStart(true);
      } else if (!readyToStart) {
        // Schedule check after remaining delay
        const timeout = setTimeout(() => {
          if (okStartTimeRef.current) {
            const currentElapsed = Date.now() - okStartTimeRef.current;
            if (currentElapsed >= READY_DELAY_MS) {
              setReadyToStart(true);
            }
          }
        }, READY_DELAY_MS - elapsed);
        return () => clearTimeout(timeout);
      }
    } else {
      // Face is not in good position
      okStartTimeRef.current = null; // Reset ok timer
      
      if (!notOkStartTimeRef.current) {
        notOkStartTimeRef.current = Date.now();
      }
      
      // Only hide button after being "not ok" for NOT_READY_DELAY_MS
      const elapsed = Date.now() - notOkStartTimeRef.current;
      if (elapsed >= NOT_READY_DELAY_MS && readyToStart) {
        setReadyToStart(false);
      } else if (readyToStart) {
        // Schedule check after remaining delay
        const timeout = setTimeout(() => {
          if (notOkStartTimeRef.current) {
            const currentElapsed = Date.now() - notOkStartTimeRef.current;
            if (currentElapsed >= NOT_READY_DELAY_MS) {
              setReadyToStart(false);
            }
          }
        }, NOT_READY_DELAY_MS - elapsed);
        return () => clearTimeout(timeout);
      }
    }
  }, [faceDetected, stableStatus, readyToStart]);

  const startLivenessCheck = useCallback(() => {
    setLivenessStep("turn-right");
    setTurnedRight(false);
    setTurnedLeft(false);
    centerFaceXRef.current = null;
  }, []);

  const captureAndVerify = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !faceapi) return;
    
    setLivenessStep("verifying");
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Mirror the image for selfie
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    const selfieData = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedSelfie(selfieData);
    
    // Extract face descriptor from selfie
    try {
      const img = await faceapi.fetchImage(selfieData);
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceDescriptor();
      
      if (detection) {
        onCapture(selfieData, detection.descriptor);
        
        // Compare with ID face if available
        let faceMatchScore = 0;
        let isMatch = false;
        let message = "";
        
        console.log("ID face descriptor available:", !!idFaceDescriptorRef.current);
        
        if (idFaceDescriptorRef.current) {
          const distance = faceapi.euclideanDistance(
            idFaceDescriptorRef.current,
            detection.descriptor
          );
          console.log("=== FACE COMPARISON ===");
          console.log("Euclidean distance:", distance);
          console.log("ID descriptor length:", idFaceDescriptorRef.current.length);
          console.log("Selfie descriptor length:", detection.descriptor.length);
          
          // Convert distance to similarity score (0-1)
          // face-api distances: 0 = identical, ~0.4 = same person, 0.6 = threshold, 1+ = different
          faceMatchScore = Math.max(0, Math.min(1, 1 - (distance / 1.0)));
          isMatch = distance < 0.6; // Threshold for match
          
          console.log("Face match score:", faceMatchScore, "isMatch:", isMatch);
          
          message = isMatch
            ? `¡Verificación exitosa! Coincidencia: ${Math.round(faceMatchScore * 100)}%`
            : `Coincidencia baja: ${Math.round(faceMatchScore * 100)}% (dist: ${distance.toFixed(2)})`;
        } else {
          // No ID face descriptor - liveness passed but no face comparison possible
          console.log("No ID face descriptor available, cannot compare faces");
          console.log("idFaceStatus:", idFaceStatus);
          faceMatchScore = 0;
          isMatch = true; // Consider verified based on liveness only
          message = `Liveness OK. Sin comparación facial (${idFaceStatus})`;
        }
        
        const result: VerificationResult = {
          faceDetected: true,
          livenessVerified: true,
          faceMatchScore,
          isMatch,
          message,
        };
        
        setVerificationResult(result);
        onVerificationResult(result);
        setLivenessStep("done");
        stopCamera();
      } else {
        const result: VerificationResult = {
          faceDetected: false,
          livenessVerified: true,
          faceMatchScore: 0,
          isMatch: false,
          message: "No se detectó una cara clara. Por favor, inténtalo de nuevo.",
        };
        setVerificationResult(result);
        onVerificationResult(result);
        setLivenessStep("ready");
      }
    } catch (error) {
      console.error("Error verifying face:", error);
    }
  }, [onCapture, onVerificationResult, stopCamera]);

  const resetCapture = useCallback(() => {
    setCapturedSelfie(null);
    setVerificationResult(null);
    setLivenessStep("ready");
    setTurnedRight(false);
    setTurnedLeft(false);
    setFaceDetected(false);
    setStableStatus("no-face");
    setReadyToStart(false);
    centerFaceXRef.current = null;
    okStartTimeRef.current = null;
    notOkStartTimeRef.current = null;
    positionHistoryRef.current = [];
    statusHistoryRef.current = [];
    startCamera();
  }, [startCamera]);

  // Get message for current stable status
  const getStatusMessage = () => {
    switch (stableStatus) {
      case "no-face":
        return "No se detecta cara";
      case "size":
        return facePosition && facePosition.size < 0.22 ? "Acércate más" : "Aléjate un poco";
      case "position":
        return "Centra tu cara";
      case "ok":
        return "¡Perfecto!";
      default:
        return "Posiciona tu cara";
    }
  };

  const positionStatus = { status: stableStatus, message: getStatusMessage() };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground">
          Verificación facial
        </h3>
        <p className="text-sm text-foreground-muted mt-1">
          Tomaremos un selfie para compararlo con tu documento
        </p>
        {/* ID Face Status */}
        <p className={`text-xs mt-2 px-3 py-1 rounded-full inline-block ${
          idFaceStatus.includes('✅') ? 'bg-green-500/20 text-green-400' :
          idFaceStatus.includes('❌') || idFaceStatus.includes('⚠️') ? 'bg-red-500/20 text-red-400' :
          'bg-yellow-500/20 text-yellow-400'
        }`}>
          {idFaceStatus}
        </p>
      </div>

      {/* Error message */}
      {cameraError && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{cameraError}</span>
          </div>
          <Button onClick={() => setCameraError(null)} size="sm" variant="ghost" className="mt-2 w-full">
            Reintentar
          </Button>
        </div>
      )}

      {/* Loading models state */}
      {!modelsLoaded && !cameraError && (
        <div className="w-64 h-80 mx-auto rounded-[50%] bg-gray-800 border-4 border-yellow-500/60 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mb-4" />
          <p className="text-white text-sm font-medium">Cargando modelos...</p>
          <p className="text-gray-400 text-xs mt-1">Esto puede tardar</p>
        </div>
      )}

      {/* Models loaded but camera not active */}
      {modelsLoaded && !cameraActive && !capturedSelfie && !cameraError && (
        <div className="w-64 h-80 mx-auto rounded-[50%] bg-gray-800 border-4 border-green-500/60 flex flex-col items-center justify-center">
          {isStartingCamera ? (
            <>
              <Loader2 className="h-12 w-12 text-green-500 mb-4 animate-spin" />
              <p className="text-white text-sm font-medium">Iniciando cámara...</p>
            </>
          ) : (
            <>
              <Camera className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-white text-sm font-medium mb-4">Modelos cargados</p>
              <Button onClick={startCamera}>
                Activar cámara
              </Button>
            </>
          )}
        </div>
      )}

      {/* Camera view - Oval shape like a face */}
      {(cameraActive || capturedSelfie) && (
      <div className="relative w-64 h-80 mx-auto rounded-[50%] overflow-hidden border-4 border-accent/50 shadow-lg">
        {cameraActive && (
          <>
            <video
              ref={(el) => {
                videoRef.current = el;
                if (el && streamRef.current && !el.srcObject) {
                  console.log("Callback ref: asignando stream");
                  el.srcObject = streamRef.current;
                  // autoPlay should handle this, but just in case
                  if (el.paused) {
                    el.play().catch(() => {/* ignore abort errors */});
                  }
                }
              }}
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
              playsInline
              muted
              autoPlay
            />
            
            {/* Overlay canvas for face detection visualization */}
            <canvas
              ref={overlayCanvasRef}
              className="absolute inset-0 w-full h-full scale-x-[-1] pointer-events-none"
            />
            
            {/* Oval guide - face shape */}
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 125" preserveAspectRatio="none">
                {/* Oscurecer exterior */}
                <defs>
                  <mask id="faceMask">
                    <rect width="100" height="125" fill="white" />
                    <ellipse cx="50" cy="62.5" rx="38" ry="50" fill="black" />
                  </mask>
                </defs>
                <rect width="100" height="125" fill="rgba(0,0,0,0.5)" mask="url(#faceMask)" />
                
                {/* Borde del óvalo con transición suave */}
                <ellipse
                  cx="50"
                  cy="62.5"
                  rx="38"
                  ry="50"
                  fill="none"
                  stroke={positionStatus.status === "ok" ? "#22c55e" : positionStatus.status === "no-face" ? "#ef4444" : "#eab308"}
                  strokeWidth="3"
                  strokeDasharray={positionStatus.status === "ok" ? "0" : "8,4"}
                  style={{ transition: "stroke 0.5s ease, stroke-dasharray 0.3s ease" }}
                />
              </svg>
            </div>
            
            {/* Status message with smooth transition */}
            <div className="absolute bottom-2 left-0 right-0 text-center">
              <span 
                className={`inline-block px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-500 ${
                  positionStatus.status === "ok" 
                    ? "bg-green-500/30 text-green-300 shadow-lg shadow-green-500/20" 
                    : positionStatus.status === "no-face"
                    ? "bg-red-500/30 text-red-300"
                    : "bg-yellow-500/30 text-yellow-300"
                }`}
              >
                {positionStatus.message}
              </span>
            </div>
          </>
        )}

        {/* Captured selfie */}
        {capturedSelfie && (
          <img
            src={capturedSelfie}
            alt="Selfie capturado"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Processing overlay */}
        {livenessStep === "verifying" && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 text-accent animate-spin mx-auto" />
              <p className="text-white mt-2 text-sm">Verificando identidad...</p>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Liveness instructions */}
      <AnimatePresence mode="wait">
        {livenessStep === "ready" && cameraActive && readyToStart && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <Button onClick={startLivenessCheck} size="lg">
              Comenzar verificación
            </Button>
          </motion.div>
        )}

        {(livenessStep === "turn-right" || livenessStep === "turn-left") && (
          <motion.div
            key="turn"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-4"
          >
            {/* Progress indicators */}
            <div className="flex items-center justify-center gap-6">
              <div className={`flex flex-col items-center gap-1 ${turnedRight ? 'text-green-500' : livenessStep === 'turn-right' ? 'text-yellow-500' : 'text-foreground-muted'}`}>
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                  turnedRight ? 'border-green-500 bg-green-500/20' : 
                  livenessStep === 'turn-right' ? 'border-yellow-500 bg-yellow-500/20 animate-pulse' : 
                  'border-gray-600'
                }`}>
                  {turnedRight ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <span className="text-2xl">👉</span>
                  )}
                </div>
                <span className="text-xs">Derecha</span>
              </div>
              
              <div className={`flex flex-col items-center gap-1 ${turnedLeft ? 'text-green-500' : livenessStep === 'turn-left' ? 'text-yellow-500' : 'text-foreground-muted'}`}>
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                  turnedLeft ? 'border-green-500 bg-green-500/20' : 
                  livenessStep === 'turn-left' ? 'border-yellow-500 bg-yellow-500/20 animate-pulse' : 
                  'border-gray-600'
                }`}>
                  {turnedLeft ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <span className="text-2xl">👈</span>
                  )}
                </div>
                <span className="text-xs">Izquierda</span>
              </div>
            </div>
            
            {/* Instructions */}
            <p className="text-lg font-medium text-foreground">
              {livenessStep === "turn-right" 
                ? "Gira la cabeza a la DERECHA" 
                : "Ahora gira a la IZQUIERDA"}
            </p>
            
            {/* Head angle indicator */}
            <div className="relative w-48 h-4 mx-auto bg-gray-700 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-1/2 w-1 bg-gray-500" />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-accent transition-all"
                style={{ 
                  left: `${50 + (currentHeadAngle * 40)}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
              {/* Target zones */}
              <div className={`absolute inset-y-0 left-0 w-1/4 ${livenessStep === 'turn-right' ? 'bg-yellow-500/30' : 'bg-transparent'}`} />
              <div className={`absolute inset-y-0 right-0 w-1/4 ${livenessStep === 'turn-left' ? 'bg-yellow-500/30' : 'bg-transparent'}`} />
            </div>
            <p className="text-xs text-foreground-subtle">
              Mueve el punto amarillo hacia la zona resaltada
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verification result */}
      {verificationResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border ${
            verificationResult.isMatch
              ? "bg-green-500/10 border-green-500/30"
              : "bg-red-500/10 border-red-500/30"
          }`}
        >
          <div className="flex items-center gap-3">
            {verificationResult.isMatch ? (
              <Check className="h-6 w-6 text-green-500" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-500" />
            )}
            <div>
              <p className={`font-medium ${
                verificationResult.isMatch ? "text-green-400" : "text-red-400"
              }`}>
                {verificationResult.message}
              </p>
              {verificationResult.faceMatchScore > 0 && (
                <p className="text-sm text-foreground-muted mt-1">
                  Coincidencia: {Math.round(verificationResult.faceMatchScore * 100)}%
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Reset button */}
      {capturedSelfie && !verificationResult?.isMatch && (
        <div className="flex justify-center">
          <Button variant="ghost" onClick={resetCapture}>
            Intentar de nuevo
          </Button>
        </div>
      )}
    </div>
  );
}
