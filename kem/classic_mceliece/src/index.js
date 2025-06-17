const createMcElieceFull = require('../dist/classic_mceliece_wrapper.js');
const createMcElieceSmall = require('../dist/classic_mceliece_wrapper_small.js');

const smallVariantNames = [
  'classic_mceliece_348864',
  'classic_mceliece_348864f',
  'classic_mceliece_460896',
  'classic_mceliece_460896f'
];

const fullVariantNames = [
  ...smallVariantNames,
  'classic_mceliece_6688128',
  'classic_mceliece_6688128f',
  'classic_mceliece_6960119',
  'classic_mceliece_6960119f',
  'classic_mceliece_8192128',
  'classic_mceliece_8192128f'
];

let smallModuleInstance = null;
let smallWrappers = null;
let fullModuleInstance = null;
let fullWrappers = null;

async function createMcElieceWrapper(variant, createModule) {
  const Module = await createModule();
  const initResult = Module[`_init_${variant}`]();
  if (initResult !== 1) throw new Error(`Failed to initialize McEliece variant: ${variant}`);
  const pubLen = Module[`_${variant}_get_public_key_length`]();
  const secLen = Module[`_${variant}_get_secret_key_length`]();
  const ctLen = Module[`_${variant}_get_ciphertext_length`]();
  const ssLen = Module[`_${variant}_get_shared_secret_length`]();
  function copyMemory(ptr, length) {
    if (!ptr || !length) return null;
    return new Uint8Array(Module.HEAPU8.slice(ptr, ptr + length));
  }
  function writeMemory(data, ptr) {
    if (!ptr || !data) return;
    Module.HEAPU8.set(data, ptr);
  }
  return {
    generateKeypair() {
      const pkPtr = Module._malloc(pubLen);
      const skPtr = Module._malloc(secLen);
      try {
        const result = Module[`_${variant}_keypair`](pkPtr, skPtr);
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
    encapsulate(publicKey) {
      const pkPtr = Module._malloc(pubLen);
      writeMemory(publicKey, pkPtr);
      const ctPtr = Module._malloc(ctLen);
      const ssPtr = Module._malloc(ssLen);
      try {
        const result = Module[`_${variant}_encaps`](ctPtr, ssPtr, pkPtr);
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
    decapsulate(ciphertext, secretKey) {
      const ctPtr = Module._malloc(ctLen);
      writeMemory(ciphertext, ctPtr);
      const skPtr = Module._malloc(secLen);
      writeMemory(secretKey, skPtr);
      const ssPtr = Module._malloc(ssLen);
      try {
        const result = Module[`_${variant}_decaps`](ssPtr, ctPtr, skPtr);
        if (result !== 0) throw new Error('Decapsulation failed');
        return copyMemory(ssPtr, ssLen);
      } finally {
        Module._free(ctPtr);
        Module._free(skPtr);
        Module._free(ssPtr);
      }
    },
    getPublicKeyLength: () => pubLen,
    getSecretKeyLength: () => secLen,
    getCiphertextLength: () => ctLen,
    getSharedSecretLength: () => ssLen
  };
}

async function initSmall() {
  if (smallWrappers) return smallWrappers;
  if (!smallModuleInstance) smallModuleInstance = await createMcElieceSmall();
  smallWrappers = {};
  for (const variant of smallVariantNames) {
    smallWrappers[variant] = await createMcElieceWrapper(variant, createMcElieceSmall);
  }
  return smallWrappers;
}

async function initFull() {
  if (fullWrappers) return fullWrappers;
  if (!fullModuleInstance) fullModuleInstance = await createMcElieceFull();
  fullWrappers = {};
  for (const variant of fullVariantNames) {
    fullWrappers[variant] = await createMcElieceWrapper(variant, createMcElieceFull);
  }
  return fullWrappers;
}

function cleanupSmall() {
  smallModuleInstance = null;
  smallWrappers = null;
}

function cleanupFull() {
  fullModuleInstance = null;
  fullWrappers = null;
}

module.exports = { initSmall, initFull, cleanupSmall, cleanupFull };