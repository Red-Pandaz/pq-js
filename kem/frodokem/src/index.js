const createFrodoKEMModule = require('../dist/frodokem_wrapper.js');

const variantNames = [
  'frodokem_640_aes',
  'frodokem_640_shake',
  'frodokem_976_aes',
  'frodokem_976_shake',
  'frodokem_1344_aes',
  'frodokem_1344_shake'
];

let moduleInstance = null;
let wrappers = null;

async function createFrodoKEMWrapper(variant) {
  const Module = await createFrodoKEMModule();

  const initResult = Module[`_init_${variant}`]();
  if (initResult !== 1) throw new Error(`Failed to initialize FrodoKEM variant: ${variant}`);

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

async function init() {
  if (wrappers) return wrappers;
  if (!moduleInstance) moduleInstance = await createFrodoKEMModule();
  wrappers = {};
  for (const variant of variantNames) {
    wrappers[variant] = await createFrodoKEMWrapper(variant);
  }
  return wrappers;
}

function cleanup() {
  moduleInstance = null;
  wrappers = null;
}

module.exports = { init, cleanup };