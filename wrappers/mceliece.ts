import { PQ } from '../index';

export function createMcelieceWrappers(pq: PQ) {
  return {
    classic_mceliece_348864: {
      generateKeypair: () => {
        const keypair = pq.kem.mceliece.classic_mceliece_348864.generateKeypair();
        return {
          publicKey: keypair.publicKey,
          secretKey: keypair.secretKey
        };
      },
      encapsulate: (publicKey: Buffer) => {
        const result = pq.kem.mceliece.classic_mceliece_348864.encapsulate(publicKey);
        return {
          ciphertext: result.ciphertext,
          sharedSecret: result.sharedSecret
        };
      },
      decapsulate: (ciphertext: Buffer, secretKey: Buffer) => {
        return pq.kem.mceliece.classic_mceliece_348864.decapsulate(ciphertext, secretKey);
      }
    },
    classic_mceliece_348864f: {
      generateKeypair: () => {
        const keypair2 = pq.kem.mceliece.classic_mceliece_348864f.generateKeypair();
        return {
          publicKey: keypair2.publicKey,
          secretKey: keypair2.secretKey
        };
      },
      encapsulate: (publicKey: Buffer) => {
        const result2 = pq.kem.mceliece.classic_mceliece_348864f.encapsulate(publicKey);
        return {
          ciphertext: result2.ciphertext,
          sharedSecret: result2.sharedSecret
        };
      },
      decapsulate: (ciphertext: Buffer, secretKey: Buffer) => {
        return pq.kem.mceliece.classic_mceliece_348864f.decapsulate(ciphertext, secretKey);
      }
    },
    classic_mceliece_460896: {
      generateKeypair: () => {
        const keypair3 = pq.kem.mceliece.classic_mceliece_460896.generateKeypair();
        return {
          publicKey: keypair3.publicKey,
          secretKey: keypair3.secretKey
        };
      },
      encapsulate: (publicKey: Buffer) => {
        const result3 = pq.kem.mceliece.classic_mceliece_460896.encapsulate(publicKey);
        return {
          ciphertext: result3.ciphertext,
          sharedSecret: result3.sharedSecret
        };
      },
      decapsulate: (ciphertext: Buffer, secretKey: Buffer) => {
        return pq.kem.mceliece.classic_mceliece_460896.decapsulate(ciphertext, secretKey);
      }
    },
    classic_mceliece_460896f: {
      generateKeypair: () => {
        const keypair4 = pq.kem.mceliece.classic_mceliece_460896f.generateKeypair();
        return {
          publicKey: keypair4.publicKey,
          secretKey: keypair4.secretKey
        };
      },
      encapsulate: (publicKey: Buffer) => {
        const result4 = pq.kem.mceliece.classic_mceliece_460896f.encapsulate(publicKey);
        return {
          ciphertext: result4.ciphertext,
          sharedSecret: result4.sharedSecret
        };
      },
      decapsulate: (ciphertext: Buffer, secretKey: Buffer) => {
        return pq.kem.mceliece.classic_mceliece_460896f.decapsulate(ciphertext, secretKey);
      }
    }
  };
} 