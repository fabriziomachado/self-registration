
export enum AppState {
  IDLE = 'IDLE',
  INITIALIZING = 'INITIALIZING',
  SCANNING = 'SCANNING',
  COUNTDOWN = 'COUNTDOWN',
  CAPTURING = 'CAPTURING',
  CONFIRMATION = 'CONFIRMATION', // User reviews photo
  VERIFYING = 'VERIFYING',      // AI Analysis
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface VerificationResult {
  isValid: boolean;
  feedback: string;
  details: {
    lighting: string;
    expression: string;
    background: string;
    framing: string;
  };
}
