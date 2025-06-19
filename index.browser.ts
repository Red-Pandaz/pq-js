// Browser-specific entry point for pq-js
// This version handles WASM loading via fetch instead of fs.readFileSync

// Static imports for all WASM JS wrappers
import dilithiumWrapper from './dist/sig/dilithium_wrapper.js';
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
    case 'sig/dilithium_wrapper':
      return await dilithiumWrapper(moduleArg);
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
    // Load all WASM modules
    const dilithiumModule = await loadWasmModule('sig/dilithium_wrapper');
    const sphincsModule = await loadWasmModule('sig/sphincs_wrapper');
    const falconModule = await loadWasmModule('sig/falcon_wrapper');
    const mlkemModule = await loadWasmModule('kem/mlkem_wrapper');
    const frodokemModule = await loadWasmModule('kem/frodokem_wrapper');
    const mcelieceModule = await loadWasmModule('kem/classic_mceliece_wrapper_small');

    // Initialize Dilithium
    const dilithium = await createDilithiumWrappers(dilithiumModule);
    
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

// Create Dilithium wrappers similar to the Node.js implementation
async function createDilithiumWrappers(Module: any): Promise<Record<string, any>> {
  // Initialize all variants
  const initResult: number = Module._init_dilithium_variants();
  
  if (initResult !== 1) {
    throw new Error('Failed to initialize dilithium variants');
  }

  const dilithium2 = createDilithiumWrapper(Module, 2);
  const dilithium3 = createDilithiumWrapper(Module, 3);
  const dilithium5 = createDilithiumWrapper(Module, 5);

  return { dilithium2, dilithium3, dilithium5 };
}

