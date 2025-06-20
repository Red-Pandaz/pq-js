// Browser-specific entry point for pq-js
// This version handles WASM loading via fetch instead of 
// .readFileSync

// Import browser-specific wrappers
import { initDilithium as initDilithiumBrowser, cleanupDilithium } from 'sig/dilithium/src-browser';
import { initFalcon as initFalconBrowser, cleanupFalcon } from 'sig/falcon/src-browser';
import { initSphincs as initSphincsBrowser, cleanupSphincs as cleanupSphincsBrowser } from 'sig/sphincs/src-browser';
import { initMlkem as initMlkemBrowser, cleanupMlkem as cleanupMlkemBrowser } from 'kem/mlkem/src-browser';
import { initFrodokem as initFrodokemBrowser, cleanupFrodokem as cleanupFrodokemBrowser } from 'kem/frodokem/src-browser';
import { init as initMcElieceBrowser, cleanup as cleanupMcElieceBrowser } from 'kem/classic_mceliece/src-browser';

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
    
    // Initialize Falcon using the new browser wrapper
    const falcon = await initFalconBrowser();
    
    // Initialize SPHINCS+ using the new browser wrapper
    const sphincs = await initSphincsBrowser();
    
    // Initialize KEM algorithms
    const mlkem = await initMlkemBrowser();
    const frodokem = await initFrodokemBrowser();
    const mceliece = await initMcElieceBrowser();

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
  cleanupFalcon();
  cleanupSphincsBrowser();
  cleanupMlkemBrowser();
  cleanupFrodokemBrowser();
  cleanupMcElieceBrowser();
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
  cleanupFalcon();
  cleanupSphincsBrowser();
}

export function cleanupKEM(): void {
  cleanupMlkemBrowser();
  cleanupFrodokemBrowser();
  cleanupMcElieceBrowser();
}

export function cleanupKEMFull(): void {
  cleanupMlkemBrowser();
  cleanupFrodokemBrowser();
  cleanupMcElieceBrowser();
}

// Export the browser-specific init functions
export const initDilithium = initDilithiumBrowser;
export const initFalcon = initFalconBrowser;
export const initSphincs = initSphincsBrowser;
export const initMlkem = initMlkemBrowser;
export const initFrodokem = initFrodokemBrowser;
export const initMcEliece = initMcElieceBrowser;
export const cleanupSphincs = cleanupSphincsBrowser;
export const cleanupMlkem = cleanupMlkemBrowser;
export const cleanupFrodokem = cleanupFrodokemBrowser;
export const cleanupMcEliece = cleanupMcElieceBrowser; 