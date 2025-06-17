const createFalconModule = require('../dist/falcon_wrapper.js');

let moduleInstance = null;
let wrappers = null;

const variantNames = [
  'falcon_512',
  'falcon_1024'
];

async function createFalconWrapper(variant) {
  const Module = await createFalconModule();

  // Call the correct init function for this variant
  const initResult = Module[`_init_${variant}`]();
  if (initResult !== 1) {
    throw new Error(`Failed to initialize Falcon variant: ${variant}`);
  }

  const pubLen = Module[`_${variant}_get_public_key_length`]();
  const secLen = Module[`_${variant}_get_secret_key_length`]();
  const maxSigLen = Module[`_${variant}_get_signature_length`]();

  function checkOQSStatus(result, operation) {
    if (result !== 0) {
      throw new Error(`${operation} failed with OQS status code: ${result}`);
    }
  }

  function copyMemory(ptr, length) {
    if (!ptr || !length) return null;
    if (!Module.HEAPU8) throw new Error('WASM memory not initialized');
    if ((ptr + length) > Module.HEAPU8.length) {
      throw new Error(`Buffer overflow: trying to read ${length} bytes at ${ptr}, but HEAPU8 length is ${Module.HEAPU8.length}`);
    }
    return new Uint8Array(Module.HEAPU8.slice(ptr, ptr + length));
  }

  function writeMemory(data, ptr) {
    if (!ptr || !data) return;
    if (!Module.HEAPU8) throw new Error('HEAPU8 is undefined before write');
    if ((ptr + data.length) > Module.HEAPU8.length) {
      throw new Error(`Buffer overflow: trying to write ${data.length} bytes at ${ptr}, but HEAPU8 length is ${Module.HEAPU8.length}`);
    }
    Module.HEAPU8.set(data, ptr);
  }

  return {
    generateKeypair() {
      if (!Module.HEAPU8) throw new Error('WASM memory not initialized');
      const pkPtr = Module._malloc(pubLen);
      if (!pkPtr) throw new Error('Failed to allocate memory for public key');
      const skPtr = Module._malloc(secLen);
      if (!skPtr) throw new Error('Failed to allocate memory for secret key');
      try {
        const result = Module[`_${variant}_keypair`](pkPtr, skPtr);
        checkOQSStatus(result, 'Keypair generation');
        const publicKey = copyMemory(pkPtr, pubLen);
        const secretKey = copyMemory(skPtr, secLen);
        if (!publicKey || !secretKey) throw new Error('Failed to copy keypair data');
        return { publicKey, secretKey };
      } finally {
        Module._free(pkPtr);
        Module._free(skPtr);
      }
    },

    sign(message, secretKey) {
      if (!Module.HEAPU8) throw new Error('WASM memory not initialized');
      const msgBytes = typeof message === 'string' ? new TextEncoder().encode(message) : message;
      if (secretKey.length !== secLen) {
        throw new Error(`Invalid secret key length. Expected ${secLen}, got ${secretKey.length}`);
      }
      const mPtr = Module._malloc(msgBytes.length);
      if (!mPtr) throw new Error('Failed to allocate message buffer');
      writeMemory(msgBytes, mPtr);
      const skPtr = Module._malloc(secretKey.length);
      if (!skPtr) throw new Error('Failed to allocate secret key buffer');
      writeMemory(secretKey, skPtr);
      const sigPtr = Module._malloc(maxSigLen);
      if (!sigPtr) throw new Error('Failed to allocate signature buffer');
      const sigLenPtr = Module._malloc(4);
      if (!sigLenPtr) throw new Error('Failed to allocate signature length buffer');
      Module.HEAPU32[sigLenPtr >> 2] = maxSigLen;
      try {
        const result = Module[`_${variant}_sign`](
          sigPtr,
          sigLenPtr,
          mPtr,
          msgBytes.length,
          skPtr
        );
        checkOQSStatus(result, 'Signing');
        const sigLen = Module.HEAPU32[sigLenPtr >> 2];
        if (sigLen > maxSigLen) throw new Error(`Signature length ${sigLen} exceeds maximum ${maxSigLen}`);
        const signature = copyMemory(sigPtr, sigLen);
        if (!signature) throw new Error('Failed to copy signature data');
        return signature;
      } finally {
        Module._free(mPtr);
        Module._free(skPtr);
        Module._free(sigPtr);
        Module._free(sigLenPtr);
      }
    },

    verify(message, signature, publicKey) {
      if (!Module.HEAPU8) throw new Error('WASM memory not initialized');
      const msgBytes = typeof message === 'string' ? new TextEncoder().encode(message) : message;
      const mPtr = Module._malloc(msgBytes.length);
      if (!mPtr) throw new Error('Failed to allocate message buffer');
      writeMemory(msgBytes, mPtr);
      const sigPtr = Module._malloc(signature.length);
      if (!sigPtr) throw new Error('Failed to allocate signature buffer');
      writeMemory(signature, sigPtr);
      const pkPtr = Module._malloc(publicKey.length);
      if (!pkPtr) throw new Error('Failed to allocate public key buffer');
      writeMemory(publicKey, pkPtr);
      try {
        const result = Module[`_${variant}_verify`](mPtr, msgBytes.length, sigPtr, signature.length, pkPtr);
        return result === 0;
      } finally {
        Module._free(mPtr);
        Module._free(sigPtr);
        Module._free(pkPtr);
      }
    },

    getPublicKeyLength: () => pubLen,
    getSecretKeyLength: () => secLen,
    getSignatureLength: () => maxSigLen,
  };
}

async function init() {
  if (wrappers) return wrappers;
  if (!moduleInstance) moduleInstance = await createFalconModule();

  wrappers = {};
  for (const variant of variantNames) {
    wrappers[variant] = await createFalconWrapper(variant);
  }
  return wrappers;
}

function cleanup() {
  moduleInstance = null;
  wrappers = null;
}

module.exports = { init, cleanup };