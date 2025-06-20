// FrodoKEM implementation for browser

let frodokemModuleInstance: any = null;
let frodokemWrappers: Record<string, any> | null = null;

async function createFrodokemWrapper(algNum: number): Promise<any> {
  // Use the shared module instance instead of creating a new one
  if (!frodokemModuleInstance) {
    throw new Error('Module not initialized. Call initFrodokem() first.');
  }

  const Module = frodokemModuleInstance;

  // Initialize all variants
  const initResult: number = Module._init_frodokem_variants();
  
  if (initResult !== 1) {
    throw new Error('Failed to initialize frodokem variants');
  }

  // Get lengths before creating wrapper
  const pubLen: number = Module[`_frodokem${algNum}_get_public_key_length`]();
  const secLen: number = Module[`_frodokem${algNum}_get_secret_key_length`]();
  const ctLen: number = Module[`_frodokem${algNum}_get_ciphertext_length`]();
  const ssLen: number = Module[`_frodokem${algNum}_get_shared_secret_length`]();

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
        const result: number = Module[`_frodokem${algNum}_keypair`](pkPtr, skPtr);
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

    encapsulate(publicKey: Uint8Array): { ciphertext: Uint8Array, sharedSecret: Uint8Array } {
      // Ensure memory is initialized
      if (!Module.HEAPU8) {
        throw new Error('WASM memory not initialized');
      }
      if (publicKey.length !== pubLen) {
        throw new Error(`Invalid public key length. Expected ${pubLen}, got ${publicKey.length}`);
      }
      // Allocate memory
      const pkPtr: number = Module._malloc(publicKey.length);
      if (!pkPtr) throw new Error('Failed to allocate public key buffer');
      writeMemory(publicKey, pkPtr);
      const ctPtr: number = Module._malloc(ctLen);
      if (!ctPtr) throw new Error('Failed to allocate ciphertext buffer');
      const ssPtr: number = Module._malloc(ssLen);
      if (!ssPtr) throw new Error('Failed to allocate shared secret buffer');
      try {
        const result: number = Module[`_frodokem${algNum}_encaps`](ctPtr, ssPtr, pkPtr);
        checkOQSStatus(result, 'Encapsulation');
        // Create copies of the data before freeing the memory
        const ciphertext: Uint8Array | null = copyMemory(ctPtr, ctLen);
        const sharedSecret: Uint8Array | null = copyMemory(ssPtr, ssLen);
        if (!ciphertext || !sharedSecret) {
          throw new Error('Failed to copy encapsulation data');
        }
        return { ciphertext, sharedSecret };
      } finally {
        Module._free(pkPtr);
        Module._free(ctPtr);
        Module._free(ssPtr);
      }
    },

    decapsulate(ciphertext: Uint8Array, secretKey: Uint8Array): Uint8Array {
      // Ensure memory is initialized
      if (!Module.HEAPU8) {
        throw new Error('WASM memory not initialized');
      }
      if (ciphertext.length !== ctLen) {
        throw new Error(`Invalid ciphertext length. Expected ${ctLen}, got ${ciphertext.length}`);
      }
      if (secretKey.length !== secLen) {
        throw new Error(`Invalid secret key length. Expected ${secLen}, got ${secretKey.length}`);
      }
      // Allocate memory
      const ctPtr: number = Module._malloc(ciphertext.length);
      if (!ctPtr) throw new Error('Failed to allocate ciphertext buffer');
      writeMemory(ciphertext, ctPtr);
      const skPtr: number = Module._malloc(secretKey.length);
      if (!skPtr) throw new Error('Failed to allocate secret key buffer');
      writeMemory(secretKey, skPtr);
      const ssPtr: number = Module._malloc(ssLen);
      if (!ssPtr) throw new Error('Failed to allocate shared secret buffer');
      try {
        const result: number = Module[`_frodokem${algNum}_decaps`](ssPtr, ctPtr, skPtr);
        checkOQSStatus(result, 'Decapsulation');
        // Create a copy of the shared secret data
        const sharedSecret: Uint8Array | null = copyMemory(ssPtr, ssLen);
        if (!sharedSecret) {
          throw new Error('Failed to copy decapsulation data');
        }
        return sharedSecret;
      } finally {
        Module._free(ctPtr);
        Module._free(skPtr);
        Module._free(ssPtr);
      }
    },

    getPublicKeyLength: (): number => pubLen,
    getSecretKeyLength: (): number => secLen,
    getCiphertextLength: (): number => ctLen,
    getSharedSecretLength: (): number => ssLen,
  };
}

async function initFrodokem(): Promise<Record<string, any>> {
  if (frodokemWrappers) {
    return frodokemWrappers;
  }

  if (!frodokemModuleInstance) {
    // Use the same approach as the working HTML script
    // Load the WASM module via script tag instead of dynamic import
    return new Promise((resolve, reject) => {
      // Check if the script is already loaded
      if (typeof (window as any).Module === 'function') {
        // Module is already available, initialize it
        const moduleArg = {
          locateFile: (path: string) => {
            if (path.endsWith('.wasm')) {
              return '../../dist-browser/kem/frodokem/frodokem_wrapper.wasm';
            }
            return path;
          }
        };

        (window as any).Module(moduleArg).then((Module: any) => {
          frodokemModuleInstance = Module;
          createWrappers().then(() => resolve(frodokemWrappers!)).catch(reject);
        }).catch(reject);
      } else {
        // Load the script first
        const script = document.createElement('script');
        script.src = '../../dist-browser/kem/frodokem/frodokem_wrapper.js';
        script.onload = async () => {
          try {
            const moduleArg = {
              locateFile: (path: string) => {
                if (path.endsWith('.wasm')) {
                  return '../../dist-browser/kem/frodokem/frodokem_wrapper.wasm';
                }
                return path;
              }
            };

            const Module = await (window as any).Module(moduleArg);
            frodokemModuleInstance = Module;
            await createWrappers();
            resolve(frodokemWrappers!);
          } catch (error) {
            reject(error);
          }
        };
        script.onerror = () => reject(new Error('Failed to load FrodoKEM wrapper script'));
        document.head.appendChild(script);
      }
    });
  }

  return frodokemWrappers!;
}

async function createWrappers(): Promise<void> {
  frodokemWrappers = {} as Record<string, any>;
  
  // Create wrappers for all FrodoKEM variants
  const variants = [640, 976, 1344]; // FrodoKEM variants
  for (const variant of variants) {
    try {
      frodokemWrappers[`frodokem_${variant}_aes`] = await createFrodokemWrapper(variant);
    } catch (error) {
      console.warn(`Failed to create wrapper for FrodoKEM ${variant}:`, error);
    }
  }
}

function cleanupFrodokem(): void {
  frodokemModuleInstance = null;
  frodokemWrappers = null;
}

export { initFrodokem, cleanupFrodokem }; 