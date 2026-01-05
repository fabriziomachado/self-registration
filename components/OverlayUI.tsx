
import React, { useState, useEffect, useRef } from 'react';
import { AppState } from '../types';

interface OverlayUIProps {
  state: AppState;
  faceConfidence: number;
  onCaptureComplete: () => void;
  errorMsg: string | null;
}

const OverlayUI: React.FC<OverlayUIProps> = ({ state, faceConfidence, onCaptureComplete, errorMsg }) => {
  const [countdown, setCountdown] = useState(3);
  const [scanOffset, setScanOffset] = useState(0);
  const captureTriggered = useRef(false);
  
  // Consideramos rosto detectado se a confiança for maior que 0.65
  const isLocked = faceConfidence > 0.65;

  useEffect(() => {
    if (state === AppState.SCANNING) {
      setCountdown(3);
      captureTriggered.current = false;
    }
  }, [state]);

  // Efeito de rotação do scanner vermelho
  useEffect(() => {
    if (state !== AppState.SCANNING || isLocked) return;
    const scanInterval = setInterval(() => {
      setScanOffset(prev => (prev + 2) % 60);
    }, 40);
    return () => clearInterval(scanInterval);
  }, [state, isLocked]);

  // Lógica da Contagem Regressiva reativa
  useEffect(() => {
    if (!isLocked || state !== AppState.SCANNING || captureTriggered.current) {
      if (!captureTriggered.current) setCountdown(3); // Reseta se o rosto sair
      return;
    }

    const cdInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(cdInterval);
          if (!captureTriggered.current) {
            captureTriggered.current = true;
            onCaptureComplete();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(cdInterval);
  }, [state, isLocked, onCaptureComplete]);

  const ticks = Array.from({ length: 60 }).map((_, i) => {
    const angle = (i * 360) / 60;
    let colorClass = 'bg-white/5';
    let scale = 'scale-y-100';

    if (isLocked) {
      colorClass = 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)]';
      scale = 'scale-y-125';
    } else {
      const diff = (i - scanOffset + 60) % 60;
      if (diff < 15) {
        const opacity = (15 - diff) / 15;
        colorClass = 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]';
        return (
          <div
            key={i}
            className={`absolute w-[3px] h-[20px] origin-[0_165px] transition-opacity duration-75 ${colorClass}`}
            style={{
              transform: `rotate(${angle}deg)`,
              left: 'calc(50% - 1.5px)',
              top: 'calc(50% - 165px)',
              opacity: opacity
            }}
          />
        );
      }
      colorClass = 'bg-white/10';
    }

    return (
      <div
        key={i}
        className={`absolute w-[2.5px] h-[18px] origin-[0_165px] transition-all duration-300 ${colorClass} ${scale}`}
        style={{
          transform: `rotate(${angle}deg)`,
          left: 'calc(50% - 1.25px)',
          top: 'calc(50% - 165px)',
        }}
      />
    );
  });

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start pt-20 bg-transparent">
      {/* Cabeçalho */}
      <div className="text-center px-6 z-10">
        <h1 className="text-3xl font-black text-white mb-2 drop-shadow-lg tracking-tight">Tire sua Foto</h1>
        <p className="text-[10px] text-white/60 uppercase tracking-[0.3em] font-bold">
          Matrícula Institucional • Calouro 2025
        </p>
      </div>

      {/* Círculo Central */}
      <div className="flex-1 flex items-center justify-center relative">
        <div className="relative w-80 h-80 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {ticks}
          </div>

          <div className={`w-72 h-72 rounded-full border-2 transition-all duration-500 flex items-center justify-center ${
            isLocked 
              ? 'border-emerald-400/20 bg-emerald-400/5' 
              : 'border-rose-500/10 bg-rose-500/5'
          }`}>
             {!isLocked && state === AppState.SCANNING && (
               <div className="flex flex-col items-center gap-3">
                 <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mb-2 opacity-60" />
                 <span className="text-[11px] font-black text-rose-500 uppercase tracking-[0.2em] text-center animate-pulse">
                   Buscando Rosto...
                 </span>
                 <span className="text-[9px] text-white/30 uppercase text-center px-10 leading-tight">
                   Centralize seu rosto no círculo para iniciar
                 </span>
               </div>
             )}
          </div>

          {isLocked && state === AppState.SCANNING && countdown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in duration-300">
              <span className="text-[150px] font-black text-white drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                {countdown}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Instruções de Rodapé */}
      <div className="pb-32 w-full flex flex-col items-center gap-6 z-10 px-10">
        {!isLocked && state === AppState.SCANNING && (
          <div className="bg-rose-500/20 border border-rose-500/30 text-rose-100 px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] backdrop-blur-md">
            Aguardando Enquadramento
          </div>
        )}

        {isLocked && state === AppState.SCANNING && countdown > 0 && (
          <div className="bg-emerald-500 text-white px-10 py-4 rounded-full font-black text-sm tracking-[0.15em] shadow-[0_10px_40px_rgba(16,185,129,0.5)] animate-in zoom-in duration-500 uppercase text-center">
            ROSTO DETECTADO! SEGURE...
          </div>
        )}

        {state === AppState.CAPTURING && (
          <div className="bg-white px-14 py-6 rounded-3xl text-black font-black uppercase tracking-[0.4em] shadow-[0_30px_90px_rgba(255,255,255,0.5)] scale-110">
            SORRIA!
          </div>
        )}
        
        {errorMsg && (
          <div className="bg-rose-600 px-8 py-5 rounded-2xl text-white text-xs text-center font-bold shadow-2xl animate-in shake duration-500">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
};

export default OverlayUI;
