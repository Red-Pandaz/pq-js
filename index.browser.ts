// Browser-specific entry point for pq-js
// This version handles WASM loading via fetch instead of 
// .readFileSync

// Import browser-specific wrappers
import { initDilithium as initDilithiumBrowser, cleanupDilithium } from './sig/dilithium/src-browser';

// Static imports for other WASM JS wrappers (these will need browser versions too)
import sphincsWrapper from './dist/sig/sphincs_wrapper.js';
import falconWrapper from './dist/sig/falcon_wrapper.js';
import mlkemWrapper from './dist/kem/mlkem_wrapper.js';
import frodokemWrapper from './dist/kem/frodokem_wrapper.js';
import mcelieceWrapper from './dist/kem/classic_mceliece_wrapper_small.js';

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

// Browser-compatible WASM module loader
async function loadWasmModule(moduleName: string): Promise<any> {
  const moduleArg = {
    locateFile: (path: string) => {
      if (path.endsWith('.wasm')) {
        return `./dist/${moduleName}.wasm`;
      }
      return path;
    }
  };

  switch (moduleName) {
    case 'sig/sphincs_wrapper':
      return await sphincsWrapper(moduleArg);
    case 'sig/falcon_wrapper':
      return await falconWrapper(moduleArg);
    case 'kem/mlkem_wrapper':
      return await mlkemWrapper(moduleArg);
    case 'kem/frodokem_wrapper':
      return await frodokemWrapper(moduleArg);
    case 'kem/classic_mceliece_wrapper_small':
      return await mcelieceWrapper(moduleArg);
    default:
      throw new Error(`Unknown module: ${moduleName}`);
  }
}

// Browser-compatible initialization function
export async function createPQ(): Promise<PQFull> {
  try {
    // Initialize Dilithium using the new browser wrapper
    const dilithium = await initDilithiumBrowser();
    
    // Load other WASM modules (these will need browser versions too)
    const sphincsModule = await loadWasmModule('sig/sphincs_wrapper');
    const falconModule = await loadWasmModule('sig/falcon_wrapper');
    const mlkemModule = await loadWasmModule('kem/mlkem_wrapper');
    const frodokemModule = await loadWasmModule('kem/frodokem_wrapper');
    const mcelieceModule = await loadWasmModule('kem/classic_mceliece_wrapper_small');

    // Initialize other signature schemes (placeholder for now)
    const sphincs = {};
    const falcon = {};
    
    // Initialize KEM schemes (placeholder for now)
    const mlkem = {};
    const frodokem = {};
    const mceliece = {};

    return {
      signatures: { dilithium, sphincs, falcon },
      kem: { mlkem, frodokem, mceliece }
    };
  } catch (error) {
    console.error('Failed to initialize PQ library:', error);
    throw error;
  }
}

export function cleanupPQ(): void {
  cleanupDilithium();
  // Add cleanup for other algorithms when they have browser wrappers
}

export function cleanupPQFull(): void {
  cleanupPQ();
}

export async function createSignatures(): Promise<PQSignatures> {
  const pq = await createPQ();
  return pq.signatures;
}

export async function createKEM(): Promise<PQKeyEncapsulation> {
  const pq = await createPQ();
  return pq.kem;
}

export async function createKEMFull(): Promise<PQKeyEncapsulation> {
  const pq = await createPQ();
  return pq.kem;
}

export function cleanupSignatures(): void {
  cleanupDilithium();
}
export function cleanupKEM(): void {}
export function cleanupKEMFull(): void {}

// Export the browser-specific init functions
export const initDilithium = initDilithiumBrowser;
export const initSphincs = () => Promise.resolve({});
export const initFalcon = () => Promise.resolve({});
export const initMlkem = () => Promise.resolve({});
export const initFrodokem = () => Promise.resolve({});
export const initMcElieceSmall = () => Promise.resolve({});
export const initMcElieceFull = () => Promise.resolve({});
export const cleanupSphincs = () => {};
export const cleanupFalcon = () => {};
export const cleanupMlkem = () => {};
export const cleanupFrodokem = () => {};
export const cleanupMcElieceSmall = () => {};
export const cleanupMcElieceFull = () => {}; 