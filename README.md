# ⚠️ IMPORTANT DISCLAIMER

**This project was generated with AI assistance. While the underlying cryptographic algorithms are from the well-established liboqs library, the JavaScript/TypeScript integration, CLI interface, and wrapper code are NOT audited for security vulnerabilities and may not be maintained in the future. All software in this package is offered AS-IS without any warranties.**

**DO NOT use this library in production systems without thorough security review and testing.**

---

# PQ-JS: Post-Quantum Cryptography Library

A comprehensive JavaScript/TypeScript library for post-quantum cryptography, featuring state-of-the-art signature schemes and key encapsulation mechanisms (KEMs) compiled to WebAssembly for optimal performance.

## 🚀 Features

- **Signature Schemes**: Dilithium, Falcon, SPHINCS+
- **Key Encapsulation**: ML-KEM, FrodoKEM, Classic McEliece
- **WebAssembly**: High-performance native implementations
- **TypeScript Support**: Full type definitions
- **CLI Interface**: Command-line tool for all operations
- **Cross-Platform**: Works in Node.js and browsers

## 📦 Installation

```bash
npm install pq-js
```

## 🔧 Quick Start

### Library Usage

```javascript
const { createPQ } = require('pq-js');

async function example() {
  // Initialize the library
  const pq = await createPQ();
  
  // Generate a Dilithium2 keypair
  const keypair = pq.signatures.dilithium.dilithium2.generateKeypair();
  
  // Sign a message
  const message = "Hello, post-quantum world!";
  const signature = pq.signatures.dilithium.dilithium2.sign(message, keypair.secretKey);
  
  // Verify the signature
  const isValid = pq.signatures.dilithium.dilithium2.verify(message, signature, keypair.publicKey);
  console.log("Signature valid:", isValid);
}
```

### Browser Demo

The library includes a browser-compatible version with a demo page for testing all algorithms.

**To run the browser demo:**

1. **Build the browser version:**
   ```bash
   npm run build-browser
   ```

2. **Start a local server:**
   ```bash
   npx http-server . -p 8081 -c-1
   ```

3. **Open the demo page:**
   ```
   http://localhost:8081/test-browser.html
   ```

**What the demo includes:**
- ✅ **Library loading** - Test if the library loads successfully
- ✅ **ML-KEM-512** - Generate keypairs and test encryption/decryption
- ✅ **Dilithium2** - Generate keypairs and test signing/verification
- ✅ **Full outputs** - Console logging shows complete key and signature data
- ✅ **Error handling** - Clear error messages if something goes wrong

**Browser compatibility:**
- The library works in modern browsers with WebAssembly support
- All cryptographic operations run in the browser
- No server-side processing required
- Full console output for debugging and integration

**Note:** The current browser version uses mock implementations for demonstration. Real WASM implementations are being developed.

### CLI Usage

```bash
# Generate a keypair
npx pq-js dilithium2 generateKey

# Sign a message
npx pq-js dilithium2 sign "Hello World" <secret_key_hex>

# Verify a signature
npx pq-js dilithium2 verify "Hello World" <signature_hex> <public_key_hex>

# KEM operations
npx pq-js mlkem_512 generateKey
npx pq-js mlkem_512 encapsulate <public_key_hex>
npx pq-js mlkem_512 decapsulate <ciphertext_hex> <secret_key_hex>
```

## 🏗️ Building from Source

```bash
git clone <repository-url>
cd pq-js
npm install
npm run build
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:cli
npm run test:kems
npm run test:signatures
```

## 🧪 Browser Wrapper Testing

To test the browser-compatible wrappers and ensure all algorithms work in a browser environment:

1. **Build the browser version:**
   ```bash
   npm run build-browser
   ```

2. **Start a local HTTP server in the project root:**
   ```bash
   npx http-server . -p 8081 -c-1
   ```
   > You can use any static server; `http-server` is just a simple option.

3. **Open the browser test suite:**
   ```
   http://localhost:8081/test-browser.html
   ```

4. **View results:**
   - The browser console will display test results for all supported algorithms.
   - You should see "All tests passed" and no red errors in the console if everything is working.

**Troubleshooting:**
- If you see 404 errors for wrapper `.js` or `.wasm` files, ensure you are serving from the project root and that the `dist-browser` directory exists and is up to date.
- If you see initialization errors, make sure you have run `npm run build-browser` and that your browser supports WebAssembly.

## 📚 API Reference

### Signature Schemes

#### Dilithium
```javascript
const dilithium2 = pq.signatures.dilithium.dilithium2;
const dilithium3 = pq.signatures.dilithium.dilithium3;
const dilithium5 = pq.signatures.dilithium.dilithium5;

// Generate keypair
const keypair = dilithium2.generateKeypair();

// Sign message
const signature = dilithium2.sign(message, secretKey);

// Verify signature
const isValid = dilithium2.verify(message, signature, publicKey);
```

#### Falcon
```javascript
const falcon512 = pq.signatures.falcon.falcon_512;
const falcon1024 = pq.signatures.falcon.falcon_1024;

// Same API as Dilithium
const keypair = falcon512.generateKeypair();
const signature = falcon512.sign(message, keypair.secretKey);
const isValid = falcon512.verify(message, signature, keypair.publicKey);
```

#### SPHINCS+
```javascript
// SHA2 variants
const sphincs_sha2_128f = pq.signatures.sphincs.sphincs_sha2_128f_simple;
const sphincs_sha2_192f = pq.signatures.sphincs.sphincs_sha2_192f_simple;
const sphincs_sha2_256f = pq.signatures.sphincs.sphincs_sha2_256f_simple;

// SHAKE variants
const sphincs_shake_128f = pq.signatures.sphincs.sphincs_shake_128f_simple;
const sphincs_shake_192f = pq.signatures.sphincs.sphincs_shake_192f_simple;
const sphincs_shake_256f = pq.signatures.sphincs.sphincs_shake_256f_simple;

// Same API as other signature schemes
```

### Key Encapsulation Mechanisms

#### ML-KEM
```javascript
const mlkem512 = pq.kem.mlkem.mlkem_512;
const mlkem768 = pq.kem.mlkem.mlkem_768;
const mlkem1024 = pq.kem.mlkem.mlkem_1024;

// Generate keypair
const keypair = mlkem512.generateKeypair();

// Encapsulate (generate shared secret and ciphertext)
const { ciphertext, sharedSecret } = mlkem512.encapsulate(keypair.publicKey);

// Decapsulate (recover shared secret from ciphertext)
const recoveredSecret = mlkem512.decapsulate(ciphertext, keypair.secretKey);
```

#### FrodoKEM
```javascript
const frodokem640 = pq.kem.frodokem.frodokem_640_aes;
const frodokem976 = pq.kem.frodokem.frodokem_976_aes;
const frodokem1344 = pq.kem.frodokem.frodokem_1344_aes;

// Same API as ML-KEM
```

#### Classic McEliece
```javascript
const mceliece348864 = pq.kem.mceliece.classic_mceliece_348864;
const mceliece460896 = pq.kem.mceliece.classic_mceliece_460896;

// Same API as other KEMs
```

## ⚠️ Classic McEliece Variant Disclaimer & Usage

This package provides two builds for Classic McEliece KEM:

- **Small build:**  
  Includes only the small and medium variants (`348864`, `348864f`, `460896`, `