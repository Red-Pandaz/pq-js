const { init: initDilithium, cleanup: cleanupDilithium } = require('../dist/sig/dilithium');
const { init: initSphincs, cleanup: cleanupSphincs } = require('../dist/sig/sphincs');
const { init: initFalcon, cleanup: cleanupFalcon } = require('../dist/sig/falcon');
const { init: initMlkem, cleanup: cleanupMlkem } = require('../dist/kem/mlkem');
const { init: initFrodokem, cleanup: cleanupFrodokem } = require('../dist/kem/frodokem');
const { 
  initSmall: initMcElieceSmall, 
  initFull: initMcElieceFull, 
  cleanupSmall: cleanupMcElieceSmall, 
  cleanupFull: cleanupMcElieceFull 
} = require('../dist/kem/classic_mceliece');

// Type definitions for the unified API
export interface PQSignatures {
  dilithium: Record<string, any>;
  sphincs: Record<string, any>;
  falcon: Record<string, any>;
}

export interface PQKeyEncapsulation {
  mlkem: Record<string, any>;
  frodokem: Record<string, any>;
  mceliece: Record<string, any>;
}

export interface PQFull {
  signatures: PQSignatures;
  kem: PQKeyEncapsulation;
}

// By default, createPQ uses the small build for Classic McEliece (only small/medium variants, 512MB RAM)
export async function createPQ(): Promise<PQFull> {
  const dilithium = await initDilithium();
  const sphincs = await initSphincs();
  const falcon = await initFalcon();
  const mlkem = await initMlkem();
  const frodokem = await initFrodokem();
  const mceliece = await initMcElieceSmall();
  
  return {
    signatures: { dilithium, sphincs, falcon },
    kem: { mlkem, frodokem, mceliece }
  };
}

export function cleanupPQ(): void {
  cleanupDilithium();
  cleanupSphincs();
  cleanupFalcon();
  cleanupMlkem();
  cleanupFrodokem();
  cleanupMcElieceSmall();
}

// createPQFull uses the full build for Classic McEliece (all variants, 2GB RAM)
export async function createPQFull(): Promise<PQFull> {
  const dilithium = await initDilithium();
  const sphincs = await initSphincs();
  const falcon = await initFalcon();
  const mlkem = await initMlkem();
  const frodokem = await initFrodokem();
  const mceliece = await initMcElieceFull();
  
  return {
    signatures: { dilithium, sphincs, falcon },
    kem: { mlkem, frodokem, mceliece }
  };
}

export function cleanupPQFull(): void {
  cleanupDilithium();
  cleanupSphincs();
  cleanupFalcon();
  cleanupMlkem();
  cleanupFrodokem();
  cleanupMcElieceFull();
}

// Individual module access functions for more granular control
export async function createSignatures(): Promise<PQSignatures> {
  const dilithium = await initDilithium();
  const sphincs = await initSphincs();
  const falcon = await initFalcon();
  
  return { dilithium, sphincs, falcon };
}

export async function createKEM(): Promise<PQKeyEncapsulation> {
  const mlkem = await initMlkem();
  const frodokem = await initFrodokem();
  const mceliece = await initMcElieceSmall();
  
  return { mlkem, frodokem, mceliece };
}

export async function createKEMFull(): Promise<PQKeyEncapsulation> {
  const mlkem = await initMlkem();
  const frodokem = await initFrodokem();
  const mceliece = await initMcElieceFull();
  
  return { mlkem, frodokem, mceliece };
}

// Cleanup functions for individual modules
export function cleanupSignatures(): void {
  cleanupDilithium();
  cleanupSphincs();
  cleanupFalcon();
}

export function cleanupKEM(): void {
  cleanupMlkem();
  cleanupFrodokem();
  cleanupMcElieceSmall();
}

export function cleanupKEMFull(): void {
  cleanupMlkem();
  cleanupFrodokem();
  cleanupMcElieceFull();
}

// Export individual module functions for advanced usage
export {
  initDilithium,
  initSphincs,
  initFalcon,
  initMlkem,
  initFrodokem,
  initMcElieceSmall,
  initMcElieceFull,
  cleanupDilithium,
  cleanupSphincs,
  cleanupFalcon,
  cleanupMlkem,
  cleanupFrodokem,
  cleanupMcElieceSmall,
  cleanupMcElieceFull
};