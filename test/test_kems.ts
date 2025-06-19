const pq = require('../src/index');
const { createPQ: createPQKEM, createPQFull: createPQFullKEM } = pq;

// Set this flag to true to test the full build (all McEliece variants, 2GB RAM)
const TEST_FULL_MCELIECE: boolean = false; // Change to true to test full build

const mlkemVariants: string[] = [
  'mlkem_512',
  'mlkem_768',
  'mlkem_1024'
];

const frodoKEMVariants: string[] = [
  'frodokem_640_aes',
  'frodokem_640_shake',
  'frodokem_976_aes',
  'frodokem_976_shake',
  'frodokem_1344_aes',
  'frodokem_1344_shake'
];

const mcelieceSmallVariants: string[] = [
  'classic_mceliece_348864',
  'classic_mceliece_348864f',
  'classic_mceliece_460896',
  'classic_mceliece_460896f'
];

const mcelieceFullVariants: string[] = [
  ...mcelieceSmallVariants,
  'classic_mceliece_6688128',
  'classic_mceliece_6688128f',
  'classic_mceliece_6960119',
  'classic_mceliece_6960119f',
  'classic_mceliece_8192128',
  'classic_mceliece_8192128f'
];

const mcelieceVariants: string[] = TEST_FULL_MCELIECE ? mcelieceFullVariants : mcelieceSmallVariants;

function randomBytesKEM(length: number): Uint8Array {
  const arr = new Uint8Array(length);
  for (let i = 0; i < length; i++) arr[i] = Math.floor(Math.random() * 256);
  return arr;
}

async function testKEMVariant(name: string, wrapper: any): Promise<boolean> {
  console.log(`\n--- Testing KEM ${name} ---`);
  try {
    // Generate keypair
    const { publicKey, secretKey } = wrapper.generateKeypair();
    console.log(`Public key length: ${publicKey.length}`);
    console.log(`Secret key length: ${secretKey.length}`);

    // Encapsulate
    const { ciphertext, sharedSecret: ss1 } = wrapper.encapsulate(publicKey);
    console.log(`Ciphertext length: ${ciphertext.length}`);
    console.log(`Shared secret length: ${ss1.length}`);

    // Decapsulate
    const ss2 = wrapper.decapsulate(ciphertext, secretKey);

    // Check shared secrets match
    const match = ss1.length === ss2.length && ss1.every((b: number, i: number) => b === ss2[i]);
    console.log("Shared secret match:", match);

    return match;
  } catch (error: unknown) {
    console.error(`Error in KEM ${name}:`, error);
    if (error instanceof Error && error.stack) console.error(error.stack);
    return false;
  }
}

async function fuzzTestKEMVariant(name: string, wrapper: any): Promise<boolean> {
  console.log(`\n--- Fuzz Testing KEM ${name} ---`);
  try {
    // Generate valid keypair
    const { publicKey, secretKey } = wrapper.generateKeypair();

    // Test with valid encaps/decaps
    for (let i = 0; i < 5; ++i) {
      const { ciphertext, sharedSecret: ss1 } = wrapper.encapsulate(publicKey);
      const ss2 = wrapper.decapsulate(ciphertext, secretKey);
      if (ss1.length !== ss2.length || !ss1.every((b: number, i: number) => b === ss2[i])) {
        console.error('Fuzz fail: valid encaps/decaps did not match');
        return false;
      }
    }

    // Fuzz: corrupted ciphertext
    const { ciphertext, sharedSecret: ss1 } = wrapper.encapsulate(publicKey);
    const corrupted = new Uint8Array(ciphertext);
    corrupted[0] ^= 0xff; // Flip a bit
    const ssCorrupt = wrapper.decapsulate(corrupted, secretKey);
    // Should not match original shared secret
    if (ssCorrupt && ssCorrupt.every((b: number, i: number) => b === ss1[i])) {
      console.error('Fuzz fail: corrupted ciphertext produced same shared secret!');
      return false;
    }

    // Fuzz: wrong secret key
    const { secretKey: wrongSK } = wrapper.generateKeypair();
    const ssWrong = wrapper.decapsulate(ciphertext, wrongSK);
    if (ssWrong && ssWrong.every((b: number, i: number) => b === ss1[i])) {
      console.error('Fuzz fail: wrong secret key produced same shared secret!');
      return false;
    }

    console.log('Fuzz test passed');
    return true;
  } catch (error: unknown) {
    console.error(`Fuzz error in KEM ${name}:`, error);
    return false;
  }
}

async function runKEMTests(): Promise<void> {
  try {
    console.log('Initializing PQC KEMs...');
    console.log(`Testing Classic McEliece ${TEST_FULL_MCELIECE ? 'FULL (all variants, 2GB RAM)' : 'SMALL (small/medium variants, 512MB RAM)'}`);
    const { kem } = await createPQKEM();
    const { mlkem, frodokem } = kem;
    const pq = TEST_FULL_MCELIECE ? await createPQFullKEM() : await createPQKEM();
    const mceliece = pq.kem.mceliece;
    console.log('Initialization complete, starting KEM tests...');

    const results: Record<string, boolean> = {};
    for (const variant of mlkemVariants) {
      results[variant] = await testKEMVariant(variant, mlkem[variant]);
    }

    for (const variant of frodoKEMVariants) {
      results[variant] = await testKEMVariant(variant, frodokem[variant]);
    }

    for (const variant of mcelieceVariants) {
      results[variant] = await testKEMVariant(variant, mceliece[variant]);
    }

    console.log('\nKEM Test Results:');
    for (const variant of mlkemVariants) {
      console.log(`${variant}:`, results[variant] ? 'PASS' : 'FAIL');
    }

    for (const variant of frodoKEMVariants) {
      console.log(`${variant}:`, results[variant] ? 'PASS' : 'FAIL');
    }

    for (const variant of mcelieceVariants) {
      console.log(`${variant}:`, results[variant] ? 'PASS' : 'FAIL');
    }

    console.log('\nStarting KEM Fuzz Tests...');
    const fuzzResults: Record<string, boolean> = {};
    for (const variant of mlkemVariants) {
      fuzzResults[variant] = await fuzzTestKEMVariant(variant, mlkem[variant]);
    }

    for (const variant of frodoKEMVariants) {
      fuzzResults[variant] = await fuzzTestKEMVariant(variant, frodokem[variant]);
    }

    for (const variant of mcelieceVariants) {
      fuzzResults[variant] = await fuzzTestKEMVariant(variant, mceliece[variant]);
    }

    console.log('\nKEM Fuzz Test Results:');
    for (const variant of mlkemVariants) {
      console.log(`${variant}:`, fuzzResults[variant] ? 'PASS' : 'FAIL');
    }

    for (const variant of frodoKEMVariants) {
      console.log(`${variant}:`, fuzzResults[variant] ? 'PASS' : 'FAIL');
    }

    for (const variant of mcelieceVariants) {
      console.log(`${variant}:`, fuzzResults[variant] ? 'PASS' : 'FAIL');
    }
  } catch (error: unknown) {
    console.error('Fatal error:', error);
    if (error instanceof Error && error.stack) console.error(error.stack);
  }
}

runKEMTests().catch((error: unknown) => {
  console.error('Unhandled error:', error);
  if (error instanceof Error && error.stack) console.error(error.stack);
  process.exit(1);
});