function createDilithiumWrapper(Module: any, algNum: number): any {
  // Get lengths before creating wrapper
  const pubLen: number = Module[`_dilithium${algNum}_get_public_key_length`]();
  const secLen: number = Module[`_dilithium${algNum}_get_secret_key_length`]();
  const maxSigLen: number = Module[`_dilithium${algNum}_get_signature_length`]();

  // Helper function to check OQS status codes
  function checkOQSStatus(result: number, operation: string) {
    if (result !== 0) {
      throw new Error(`${operation} failed with OQS status code: ${result}`);
    }
  }

  // Helper function to safely copy memory
  function copyMemory(ptr: number, length: number): Uint8Array | null {
    if (!ptr || !length) return null;
    if (!Module.HEAPU8) throw new Error('WASM memory not initialized');
    if ((ptr + length) > Module.HEAPU8.length) {
      throw new Error(`Buffer overflow: trying to read ${length} bytes at ${ptr}, but HEAPU8 length is ${Module.HEAPU8.length}`);
    }
    // Make a true copy, not a view!
    return new Uint8Array(Module.HEAPU8.slice(ptr, ptr + length));
  }

  // Helper function to safely write memory
  function writeMemory(data: Uint8Array, ptr: number) {
    if (!ptr || !data) return;
    if (!Module.HEAPU8) throw new Error('HEAPU8 is undefined before write');
    if ((ptr + data.length) > Module.HEAPU8.length) {
      throw new Error(`Buffer overflow: trying to write ${data.length} bytes at ${ptr}, but HEAPU8 length is ${Module.HEAPU8.length}`);
    }
    Module.HEAPU8.set(data, ptr);
  }

  return {
    generateKeypair(): { publicKey: Uint8Array, secretKey: Uint8Array } {
      // Ensure memory is initialized
      if (!Module.HEAPU8) {
        throw new Error('WASM memory not initialized');
      }
      // Allocate memory
      const pkPtr: number = Module._malloc(pubLen);
      if (!pkPtr) throw new Error('Failed to allocate memory for public key');
      const skPtr: number = Module._malloc(secLen);
      if (!skPtr) throw new Error('Failed to allocate memory for secret key');
      try {
        if (!pkPtr || !skPtr) {
          throw new Error('Failed to allocate memory for keypair');
        }
        // Call the keypair function directly from the module
        const result: number = Module[`_dilithium${algNum}_keypair`](pkPtr, skPtr);
        checkOQSStatus(result, 'Keypair generation');
        // Create copies of the data before freeing the memory
        const publicKey: Uint8Array | null = copyMemory(pkPtr, pubLen);
        const secretKey: Uint8Array | null = copyMemory(skPtr, secLen);
        if (!publicKey || !secretKey) {
          throw new Error('Failed to copy keypair data');
        }
        return { publicKey, secretKey };
      } finally {
        if (pkPtr) Module._free(pkPtr);
        if (skPtr) Module._free(skPtr);
      }
    },

    sign(message: Uint8Array | string, secretKey: Uint8Array): Uint8Array {
      // Ensure memory is initialized
      if (!Module.HEAPU8) {
        throw new Error('WASM memory not initialized');
      }
      const msgBytes: Uint8Array = typeof message === 'string' ? new TextEncoder().encode(message) : message;
      if (secretKey.length !== secLen) {
        throw new Error(`Invalid secret key length. Expected ${secLen}, got ${secretKey.length}`);
      }
      // Allocate memory
      const mPtr: number = Module._malloc(msgBytes.length);
      if (!mPtr) throw new Error('Failed to allocate message buffer');
      writeMemory(msgBytes, mPtr);
      const skPtr: number = Module._malloc(secretKey.length);
      if (!skPtr) throw new Error('Failed to allocate secret key buffer');
      writeMemory(secretKey, skPtr);
      const sigPtr: number = Module._malloc(maxSigLen);
      if (!sigPtr) throw new Error('Failed to allocate signature buffer');
      const sigLenPtr: number = Module._malloc(4);
      if (!sigLenPtr) throw new Error('Failed to allocate signature length buffer');
      Module.HEAPU32[sigLenPtr >> 2] = maxSigLen;
      try {
        const result: number = Module[`_dilithium${algNum}_sign`](
          sigPtr, 
          sigLenPtr, 
          mPtr, 
          msgBytes.length, 
          skPtr
        );
        checkOQSStatus(result, 'Signing');
        const sigLen: number = Module.HEAPU32[sigLenPtr >> 2];
        if (sigLen > maxSigLen) {
          throw new Error(`Signature length ${sigLen} exceeds maximum ${maxSigLen}`);
        }
        // Create a copy of the signature data
        const signature: Uint8Array | null = copyMemory(sigPtr, sigLen);
        if (!signature) {
          throw new Error('Failed to copy signature data');
        }
        return signature;
      } finally {
        Module._free(mPtr);
        Module._free(skPtr);
        Module._free(sigPtr);
        Module._free(sigLenPtr);
      }
    },

    verify(message: Uint8Array | string, signature: Uint8Array, publicKey: Uint8Array): boolean {
      // Ensure memory is initialized
      if (!Module.HEAPU8) {
        throw new Error('WASM memory not initialized');
      }
      const msgBytes: Uint8Array = typeof message === 'string' ? new TextEncoder().encode(message) : message;
      // Allocate memory
      const mPtr: number = Module._malloc(msgBytes.length);
      if (!mPtr) throw new Error('Failed to allocate message buffer');
      writeMemory(msgBytes, mPtr);
      const sigPtr: number = Module._malloc(signature.length);
      if (!sigPtr) throw new Error('Failed to allocate signature buffer');
      writeMemory(signature, sigPtr);
      const pkPtr: number = Module._malloc(publicKey.length);
      if (!pkPtr) throw new Error('Failed to allocate public key buffer');
      writeMemory(publicKey, pkPtr);
      try {
        const result: number = Module[`_dilithium${algNum}_verify`](mPtr, msgBytes.length, sigPtr, signature.length, pkPtr);
        return result === 0;
      } finally {
        Module._free(mPtr);
        Module._free(sigPtr);
        Module._free(pkPtr);
      }
    },

    getPublicKeyLength: (): number => pubLen,
    getSecretKeyLength: (): number => secLen,
    getSignatureLength: (): number => maxSigLen,
  };
}

export function cleanupPQ(): void {
  // No cleanup needed for browser version
}

export function cleanupPQFull(): void {
  // No cleanup needed for browser version
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

export function cleanupSignatures(): void {}
export function cleanupKEM(): void {}
export function cleanupKEMFull(): void {}

// Export placeholder functions
export const initDilithium = () => Promise.resolve({});
export const initSphincs = () => Promise.resolve({});
export const initFalcon = () => Promise.resolve({});
export const initMlkem = () => Promise.resolve({});
export const initFrodokem = () => Promise.resolve({});
export const initMcElieceSmall = () => Promise.resolve({});
export const initMcElieceFull = () => Promise.resolve({});
export const cleanupDilithium = () => {};
export const cleanupSphincs = () => {};
export const cleanupFalcon = () => {};
export const cleanupMlkem = () => {};
export const cleanupFrodokem = () => {};
export const cleanupMcElieceSmall = () => {};
export const cleanupMcElieceFull = () => {}; 