
import React, { RefObject } from 'react';
import { AppState } from '../types';

interface CameraViewProps {
  videoRef: RefObject<HTMLVideoElement>;
  isFlipped?: boolean;
  state: AppState;
}

const CameraView: React.FC<CameraViewProps> = ({ videoRef, isFlipped, state }) => {
  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transition-opacity duration-700 ${
          state === AppState.INITIALIZING ? 'opacity-0' : 'opacity-100'
        } ${isFlipped ? 'scale-x-[-1]' : ''}`}
      />
      
      {/* Vinheta para dar foco ao centro e escurecer as bordas, direcionando o olhar para o círculo de feedback */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.7)_100%)] pointer-events-none" />
      
      {/* Camada de flash para o momento da captura */}
      {state === AppState.CAPTURING && (
        <div className="absolute inset-0 bg-white animate-pulse z-50" />
      )}
    </div>
  );
};

export default CameraView;
