import { PQ } from '../index';

export function createDilithiumWrappers(pq: PQ) {
  return {
    dilithium2: {
      generateKeypair: () => {
        const keypair = pq.signatures.dilithium.dilithium2.generateKeypair();
        return {
          publicKey: keypair.publicKey,
          secretKey: keypair.secretKey
        };
      },
      sign: (message: string, secretKey: Buffer) => {
        return pq.signatures.dilithium.dilithium2.sign(message, secretKey);
      },
      verify: (message: string, signature: Buffer, publicKey: Buffer) => {
        return pq.signatures.dilithium.dilithium2.verify(message, signature, publicKey);
      }
    },
    dilithium3: {
      generateKeypair: () => {
        const keypair2 = pq.signatures.dilithium.dilithium3.generateKeypair();
        return {
          publicKey: keypair2.publicKey,
          secretKey: keypair2.secretKey
        };
      },
      sign: (message: string, secretKey: Buffer) => {
        return pq.signatures.dilithium.dilithium3.sign(message, secretKey);
      },
      verify: (message: string, signature: Buffer, publicKey: Buffer) => {
        return pq.signatures.dilithium.dilithium3.verify(message, signature, publicKey);
      }
    },
    dilithium5: {
      generateKeypair: () => {
        const keypair3 = pq.signatures.dilithium.dilithium5.generateKeypair();
        return {
          publicKey: keypair3.publicKey,
          secretKey: keypair3.secretKey
        };
      },
      sign: (message: string, secretKey: Buffer) => {
        return pq.signatures.dilithium.dilithium5.sign(message, secretKey);
      },
      verify: (message: string, signature: Buffer, publicKey: Buffer) => {
        return pq.signatures.dilithium.dilithium5.verify(message, signature, publicKey);
      }
    }
  };
} 