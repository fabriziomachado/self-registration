
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppState, VerificationResult } from './types';
import CameraView from './components/CameraView';
import OverlayUI from './components/OverlayUI';
import ResultView from './components/ResultView';
import { verifySelfie } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [faceConfidence, setFaceConfidence] = useState(0); // 0 a 1 (simula detecção real)
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));

  const startCamera = async () => {
    try {
      setAppState(AppState.INITIALIZING);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1080 },
          height: { ideal: 1920 }
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setAppState(AppState.SCANNING);
        };
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Acesso à câmera negado. Por favor, habilite as permissões.");
      setAppState(AppState.ERROR);
    }
  };

  // Motor de análise em tempo real (Detecção de "energia visual" no centro)
  useEffect(() => {
    if (appState !== AppState.SCANNING && appState !== AppState.COUNTDOWN) return;

    let animationFrame: number;
    const ctx = analysisCanvasRef.current.getContext('2d', { willReadFrequently: true });
    analysisCanvasRef.current.width = 40;
    analysisCanvasRef.current.height = 40;

    const analyzeFrame = () => {
      if (!videoRef.current || !ctx) return;

      // Captura apenas a região central (onde o rosto deve estar)
      const v = videoRef.current;
      const size = Math.min(v.videoWidth, v.videoHeight) * 0.5;
      const sx = (v.videoWidth - size) / 2;
      const sy = (v.videoHeight - size) / 2;

      ctx.drawImage(v, sx, sy, size, size, 0, 0, 40, 40);
      const imageData = ctx.getImageData(0, 0, 40, 40).data;

      // Cálculo de Variância/Contraste Simples
      // Rostos têm muito mais variações de brilho que paredes vazias
      let totalLuminance = 0;
      for (let i = 0; i < imageData.length; i += 4) {
        totalLuminance += (imageData[i] + imageData[i+1] + imageData[i+2]) / 3;
      }
      const avgLuminance = totalLuminance / (40 * 40);

      let variance = 0;
      for (let i = 0; i < imageData.length; i += 4) {
        const lum = (imageData[i] + imageData[i+1] + imageData[i+2]) / 3;
        variance += Math.abs(lum - avgLuminance);
      }
      
      const normalizedVariance = Math.min(variance / 25000, 1);
      
      // Filtro passa-baixa para suavizar a detecção
      setFaceConfidence(prev => (prev * 0.8) + (normalizedVariance * 0.2));

      animationFrame = requestAnimationFrame(analyzeFrame);
    };

    analyzeFrame();
    return () => cancelAnimationFrame(animationFrame);
  }, [appState]);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setAppState(AppState.CAPTURING);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const base64 = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(base64);
      
      const stream = video.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      
      setTimeout(() => {
        setAppState(AppState.CONFIRMATION);
      }, 150);
    }
  }, []);

  const runVerification = async () => {
    if (!capturedImage) return;
    
    setAppState(AppState.VERIFYING);
    try {
      const base64Clean = capturedImage.split(',')[1];
      const result = await verifySelfie(base64Clean);
      setVerificationResult(result);
      setAppState(AppState.SUCCESS);
    } catch (err) {
      console.error(err);
      setAppState(AppState.ERROR);
      setErrorMsg("Falha na verificação da IA. Tente novamente.");
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setVerificationResult(null);
    setErrorMsg(null);
    setFaceConfidence(0);
    setAppState(AppState.IDLE);
  };

  useEffect(() => {
    if (appState === AppState.IDLE) {
      startCamera();
    }
  }, [appState]);

  const showResultOverlay = [
    AppState.CONFIRMATION, 
    AppState.SUCCESS, 
    AppState.ERROR, 
    AppState.VERIFYING
  ].includes(appState);

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden select-none font-sans">
      <div className={`absolute inset-0 z-0 transition-opacity duration-500 ${showResultOverlay ? 'opacity-0' : 'opacity-100'}`}>
        <CameraView videoRef={videoRef} isFlipped={true} state={appState} />
      </div>

      <div className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-500 ${showResultOverlay ? 'opacity-0' : 'opacity-100'}`}>
        <OverlayUI 
          state={appState} 
          faceConfidence={faceConfidence}
          onCaptureComplete={capturePhoto}
          errorMsg={errorMsg}
        />
      </div>

      {showResultOverlay && (
        <div className="absolute inset-0 z-20 pointer-events-auto bg-white animate-in fade-in duration-300">
          <ResultView 
            state={appState}
            image={capturedImage} 
            result={verificationResult} 
            error={errorMsg}
            onConfirm={runVerification}
            onRetry={reset}
          />
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default App;
