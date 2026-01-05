
import React from 'react';
import { AppState, VerificationResult } from '../types';

interface ResultViewProps {
  state: AppState;
  image: string | null;
  result: VerificationResult | null;
  error: string | null;
  onConfirm: () => void;
  onRetry: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ state, image, result, error, onConfirm, onRetry }) => {
  const isVerifying = state === AppState.VERIFYING;
  const isConfirmation = state === AppState.CONFIRMATION;

  return (
    <div className="flex flex-col items-center min-h-screen bg-white text-gray-900 font-sans animate-in fade-in duration-500">
      <div className="w-full max-w-md flex flex-col items-center pt-10 pb-12 px-8">
        
        <div className="w-full text-left mb-6">
           <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Revisar Foto</span>
        </div>

        <div className="relative w-80 h-80 mb-12 flex items-center justify-center">
          <div className="w-72 h-72 rounded-full overflow-hidden border-8 border-white shadow-[0_15px_45px_rgba(0,0,0,0.12)] relative bg-gray-100">
            {image && (
              <img 
                src={image} 
                alt="Selfie capturada" 
                className="w-full h-full object-cover" 
              />
            )}
            
            {isVerifying && (
              <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center backdrop-blur-md">
                <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-indigo-600 text-xs font-black tracking-widest uppercase">Analisando Qualidade</p>
              </div>
            )}
          </div>
        </div>

        <div className="w-full flex flex-col items-center mb-10 min-h-[40px]">
          {!isVerifying && !result && (
            <div className="flex items-center gap-2 py-2.5 px-5 bg-emerald-50 rounded-full border border-emerald-100">
               <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
               </div>
               <span className="text-emerald-700 text-sm font-bold">Progresso salvo</span>
            </div>
          )}

          {result && (
            <div className="animate-in slide-in-from-bottom-2 duration-400 text-center">
              <h3 className={`text-xl font-black mb-2 ${result.isValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                {result.isValid ? '✓ Ficou Ótima!' : 'Ajuste Necessário'}
              </h3>
              <p className="text-gray-500 text-sm px-4 leading-relaxed">
                {result.feedback}
              </p>
            </div>
          )}

          {error && (
            <div className="px-6 py-4 bg-rose-50 rounded-2xl border border-rose-100 text-center">
               <p className="text-rose-600 text-sm font-bold">{error}</p>
            </div>
          )}
        </div>

        <div className="w-full space-y-4">
          {isConfirmation && (
            <>
              <button 
                onClick={onConfirm}
                className="w-full bg-[#5249D7] active:bg-[#4338CA] text-white font-bold py-5 rounded-2xl shadow-xl shadow-indigo-100 transition-all text-lg tracking-wide transform active:scale-[0.98]"
              >
                Confirmar Foto
              </button>
              <button 
                onClick={onRetry}
                className="w-full bg-white border-2 border-gray-200 active:bg-gray-50 text-gray-500 font-bold py-5 rounded-2xl transition-all text-lg tracking-wide transform active:scale-[0.98]"
              >
                Tirar Outra Foto
              </button>
            </>
          )}

          {result?.isValid && (
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 rounded-2xl shadow-2xl shadow-emerald-100 text-lg uppercase tracking-widest"
            >
              Finalizar Matrícula
            </button>
          )}

          {(result?.isValid === false || error) && (
             <button 
              onClick={onRetry}
              className="w-full bg-[#5249D7] text-white font-bold py-5 rounded-2xl shadow-xl"
            >
              Tentar Novamente
            </button>
          )}
        </div>

        <p className="mt-12 text-gray-300 text-[10px] uppercase tracking-[0.2em] font-bold">
          Matrícula Digital • Verificação Segura
        </p>
      </div>
    </div>
  );
};

export default ResultView;
