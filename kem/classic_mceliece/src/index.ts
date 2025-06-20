import * as fs from 'fs';
import * as path from 'path';
const createMcElieceFull = require('./classic_mceliece_wrapper.js');
const createMcElieceSmall = require('./classic_mceliece_wrapper_small.js');

const smallVariantNames: string[] = [
  'classic_mceliece_348864',
  'classic_mceliece_348864f',
  'classic_mceliece_460896',
  'classic_mceliece_460896f'
];

const fullVariantNames: string[] = [
  ...smallVariantNames,
  'classic_mceliece_6688128',
  'classic_mceliece_6688128f',
  'classic_mceliece_6960119',
  'classic_mceliece_6960119f',
  'classic_mceliece_8192128',
  'classic_mceliece_8192128f'
];

let smallModuleInstance: any = null;
let smallWrappers: Record<string, any> | null = null;
let fullModuleInstance: any = null;
let fullWrappers: Record<string, any> | null = null;

async function createMcElieceWrapper(variant: string, createModule: () => Promise<any>): Promise<any> {
  const Module: any = await createModule();
  const initResult: number = Module[`_init_${variant}`]();
  if (initResult !== 1) throw new Error(`Failed to initialize McEliece variant: ${variant}`);
  const pubLen: number = Module[`_${variant}_get_public_key_length`]();
  const secLen: number = Module[`_${variant}_get_secret_key_length`]();
  const ctLen: number = Module[`_${variant}_get_ciphertext_length`]();
  const ssLen: number = Module[`_${variant}_get_shared_secret_length`]();
  
  function copyMemory(ptr: number, length: number): Uint8Array | null {
    if (!ptr || !length) return null;
    return new Uint8Array(Module.HEAPU8.slice(ptr, ptr + length));
  }
  function writeMemory(data: Uint8Array, ptr: number) {
    if (!ptr || !data) return;
    Module.HEAPU8.set(data, ptr);
  }
  
  return {
    generateKeypair(): { publicKey: Uint8Array | null, secretKey: Uint8Array | null } {
      const pkPtr: number = Module._malloc(pubLen);
      const skPtr: number = Module._malloc(secLen);
      try {
        const result: number = Module[`_${variant}_keypair`](pkPtr, skPtr);
        if (result !== 0) throw new Error('Keypair generation failed');
        return {
          publicKey: copyMemory(pkPtr, pubLen),
          secretKey: copyMemory(skPtr, secLen)
        };
      } finally {
        Module._free(pkPtr);
        Module._free(skPtr);
      }
    },
    encapsulate(publicKey: Uint8Array): { ciphertext: Uint8Array | null, sharedSecret: Uint8Array | null } {
      const pkPtr: number = Module._malloc(pubLen);
      writeMemory(publicKey, pkPtr);
      const ctPtr: number = Module._malloc(ctLen);
      const ssPtr: number = Module._malloc(ssLen);
      try {
        const result: number = Module[`_${variant}_encaps`](ctPtr, ssPtr, pkPtr);
        if (result !== 0) throw new Error('Encapsulation failed');
        return {
          ciphertext: copyMemory(ctPtr, ctLen),
          sharedSecret: copyMemory(ssPtr, ssLen)
        };
      } finally {
        Module._free(pkPtr);
        Module._free(ctPtr);
        Module._free(ssPtr);
      }
    },
    decapsulate(ciphertext: Uint8Array, secretKey: Uint8Array): Uint8Array | null {
      const ctPtr: number = Module._malloc(ctLen);
      writeMemory(ciphertext, ctPtr);
      const skPtr: number = Module._malloc(secLen);
      writeMemory(secretKey, skPtr);
      const ssPtr: number = Module._malloc(ssLen);
      try {
        const result: number = Module[`_${variant}_decaps`](ssPtr, ctPtr, skPtr);
        if (result !== 0) throw new Error('Decapsulation failed');
        return copyMemory(ssPtr, ssLen);
      } finally {
        Module._free(ctPtr);
        Module._free(skPtr);
        Module._free(ssPtr);
      }
    },
    getPublicKeyLength: (): number => pubLen,
    getSecretKeyLength: (): number => secLen,
    getCiphertextLength: (): number => ctLen,
    getSharedSecretLength: (): number => ssLen
  };
}

async function initSmall(): Promise<Record<string, any>> {
  if (smallWrappers) return smallWrappers;
  if (!smallModuleInstance) {
    const moduleOverrides = {
      wasmBinary: fs.readFileSync(path.join(__dirname, 'classic_mceliece_wrapper_small.wasm')),
    };
    smallModuleInstance = await createMcElieceSmall(moduleOverrides);
  }
  smallWrappers = {} as Record<string, any>;
  for (const variant of smallVariantNames) {
    smallWrappers[variant] = await createMcElieceWrapper(variant, createMcElieceSmall);
  }
  return smallWrappers;
}

async function initFull(): Promise<Record<string, any>> {
  if (fullWrappers) return fullWrappers;
  if (!fullModuleInstance) {
    const moduleOverrides = {
      wasmBinary: fs.readFileSync(path.join(__dirname, 'classic_mceliece_wrapper.wasm')),
    };
    fullModuleInstance = await createMcElieceFull(moduleOverrides);
  }
  fullWrappers = {} as Record<string, any>;
  for (const variant of fullVariantNames) {
    fullWrappers[variant] = await createMcElieceWrapper(variant, createMcElieceFull);
  }
  return fullWrappers;
}

function cleanupSmall(): void {
  smallModuleInstance = null;
  smallWrappers = null;
}

function cleanupFull(): void {
  fullModuleInstance = null;
  fullWrappers = null;
}

module.exports = { initSmall, initFull, cleanupSmall, cleanupFull };