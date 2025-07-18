const pqSig = require('../src/index');
const { createPQ: createPQSig } = pqSig;

const sphincsVariants: string[] = [
  'sphincs_sha2_128f_simple',
  'sphincs_sha2_128s_simple',
  'sphincs_sha2_192f_simple',
  'sphincs_sha2_192s_simple',
  'sphincs_sha2_256f_simple',
  'sphincs_sha2_256s_simple',
  'sphincs_shake_128f_simple',
  'sphincs_shake_128s_simple',
  'sphincs_shake_192f_simple',
  'sphincs_shake_192s_simple',
  'sphincs_shake_256f_simple',
  'sphincs_shake_256s_simple'
];

const dilithiumVariants: string[] = [
  'dilithium2',
  'dilithium3',
  'dilithium5'
];

const falconVariants: string[] = [
  'falcon_512',
  'falcon_1024'
];

async function testVariant(name: string, wrapper: any): Promise<boolean> {
  console.log(`\n--- Testing ${name} ---`);
  try {
    console.log(`Public key length: ${wrapper.getPublicKeyLength()}`);
    console.log(`Secret key length: ${wrapper.getSecretKeyLength()}`);
    console.log(`Signature length: ${wrapper.getSignatureLength()}`);

    const { publicKey, secretKey } = wrapper.generateKeypair();
    console.log(`Generated public key length: ${publicKey.length}`);
    console.log(`Generated secret key length: ${secretKey.length}`);

    const sig = wrapper.sign("Hello PQ", secretKey);
    console.log(`Generated signature length: ${sig.length}`);

    const verified = wrapper.verify("Hello PQ", sig, publicKey);
    console.log("Verified:", verified);

    return verified;
  } catch (error: unknown) {
    console.error(`Error in ${name}:`, error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    return false;
  }
}

function randomBytesSig(length: number): Uint8Array {
  const arr = new Uint8Array(length);
  for (let i = 0; i < length; i++) arr[i] = Math.floor(Math.random() * 256);
  return arr;
}

async function fuzzTestVariant(name: string, wrapper: any): Promise<boolean> {
  console.log(`\n--- Fuzz Testing ${name} ---`);
  try {
    // Generate valid keypair
    const { publicKey, secretKey } = wrapper.generateKeypair();

    // Try signing random messages of various lengths
    for (let len of [0, 1, 32, 128, 1024, 4096]) {
      const msg = randomBytesSig(len);
      const sig = wrapper.sign(msg, secretKey);
      const verified = wrapper.verify(msg, sig, publicKey);
      if (!verified) {
        console.error(`Fuzz fail: valid signature not verified for length ${len}`);
        return false;
      }
    }

    // Try verifying with corrupted signature
    const msg = randomBytesSig(32);
    const sig = wrapper.sign(msg, secretKey);
    sig[0] ^= 0xff; // Corrupt the signature
    const verified = wrapper.verify(msg, sig, publicKey);
    if (verified) {
      console.error('Fuzz fail: corrupted signature verified!');
      return false;
    }

    // Try verifying with wrong public key
    const { publicKey: pk2 } = wrapper.generateKeypair();
    const verified2 = wrapper.verify(msg, sig, pk2);
    if (verified2) {
      console.error('Fuzz fail: signature verified with wrong public key!');
      return false;
    }

    console.log('Fuzz test passed');
    return true;
  } catch (error: unknown) {
    console.error(`Fuzz error in ${name}:`, error);
    return false;
  }
}

async function runTests(): Promise<void> {
  try {
    console.log('Initializing all PQC variants...');
    const { signatures } = await createPQSig();
    const { dilithium, sphincs, falcon } = signatures;
    console.log('Initialization complete, starting tests...');

    const results: Record<string, boolean> = {};

    // Test Dilithium
    for (const variant of dilithiumVariants) {
      results[variant] = await testVariant(variant, dilithium[variant]);
    }

    // Test SPHINCS+
    for (const variant of sphincsVariants) {
      results[variant] = await testVariant(variant, sphincs[variant]);
    }

    // Test Falcon
    for (const variant of falconVariants) {
      results[variant] = await testVariant(variant, falcon[variant]);
    }

    console.log('\nTest Results:');
    for (const variant of [...dilithiumVariants, ...sphincsVariants, ...falconVariants]) {
      console.log(`${variant}:`, results[variant] ? 'PASS' : 'FAIL');
    }
    console.log('\nStarting Fuzz Tests...');

    const fuzzResults: Record<string, boolean> = {};

  // Fuzz Dilithium
  for (const variant of dilithiumVariants) {
    fuzzResults[variant] = await fuzzTestVariant(variant, dilithium[variant]);
  }

  // Fuzz SPHINCS+
  for (const variant of sphincsVariants) {
    fuzzResults[variant] = await fuzzTestVariant(variant, sphincs[variant]);
  }

  // Fuzz Falcon
  for (const variant of falconVariants) {
    fuzzResults[variant] = await fuzzTestVariant(variant, falcon[variant]);
  }

  console.log('\nFuzz Test Results:');
  for (const variant of [...dilithiumVariants, ...sphincsVariants, ...falconVariants]) {
    console.log(`${variant}:`, fuzzResults[variant] ? 'PASS' : 'FAIL');
  }
  
  } catch (error: unknown) {
    console.error('Fatal error:', error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  }
}

runTests().catch((error: unknown) => {
  console.error('Unhandled error:', error);
  if (error instanceof Error && error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});