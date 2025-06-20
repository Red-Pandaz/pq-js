import * as fs from 'fs';
import * as path from 'path';
const createFrodoKEMModule = require('./frodokem_wrapper.js');

const frodokemVariantNames: string[] = [
  'frodokem_640_aes',
  'frodokem_640_shake',
  'frodokem_976_aes',
  'frodokem_976_shake',
  'frodokem_1344_aes',
  'frodokem_1344_shake'
];

let frodokemModuleInstance: any = null;
let frodokemWrappers: Record<string, any> | null = null;

async function createFrodoKEMWrapper(variant: string): Promise<any> {
  const Module: any = await createFrodoKEMModule();

  const initResult: number = Module[`_init_${variant}`]();
  if (initResult !== 1) throw new Error(`Failed to initialize FrodoKEM variant: ${variant}`);

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

async function initFrodokem(): Promise<Record<string, any>> {
  if (frodokemWrappers) return frodokemWrappers;
  if (!frodokemModuleInstance) {
    const moduleOverrides = {
      wasmBinary: fs.readFileSync(path.join(__dirname, 'frodokem_wrapper.wasm')),
    };
    frodokemModuleInstance = await createFrodoKEMModule(moduleOverrides);
  }
  frodokemWrappers = {} as Record<string, any>;
  for (const variant of frodokemVariantNames) {
    frodokemWrappers[variant] = await createFrodoKEMWrapper(variant);
  }
  return frodokemWrappers;
}

function cleanupFrodokem(): void {
  frodokemModuleInstance = null;
  frodokemWrappers = null;
}

module.exports = { init: initFrodokem, cleanup: cleanupFrodokem };