import { PQ } from '../index';

export function createSphincsWrappers(pq: PQ) {
  return {
    sphincs_sha2_128f_simple: {
      generateKeypair: () => {
        const keypair = pq.signatures.sphincs.sphincs_sha2_128f_simple.generateKeypair();
        return {
          publicKey: keypair.publicKey,
          secretKey: keypair.secretKey
        };
      },
      sign: (message: string, secretKey: Buffer) => {
        return pq.signatures.sphincs.sphincs_sha2_128f_simple.sign(message, secretKey);
      },
      verify: (message: string, signature: Buffer, publicKey: Buffer) => {
        return pq.signatures.sphincs.sphincs_sha2_128f_simple.verify(message, signature, publicKey);
      }
    },
    sphincs_sha2_128s_simple: {
      generateKeypair: () => {
        const keypair2 = pq.signatures.sphincs.sphincs_sha2_128s_simple.generateKeypair();
        return {
          publicKey: keypair2.publicKey,
          secretKey: keypair2.secretKey
        };
      },
      sign: (message: string, secretKey: Buffer) => {
        return pq.signatures.sphincs.sphincs_sha2_128s_simple.sign(message, secretKey);
      },
      verify: (message: string, signature: Buffer, publicKey: Buffer) => {
        return pq.signatures.sphincs.sphincs_sha2_128s_simple.verify(message, signature, publicKey);
      }
    },
    sphincs_sha2_192f_simple: {
      generateKeypair: () => {
        const keypair3 = pq.signatures.sphincs.sphincs_sha2_192f_simple.generateKeypair();
        return {
          publicKey: keypair3.publicKey,
          secretKey: keypair3.secretKey
        };
      },
      sign: (message: string, secretKey: Buffer) => {
        return pq.signatures.sphincs.sphincs_sha2_192f_simple.sign(message, secretKey);
      },
      verify: (message: string, signature: Buffer, publicKey: Buffer) => {
        return pq.signatures.sphincs.sphincs_sha2_192f_simple.verify(message, signature, publicKey);
      }
    },
    sphincs_sha2_192s_simple: {
      generateKeypair: () => {
        const keypair4 = pq.signatures.sphincs.sphincs_sha2_192s_simple.generateKeypair();
        return {
          publicKey: keypair4.publicKey,
          secretKey: keypair4.secretKey
        };
      },
      sign: (message: string, secretKey: Buffer) => {
        return pq.signatures.sphincs.sphincs_sha2_192s_simple.sign(message, secretKey);
      },
      verify: (message: string, signature: Buffer, publicKey: Buffer) => {
        return pq.signatures.sphincs.sphincs_sha2_192s_simple.verify(message, signature, publicKey);
      }
    },
    sphincs_sha2_256f_simple: {
      generateKeypair: () => {
        const keypair5 = pq.signatures.sphincs.sphincs_sha2_256f_simple.generateKeypair();
        return {
          publicKey: keypair5.publicKey,
          secretKey: keypair5.secretKey
        };
      },
      sign: (message: string, secretKey: Buffer) => {
        return pq.signatures.sphincs.sphincs_sha2_256f_simple.sign(message, secretKey);
      },
      verify: (message: string, signature: Buffer, publicKey: Buffer) => {
        return pq.signatures.sphincs.sphincs_sha2_256f_simple.verify(message, signature, publicKey);
      }
    },
    sphincs_sha2_256s_simple: {
      generateKeypair: () => {
        const keypair6 = pq.signatures.sphincs.sphincs_sha2_256s_simple.generateKeypair();
        return {
          publicKey: keypair6.publicKey,
          secretKey: keypair6.secretKey
        };
      },
      sign: (message: string, secretKey: Buffer) => {
        return pq.signatures.sphincs.sphincs_sha2_256s_simple.sign(message, secretKey);
      },
      verify: (message: string, signature: Buffer, publicKey: Buffer) => {
        return pq.signatures.sphincs.sphincs_sha2_256s_simple.verify(message, signature, publicKey);
      }
    },
    sphincs_shake_128f_simple: {
      generateKeypair: () => {
        const keypair7 = pq.signatures.sphincs.sphincs_shake_128f_simple.generateKeypair();
        return {
          publicKey: keypair7.publicKey,
          secretKey: keypair7.secretKey
        };
      },
      sign: (message: string, secretKey: Buffer) => {
        return pq.signatures.sphincs.sphincs_shake_128f_simple.sign(message, secretKey);
      },
      verify: (message: string, signature: Buffer, publicKey: Buffer) => {
        return pq.signatures.sphincs.sphincs_shake_128f_simple.verify(message, signature, publicKey);
      }
    },
    sphincs_shake_128s_simple: {
      generateKeypair: () => {
        const keypair8 = pq.signatures.sphincs.sphincs_shake_128s_simple.generateKeypair();
        return {
          publicKey: keypair8.publicKey,
          secretKey: keypair8.secretKey
        };
      },
      sign: (message: string, secretKey: Buffer) => {
        return pq.signatures.sphincs.sphincs_shake_128s_simple.sign(message, secretKey);
      },
      verify: (message: string, signature: Buffer, publicKey: Buffer) => {
        return pq.signatures.sphincs.sphincs_shake_128s_simple.verify(message, signature, publicKey);
      }
    },
    sphincs_shake_192f_simple: {
      generateKeypair: () => {
        const keypair9 = pq.signatures.sphincs.sphincs_shake_192f_simple.generateKeypair();
        return {
          publicKey: keypair9.publicKey,
          secretKey: keypair9.secretKey
        };
      },
      sign: (message: string, secretKey: Buffer) => {
        return pq.signatures.sphincs.sphincs_shake_192f_simple.sign(message, secretKey);
      },
      verify: (message: string, signature: Buffer, publicKey: Buffer) => {
        return pq.signatures.sphincs.sphincs_shake_192f_simple.verify(message, signature, publicKey);
      }
    },
    sphincs_shake_192s_simple: {
      generateKeypair: () => {
        const keypair10 = pq.signatures.sphincs.sphincs_shake_192s_simple.generateKeypair();
        return {
          publicKey: keypair10.publicKey,
          secretKey: keypair10.secretKey
        };
      },
      sign: (message: string, secretKey: Buffer) => {
        return pq.signatures.sphincs.sphincs_shake_192s_simple.sign(message, secretKey);
      },
      verify: (message: string, signature: Buffer, publicKey: Buffer) => {
        return pq.signatures.sphincs.sphincs_shake_192s_simple.verify(message, signature, publicKey);
      }
    },
    sphincs_shake_256f_simple: {
      generateKeypair: () => {
        const keypair11 = pq.signatures.sphincs.sphincs_shake_256f_simple.generateKeypair();
        return {
          publicKey: keypair11.publicKey,
          secretKey: keypair11.secretKey
        };
      },
      sign: (message: string, secretKey: Buffer) => {
        return pq.signatures.sphincs.sphincs_shake_256f_simple.sign(message, secretKey);
      },
      verify: (message: string, signature: Buffer, publicKey: Buffer) => {
        return pq.signatures.sphincs.sphincs_shake_256f_simple.verify(message, signature, publicKey);
      }
    },
    sphincs_shake_256s_simple: {
      generateKeypair: () => {
        const keypair12 = pq.signatures.sphincs.sphincs_shake_256s_simple.generateKeypair();
        return {
          publicKey: keypair12.publicKey,
          secretKey: keypair12.secretKey
        };
      },
      sign: (message: string, secretKey: Buffer) => {
        return pq.signatures.sphincs.sphincs_shake_256s_simple.sign(message, secretKey);
      },
      verify: (message: string, signature: Buffer, publicKey: Buffer) => {
        return pq.signatures.sphincs.sphincs_shake_256s_simple.verify(message, signature, publicKey);
      }
    }
  };
} 