#!/usr/bin/env node

const { createPQ, createPQFull } = require('./index');

// CLI argument parsing
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
Post-Quantum Cryptography CLI

Usage:
  pq-js <algorithm> <operation> [options]

Examples:
  pq-js dilithium2 generateKey
  pq-js mlkem_512 encapsulate
  pq-js sphincs_sha2_128f_simple sign "Hello World"
  pq-js frodokem_640_aes decapsulate

Available Algorithms:
  Signatures:
    - dilithium2, dilithium3, dilithium5
    - falcon_512, falcon_1024
    - sphincs_sha2_128f_simple, sphincs_sha2_128s_simple, sphincs_sha2_192f_simple, sphincs_sha2_192s_simple, sphincs_sha2_256f_simple, sphincs_sha2_256s_simple
    - sphincs_shake_128f_simple, sphincs_shake_128s_simple, sphincs_shake_192f_simple, sphincs_shake_192s_simple, sphincs_shake_256f_simple, sphincs_shake_256s_simple
  
  KEM:
    - mlkem_512, mlkem_768, mlkem_1024
    - frodokem_640_aes, frodokem_640_shake, frodokem_976_aes, frodokem_976_shake, frodokem_1344_aes, frodokem_1344_shake
    - classic_mceliece_348864, classic_mceliece_348864f, classic_mceliece_460896, classic_mceliece_460896f

Available Operations:
  Signatures: generateKey, sign, verify
  KEM: generateKey, encapsulate, decapsulate
`);
  process.exit(0);
}

const [algorithm, operation, ...options] = args;

// Algorithm categorization
const signatureAlgorithms = [
  'dilithium2', 'dilithium3', 'dilithium5',
  'falcon_512', 'falcon_1024',
  'sphincs_sha2_128f_simple', 'sphincs_sha2_128s_simple', 'sphincs_sha2_192f_simple', 'sphincs_sha2_192s_simple', 'sphincs_sha2_256f_simple', 'sphincs_sha2_256s_simple',
  'sphincs_shake_128f_simple', 'sphincs_shake_128s_simple', 'sphincs_shake_192f_simple', 'sphincs_shake_192s_simple', 'sphincs_shake_256f_simple', 'sphincs_shake_256s_simple'
];

const kemAlgorithms = [
  'mlkem_512', 'mlkem_768', 'mlkem_1024',
  'frodokem_640_aes', 'frodokem_640_shake', 'frodokem_976_aes', 'frodokem_976_shake', 'frodokem_1344_aes', 'frodokem_1344_shake',
  'classic_mceliece_348864', 'classic_mceliece_348864f', 'classic_mceliece_460896', 'classic_mceliece_460896f'
];

const isSignature = signatureAlgorithms.includes(algorithm);
const isKEM = kemAlgorithms.includes(algorithm);

if (!isSignature && !isKEM) {
  console.error(`Error: Unknown algorithm '${algorithm}'`);
  process.exit(1);
}

async function runCLI() {
  try {
    console.log(`Initializing ${algorithm}...`);
    
    let wrapper: any;
    
    if (isSignature) {
      const { signatures } = await createPQ();
      if (algorithm.startsWith('dilithium')) {
        wrapper = signatures.dilithium[algorithm];
      } else if (algorithm.startsWith('falcon')) {
        wrapper = signatures.falcon[algorithm];
      } else if (algorithm.startsWith('sphincs')) {
        wrapper = signatures.sphincs[algorithm];
      }
    } else if (isKEM) {
      const { kem } = await createPQ();
      if (algorithm.startsWith('mlkem')) {
        wrapper = kem.mlkem[algorithm];
      } else if (algorithm.startsWith('frodokem')) {
        wrapper = kem.frodokem[algorithm];
      } else if (algorithm.startsWith('classic_mceliece')) {
        wrapper = kem.mceliece[algorithm];
      }
    }

    if (!wrapper) {
      console.error(`Error: Algorithm '${algorithm}' not found`);
      process.exit(1);
    }

    console.log(`Running ${operation} with ${algorithm}...`);

    switch (operation) {
      case 'generateKey':
        const keypair = wrapper.generateKeypair();
        console.log('Generated keypair:');
        console.log(`Public key (${keypair.publicKey.length} bytes):`, Buffer.from(keypair.publicKey).toString('hex'));
        console.log(`Secret key (${keypair.secretKey.length} bytes):`, Buffer.from(keypair.secretKey).toString('hex'));
        break;

      case 'sign':
        if (!isSignature) {
          console.error('Error: sign operation only available for signature algorithms');
          process.exit(1);
        }
        const message = options[0] || 'Hello World';
        const secretKeyHex = options[1];
        if (!secretKeyHex) {
          console.error('Error: secret key required for signing');
          process.exit(1);
        }
        const secretKey = Buffer.from(secretKeyHex, 'hex');
        const signature = wrapper.sign(message, secretKey);
        console.log('Signature:', signature.toString('hex'));
        break;

      case 'verify':
        if (!isSignature) {
          console.error('Error: verify operation only available for signature algorithms');
          process.exit(1);
        }
        const verifyMessage = options[0] || 'Hello World';
        const signatureHex = options[1];
        const publicKeyHex = options[2];
        if (!signatureHex || !publicKeyHex) {
          console.error('Error: signature and public key required for verification');
          process.exit(1);
        }
        const signatureBuffer = Buffer.from(signatureHex, 'hex');
        const publicKey = Buffer.from(publicKeyHex, 'hex');
        const verified = wrapper.verify(verifyMessage, signatureBuffer, publicKey);
        console.log('Verification result:', verified ? 'VALID' : 'INVALID');
        break;

      case 'encapsulate':
        if (!isKEM) {
          console.error('Error: encapsulate operation only available for KEM algorithms');
          process.exit(1);
        }
        const publicKeyHex2 = options[0];
        if (!publicKeyHex2) {
          console.error('Error: public key required for encapsulation');
          process.exit(1);
        }
        const publicKey2 = Buffer.from(publicKeyHex2, 'hex');
        const { ciphertext: encCiphertext, sharedSecret: encSharedSecret } = wrapper.encapsulate(publicKey2);
        console.log('Encapsulation result:');
        console.log(`Ciphertext (${encCiphertext.length} bytes):`, encCiphertext.toString('hex'));
        console.log(`Shared secret (${encSharedSecret.length} bytes):`, encSharedSecret.toString('hex'));
        break;

      case 'decapsulate':
        if (!isKEM) {
          console.error('Error: decapsulate operation only available for KEM algorithms');
          process.exit(1);
        }
        const ciphertextHex = options[0];
        const secretKeyHex2 = options[1];
        if (!ciphertextHex || !secretKeyHex2) {
          console.error('Error: ciphertext and secret key required for decapsulation');
          process.exit(1);
        }
        const decCiphertext = Buffer.from(ciphertextHex, 'hex');
        const secretKey2 = Buffer.from(secretKeyHex2, 'hex');
        const sharedSecret2 = wrapper.decapsulate(decCiphertext, secretKey2);
        console.log('Decapsulation result:');
        console.log(`Shared secret (${sharedSecret2.length} bytes):`, sharedSecret2.toString('hex'));
        break;

      default:
        console.error(`Error: Unknown operation '${operation}'`);
        console.log('Available operations: generateKey, sign, verify, encapsulate, decapsulate');
        process.exit(1);
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

runCLI();