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
  Includes only the small and medium variants (`348864`, `348864f`, `460896`, `460896f`).  
  These variants are supported with a moderate memory footprint (512MB RAM reserved) and will work on most systems.

- **Full build:**  
  Includes all Classic McEliece variants, including the largest (`6688128`, `6688128f`, `6960119`, `6960119f`, `8192128`, `8192128f`).  
  **Warning:** The largest variants require up to 2GB of RAM due to their extremely large key and ciphertext sizes. They may not work in all environments, especially in browsers or on systems with limited memory.

### Usage

- **Default (small/medium variants, efficient):**
  ```js
  const { createPQ } = require('pq-js');
  const pq = await createPQ();
  // pq.mceliece will only include the small/medium variants
  ```
  Only the small/medium WASM build is loaded (512MB RAM reserved).

- **Full (all variants, including large, 2GB RAM):**
  ```js
  const { createPQFull } = require('pq-js');
  const pq = await createPQFull();
  // pq.mceliece will include all variants, but 2GB RAM is reserved
  ```
  The full WASM build is loaded (2GB RAM reserved for Classic McEliece).

**Note:**  
- If you only use `createPQ`, the large/2GB WASM build is never loaded and no extra RAM is reserved.  
- Only use `createPQFull` if you need the largest Classic McEliece variants and your system can allocate sufficient memory.

## 🔧 CLI Reference

### Available Algorithms

**Signature Schemes:**
- `dilithium2`, `dilithium3`, `dilithium5`
- `falcon_512`, `falcon_1024`
- `sphincs_sha2_128f_simple`, `sphincs_sha2_128s_simple`, `sphincs_sha2_192f_simple`, `sphincs_sha2_192s_simple`, `sphincs_sha2_256f_simple`, `sphincs_sha2_256s_simple`
- `sphincs_shake_128f_simple`, `sphincs_shake_128s_simple`, `sphincs_shake_192f_simple`, `sphincs_shake_192s_simple`, `sphincs_shake_256f_simple`, `sphincs_shake_256s_simple`

**KEM Schemes:**
- `mlkem_512`, `mlkem_768`, `mlkem_1024`
- `frodokem_640_aes`, `frodokem_640_shake`, `frodokem_976_aes`, `frodokem_976_shake`, `frodokem_1344_aes`, `frodokem_1344_shake`
- `classic_mceliece_348864`, `classic_mceliece_348864f`, `classic_mceliece_460896`, `classic_mceliece_460896f`

### Operations

**Signature Operations:**
- `generateKey` - Generate a new keypair
- `sign <message> <secret_key_hex>` - Sign a message
- `verify <message> <signature_hex> <public_key_hex>` - Verify a signature

**KEM Operations:**
- `generateKey` - Generate a new keypair
- `encapsulate <public_key_hex>` - Generate shared secret and ciphertext
- `decapsulate <ciphertext_hex> <secret_key_hex>` - Recover shared secret

## 🛠️ Development

### Project Structure
```
pq-js/
├── sig/           # Signature algorithm implementations
├── kem/           # KEM algorithm implementations
├── test/          # Test suites
├── dist/          # Compiled output (not tracked in git)
├── cli.ts         # CLI implementation
├── index.ts       # Main library entry point
└── package.json   # Project configuration
```

### Building
```bash
npm run build
```

This compiles TypeScript files and copies WASM wrapper files to the `dist/` directory.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! However, please note that this project was generated with AI assistance and is primarily intended for educational and experimental purposes.

### How to contribute:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes**
4. **Run tests**: `npm test`
5. **Commit your changes**: `git commit -m 'Add some feature'`
6. **Push to the branch**: `git push origin feature/your-feature-name`
7. **Submit a Pull Request**

### Guidelines:

- **Security**: Any security-related changes should be thoroughly reviewed
- **Testing**: Ensure all tests pass before submitting
- **Documentation**: Update README.md if adding new features
- **Code style**: Follow existing TypeScript conventions

### Important Notes:

- This project is built on liboqs 0.13.0 - please maintain compatibility
- The underlying cryptographic implementations come from liboqs
- Focus contributions on the JavaScript/TypeScript integration layer
- Consider the AI-generated nature of this project when contributing

## 🙏 Credits & Acknowledgments

This library is built on top of **liboqs 0.13.0**, the Open Quantum Safe project's library for quantum-resistant cryptographic algorithms.

- **liboqs**: [https://github.com/open-quantum-safe/liboqs](https://github.com/open-quantum-safe/liboqs) (v0.13.0)
- **Open Quantum Safe**: [https://openquantumsafe.org/](https://openquantumsafe.org/)

The WebAssembly implementations of all cryptographic algorithms in this package are compiled from liboqs 0.13.0 C implementations. This project provides JavaScript/TypeScript bindings and a CLI interface for the liboqs library.

## 🔗 References

- [NIST Post-Quantum Cryptography Standardization](https://www.nist.gov/programs-projects/post-quantum-cryptography)
- [Dilithium](https://pq-crystals.org/dilithium/)
- [Falcon](https://falcon-sign.info/)
- [SPHINCS+](https://sphincs.org/)
- [ML-KEM](https://pq-crystals.org/kyber/)
- [FrodoKEM](https://frodokem.org/)
- [Classic McEliece](https://classic.mceliece.org/)
