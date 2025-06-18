import { PQ } from '../index';

export function createMlkemWrappers(pq: PQ) {
  return {
    mlkem_512: {
      generateKeypair: () => {
        const keypair = pq.kem.mlkem.mlkem_512.generateKeypair();
        return {
          publicKey: keypair.publicKey,
          secretKey: keypair.secretKey
        };
      },
      encapsulate: (publicKey: Buffer) => {
        const result = pq.kem.mlkem.mlkem_512.encapsulate(publicKey);
        return {
          ciphertext: result.ciphertext,
          sharedSecret: result.sharedSecret
        };
      },
      decapsulate: (ciphertext: Buffer, secretKey: Buffer) => {
        return pq.kem.mlkem.mlkem_512.decapsulate(ciphertext, secretKey);
      }
    },
    mlkem_768: {
      generateKeypair: () => {
        const keypair2 = pq.kem.mlkem.mlkem_768.generateKeypair();
        return {
          publicKey: keypair2.publicKey,
          secretKey: keypair2.secretKey
        };
      },
      encapsulate: (publicKey: Buffer) => {
        const result2 = pq.kem.mlkem.mlkem_768.encapsulate(publicKey);
        return {
          ciphertext: result2.ciphertext,
          sharedSecret: result2.sharedSecret
        };
      },
      decapsulate: (ciphertext: Buffer, secretKey: Buffer) => {
        return pq.kem.mlkem.mlkem_768.decapsulate(ciphertext, secretKey);
      }
    },
    mlkem_1024: {
      generateKeypair: () => {
        const keypair3 = pq.kem.mlkem.mlkem_1024.generateKeypair();
        return {
          publicKey: keypair3.publicKey,
          secretKey: keypair3.secretKey
        };
      },
      encapsulate: (publicKey: Buffer) => {
        const result3 = pq.kem.mlkem.mlkem_1024.encapsulate(publicKey);
        return {
          ciphertext: result3.ciphertext,
          sharedSecret: result3.sharedSecret
        };
      },
      decapsulate: (ciphertext: Buffer, secretKey: Buffer) => {
        return pq.kem.mlkem.mlkem_1024.decapsulate(ciphertext, secretKey);
      }
    }
  };
} 