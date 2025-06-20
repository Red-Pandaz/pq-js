let falconModuleInstance: any = null;
let falconWrappers: Record<string, any> | null = null;

async function createFalconWrapper(algNum: number): Promise<any> {
  // Use the shared module instance instead of creating a new one
  if (!falconModuleInstance) {
    throw new Error('Module not initialized. Call initFalcon() first.');
  }

  const Module = falconModuleInstance;

  // Debug: Check what functions are available
  console.log(`[Debug] Available Falcon functions for ${algNum}:`, Object.keys(Module).filter(key => key.includes('falcon')));

  // Try to find the initialization function
  const initFuncName = `_init_falcon_${algNum}`;
  if (!Module[initFuncName]) {
    console.warn(`[Debug] Initialization function ${initFuncName} not found, proceeding without initialization`);
  } else {
    // Try initialization but don't fail if it returns an error
    console.log(`[Debug] Calling ${initFuncName}`);
    const initResult: number = Module[initFuncName]();
    console.log(`[Debug] Initialization result: ${initResult}`);
    if (initResult !== 0) {
      console.warn(`[Debug] Falcon ${algNum} initialization failed with status code: ${initResult}, proceeding anyway`);
    }
  }

  // Get lengths before creating wrapper
  const pubLen: number = Module[`_falcon_${algNum}_get_public_key_length`]();
  const secLen: number = Module[`_falcon_${algNum}_get_secret_key_length`]();
  const maxSigLen: number = Module[`_falcon_${algNum}_get_signature_length`]();

  console.log(`[Debug] Falcon ${algNum} lengths - pub: ${pubLen}, sec: ${secLen}, sig: ${maxSigLen}`);

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
        const result: number = Module[`_falcon_${algNum}_keypair`](pkPtr, skPtr);
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
        const result: number = Module[`_falcon_${algNum}_sign`](
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
        const result: number = Module[`_falcon_${algNum}_verify`](mPtr, msgBytes.length, sigPtr, signature.length, pkPtr);
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

async function initFalcon(): Promise<Record<string, any>> {
  if (falconWrappers) {
    return falconWrappers;
  }

  if (!falconModuleInstance) {
    // Use the same approach as the working HTML script
    // Load the WASM module via script tag instead of dynamic import
    return new Promise((resolve, reject) => {
      // Check if the script is already loaded
      if (typeof (window as any).FalconModule === 'function') {
        // Module is already available, initialize it
        const moduleArg = {
          locateFile: (path: string) => {
            if (path.endsWith('.wasm')) {
              return '../../sig/falcon/dist-browser/falcon_wrapper.wasm';
            }
            return path;
          }
        };

        (window as any).FalconModule(moduleArg).then((Module: any) => {
          falconModuleInstance = Module;
          createWrappers().then(() => resolve(falconWrappers!)).catch(reject);
        }).catch(reject);
      } else {
        // Load the script first
        const script = document.createElement('script');
        script.src = '../../sig/falcon/dist-browser/falcon_wrapper.js';
        script.onload = async () => {
          try {
            const moduleArg = {
              locateFile: (path: string) => {
                if (path.endsWith('.wasm')) {
                  return '../../sig/falcon/dist-browser/falcon_wrapper.wasm';
                }
                return path;
              }
            };

            falconModuleInstance = await (window as any).FalconModule(moduleArg);
            await createWrappers();
            resolve(falconWrappers!);
          } catch (error) {
            reject(error);
          }
        };
        script.onerror = () => {
          reject(new Error('Failed to load Falcon WASM module'));
        };
        document.head.appendChild(script);
      }
    });
  }

  return falconWrappers!;
}

async function createWrappers(): Promise<void> {
  try {
    const falcon512 = await createFalconWrapper(512);
    const falcon1024 = await createFalconWrapper(1024);

    falconWrappers = { falcon_512: falcon512, falcon_1024: falcon1024 };
  } catch (error) {
    console.error('[Debug] Error creating wrappers:', error);
    throw error;
  }
}

// Cleanup function to free resources
function cleanupFalcon(): void {
  falconModuleInstance = null;
  falconWrappers = null;
}

export { initFalcon, cleanupFalcon }; 