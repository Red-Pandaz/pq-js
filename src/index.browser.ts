// Browser-specific entry point for pq-js
// This version handles WASM loading via fetch instead of 
// .readFileSync

// Import browser-specific wrappers
import { initDilithium as initDilithiumBrowser, cleanupDilithium } from 'sig/dilithium/src-browser';

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

// Browser-compatible initialization function
export async function createPQ(): Promise<PQFull> {
  try {
    // Initialize Dilithium using the new browser wrapper
    const dilithium = await initDilithiumBrowser();
    
    // Placeholder for other algorithms until browser wrappers are available
    const sphincs = {};
    const falcon = {};
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