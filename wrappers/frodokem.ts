import { PQ } from '../index';

export function createFrodokemWrappers(pq: PQ) {
  return {
    frodokem_640_aes: {
      generateKeypair: () => {
        const keypair = pq.kem.frodokem.frodokem_640_aes.generateKeypair();
        return {
          publicKey: keypair.publicKey,
          secretKey: keypair.secretKey
        };
      },
      encapsulate: (publicKey: Buffer) => {
        const result = pq.kem.frodokem.frodokem_640_aes.encapsulate(publicKey);
        return {
          ciphertext: result.ciphertext,
          sharedSecret: result.sharedSecret
        };
      },
      decapsulate: (ciphertext: Buffer, secretKey: Buffer) => {
        return pq.kem.frodokem.frodokem_640_aes.decapsulate(ciphertext, secretKey);
      }
    },
    frodokem_640_shake: {
      generateKeypair: () => {
        const keypair2 = pq.kem.frodokem.frodokem_640_shake.generateKeypair();
        return {
          publicKey: keypair2.publicKey,
          secretKey: keypair2.secretKey
        };
      },
      encapsulate: (publicKey: Buffer) => {
        const result2 = pq.kem.frodokem.frodokem_640_shake.encapsulate(publicKey);
        return {
          ciphertext: result2.ciphertext,
          sharedSecret: result2.sharedSecret
        };
      },
      decapsulate: (ciphertext: Buffer, secretKey: Buffer) => {
        return pq.kem.frodokem.frodokem_640_shake.decapsulate(ciphertext, secretKey);
      }
    },
    frodokem_976_aes: {
      generateKeypair: () => {
        const keypair3 = pq.kem.frodokem.frodokem_976_aes.generateKeypair();
        return {
          publicKey: keypair3.publicKey,
          secretKey: keypair3.secretKey
        };
      },
      encapsulate: (publicKey: Buffer) => {
        const result3 = pq.kem.frodokem.frodokem_976_aes.encapsulate(publicKey);
        return {
          ciphertext: result3.ciphertext,
          sharedSecret: result3.sharedSecret
        };
      },
      decapsulate: (ciphertext: Buffer, secretKey: Buffer) => {
        return pq.kem.frodokem.frodokem_976_aes.decapsulate(ciphertext, secretKey);
      }
    },
    frodokem_976_shake: {
      generateKeypair: () => {
        const keypair4 = pq.kem.frodokem.frodokem_976_shake.generateKeypair();
        return {
          publicKey: keypair4.publicKey,
          secretKey: keypair4.secretKey
        };
      },
      encapsulate: (publicKey: Buffer) => {
        const result4 = pq.kem.frodokem.frodokem_976_shake.encapsulate(publicKey);
        return {
          ciphertext: result4.ciphertext,
          sharedSecret: result4.sharedSecret
        };
      },
      decapsulate: (ciphertext: Buffer, secretKey: Buffer) => {
        return pq.kem.frodokem.frodokem_976_shake.decapsulate(ciphertext, secretKey);
      }
    },
    frodokem_1344_aes: {
      generateKeypair: () => {
        const keypair5 = pq.kem.frodokem.frodokem_1344_aes.generateKeypair();
        return {
          publicKey: keypair5.publicKey,
          secretKey: keypair5.secretKey
        };
      },
      encapsulate: (publicKey: Buffer) => {
        const result5 = pq.kem.frodokem.frodokem_1344_aes.encapsulate(publicKey);
        return {
          ciphertext: result5.ciphertext,
          sharedSecret: result5.sharedSecret
        };
      },
      decapsulate: (ciphertext: Buffer, secretKey: Buffer) => {
        return pq.kem.frodokem.frodokem_1344_aes.decapsulate(ciphertext, secretKey);
      }
    },
    frodokem_1344_shake: {
      generateKeypair: () => {
        const keypair6 = pq.kem.frodokem.frodokem_1344_shake.generateKeypair();
        return {
          publicKey: keypair6.publicKey,
          secretKey: keypair6.secretKey
        };
      },
      encapsulate: (publicKey: Buffer) => {
        const result6 = pq.kem.frodokem.frodokem_1344_shake.encapsulate(publicKey);
        return {
          ciphertext: result6.ciphertext,
          sharedSecret: result6.sharedSecret
        };
      },
      decapsulate: (ciphertext: Buffer, secretKey: Buffer) => {
        return pq.kem.frodokem.frodokem_1344_shake.decapsulate(ciphertext, secretKey);
      }
    }
  };
} 