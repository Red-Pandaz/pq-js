const createDilithiumModule = require('./dist/pq-dilithium.js');

async function init() {
  const Module = await createDilithiumModule();

  const PUB_KEY_LEN = 1312;
  const SEC_KEY_LEN = 2528;
  const SIG_MAX_LEN = 2420;

  return {
    generateKeypair() {
      const pubKeyPtr = Module._malloc(PUB_KEY_LEN);
      const secKeyPtr = Module._malloc(SEC_KEY_LEN);

      const res = Module._dilithium_keypair(pubKeyPtr, secKeyPtr);
      if (res !== 0) throw new Error('Keypair generation failed');

      const pubKey = new Uint8Array(Module.HEAPU8.buffer, pubKeyPtr, PUB_KEY_LEN);
      const secKey = new Uint8Array(Module.HEAPU8.buffer, secKeyPtr, SEC_KEY_LEN);

      // Copy keys out (to detach from WASM heap)
      const pubKeyCopy = new Uint8Array(pubKey);
      const secKeyCopy = new Uint8Array(secKey);

      Module._free(pubKeyPtr);
      Module._free(secKeyPtr);

      return { publicKey: pubKeyCopy, secretKey: secKeyCopy };
    },

    sign(message, secretKey) {
      const msgBytes = typeof message === 'string' ? new TextEncoder().encode(message) : message;
      const msgPtr = Module._malloc(msgBytes.length);
      Module.HEAPU8.set(msgBytes, msgPtr);

      const secKeyPtr = Module._malloc(secretKey.length);
      Module.HEAPU8.set(secretKey, secKeyPtr);

      const sigPtr = Module._malloc(SIG_MAX_LEN);
      const sigLenPtr = Module._malloc(4);
      Module.HEAPU32[sigLenPtr >> 2] = SIG_MAX_LEN;

      const res = Module._dilithium_sign(sigPtr, sigLenPtr, msgPtr, msgBytes.length, secKeyPtr);
      if (res !== 0) {
        Module._free(msgPtr);
        Module._free(secKeyPtr);
        Module._free(sigPtr);
        Module._free(sigLenPtr);
        throw new Error('Signing failed');
      }

      const sigLen = Module.HEAPU32[sigLenPtr >> 2];
      const signature = new Uint8Array(Module.HEAPU8.buffer, sigPtr, sigLen);

      const signatureCopy = new Uint8Array(signature);

      Module._free(msgPtr);
      Module._free(secKeyPtr);
      Module._free(sigPtr);
      Module._free(sigLenPtr);

      return signatureCopy;
    },

    verify(message, signature, publicKey) {
      const msgBytes = typeof message === 'string' ? new TextEncoder().encode(message) : message;

      const msgPtr = Module._malloc(msgBytes.length);
      Module.HEAPU8.set(msgBytes, msgPtr);

      const sigPtr = Module._malloc(signature.length);
      Module.HEAPU8.set(signature, sigPtr);

      const pubKeyPtr = Module._malloc(publicKey.length);
      Module.HEAPU8.set(publicKey, pubKeyPtr);

      const res = Module._dilithium_verify(msgPtr, msgBytes.length, sigPtr, signature.length, pubKeyPtr);

      Module._free(msgPtr);
      Module._free(sigPtr);
      Module._free(pubKeyPtr);

      return res === 0; // true if verified
    }
  };
}

module.exports = init;