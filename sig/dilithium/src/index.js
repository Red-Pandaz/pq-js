const createDilithiumModule = require('../dist/dilithium_wrapper.js');

let moduleInstance = null;
let wrappers = null;

async function createDilithiumWrapper(algNum) {
  const Module = await createDilithiumModule();

  // Initialize all variants
  const initResult = Module._init_dilithium_variants();
  
  if (initResult !== 1) {
    throw new Error('Failed to initialize dilithium variants');
  }

  // Get lengths before creating wrapper
  const pubLen = Module[`_dilithium${algNum}_get_public_key_length`]();
  const secLen = Module[`_dilithium${algNum}_get_secret_key_length`]();
  const maxSigLen = Module[`_dilithium${algNum}_get_signature_length`]();

  // Helper function to check OQS status codes
  function checkOQSStatus(result, operation) {
    if (result !== 0) {
      throw new Error(`${operation} failed with OQS status code: ${result}`);
    }
  }

  // Helper function to safely copy memory
  function copyMemory(ptr, length) {
    if (!ptr || !length) return null;
    if (!Module.HEAPU8) throw new Error('WASM memory not initialized');
    if ((ptr + length) > Module.HEAPU8.length) {
      throw new Error(`Buffer overflow: trying to read ${length} bytes at ${ptr}, but HEAPU8 length is ${Module.HEAPU8.length}`);
    }
    // Make a true copy, not a view!
    return new Uint8Array(Module.HEAPU8.slice(ptr, ptr + length));
  }

  // Helper function to safely write memory
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
      // Ensure memory is initialized
      if (!Module.HEAPU8) {
        throw new Error('WASM memory not initialized');
      }
      // Allocate memory
      const pkPtr = Module._malloc(pubLen);
      if (!pkPtr) throw new Error('Failed to allocate memory for public key');
      const skPtr = Module._malloc(secLen);
      if (!skPtr) throw new Error('Failed to allocate memory for secret key');
      try {
        if (!pkPtr || !skPtr) {
          throw new Error('Failed to allocate memory for keypair');
        }
        // Call the keypair function directly from the module
        const result = Module[`_dilithium${algNum}_keypair`](pkPtr, skPtr);
        checkOQSStatus(result, 'Keypair generation');
        // Create copies of the data before freeing the memory
        const publicKey = copyMemory(pkPtr, pubLen);
        const secretKey = copyMemory(skPtr, secLen);
        if (!publicKey || !secretKey) {
          throw new Error('Failed to copy keypair data');
        }
        return { publicKey, secretKey };
      } finally {
        if (pkPtr) Module._free(pkPtr);
        if (skPtr) Module._free(skPtr);
      }
    },

    sign(message, secretKey) {
      // Ensure memory is initialized
      if (!Module.HEAPU8) {
        throw new Error('WASM memory not initialized');
      }
      const msgBytes = typeof message === 'string' ? new TextEncoder().encode(message) : message;
      if (secretKey.length !== secLen) {
        throw new Error(`Invalid secret key length. Expected ${secLen}, got ${secretKey.length}`);
      }
      // Allocate memory
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
        const result = Module[`_dilithium${algNum}_sign`](
          sigPtr, 
          sigLenPtr, 
          mPtr, 
          msgBytes.length, 
          skPtr
        );
        checkOQSStatus(result, 'Signing');
        const sigLen = Module.HEAPU32[sigLenPtr >> 2];
        if (sigLen > maxSigLen) {
          throw new Error(`Signature length ${sigLen} exceeds maximum ${maxSigLen}`);
        }
        // Create a copy of the signature data
        const signature = copyMemory(sigPtr, sigLen);
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

    verify(message, signature, publicKey) {
      // Ensure memory is initialized
      if (!Module.HEAPU8) {
        throw new Error('WASM memory not initialized');
      }
      const msgBytes = typeof message === 'string' ? new TextEncoder().encode(message) : message;
      // Allocate memory
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
        const result = Module[`_dilithium${algNum}_verify`](mPtr, msgBytes.length, sigPtr, signature.length, pkPtr);
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
  if (wrappers) {
    return wrappers;
  }

  if (!moduleInstance) {
    moduleInstance = await createDilithiumModule();

    // Verify that the module is properly initialized
    if (!moduleInstance || typeof moduleInstance._init_dilithium_variants !== 'function') {
      console.error('[Debug] Module instance:', moduleInstance);
      throw new Error('WASM module not properly initialized - missing required functions');
    }
    if (!moduleInstance.HEAPU8 || typeof moduleInstance._malloc !== 'function') {
      console.error('[Debug] WASM memory or malloc not initialized:', moduleInstance);
      throw new Error('WASM memory or malloc not properly initialized');
    }
  }

  try {
    const dilithium2 = await createDilithiumWrapper(2);
    const dilithium3 = await createDilithiumWrapper(3);
    const dilithium5 = await createDilithiumWrapper(5);

    wrappers = { dilithium2, dilithium3, dilithium5 };
    return wrappers;
  } catch (error) {
    console.error('[Debug] Error creating wrappers:', error);
    throw error;
  }
}

// Cleanup function to free resources
function cleanup() {
  if (moduleInstance) {
    try {
      if (typeof moduleInstance._free_dilithium_variants === 'function') {
        moduleInstance._free_dilithium_variants();
      } else {
        console.warn('[Debug] _free_dilithium_variants not found in module');
      }
    } catch (error) {
      console.error('[Debug] Error during cleanup:', error);
    }
    moduleInstance = null;
    wrappers = null;
  }
}

module.exports = { init, cleanup };