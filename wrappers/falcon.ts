import { PQ } from '../index';

export function createFalconWrappers(pq: PQ) {
  return {
    falcon_512: {
      generateKeypair: () => {
        const keypair = pq.signatures.falcon.falcon_512.generateKeypair();
        return {
          publicKey: keypair.publicKey,
          secretKey: keypair.secretKey
        };
      },
      sign: (message: string, secretKey: Buffer) => {
        return pq.signatures.falcon.falcon_512.sign(message, secretKey);
      },
      verify: (message: string, signature: Buffer, publicKey: Buffer) => {
        return pq.signatures.falcon.falcon_512.verify(message, signature, publicKey);
      }
    },
    falcon_1024: {
      generateKeypair: () => {
        const keypair2 = pq.signatures.falcon.falcon_1024.generateKeypair();
        return {
          publicKey: keypair2.publicKey,
          secretKey: keypair2.secretKey
        };
      },
      sign: (message: string, secretKey: Buffer) => {
        return pq.signatures.falcon.falcon_1024.sign(message, secretKey);
      },
      verify: (message: string, signature: Buffer, publicKey: Buffer) => {
        return pq.signatures.falcon.falcon_1024.verify(message, signature, publicKey);
      }
    }
  };
} 