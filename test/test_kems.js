const { createPQ } = require('../index.js'); // Adjust path if needed

const mlkemVariants = [
  'mlkem_512',
  'mlkem_768',
  'mlkem_1024'
];

const frodoKEMVariants = [
  'frodokem_640_aes',
  'frodokem_640_shake',
  'frodokem_976_aes',
  'frodokem_976_shake',
  'frodokem_1344_aes',
  'frodokem_1344_shake'
];

function randomBytes(length) {
  const arr = new Uint8Array(length);
  for (let i = 0; i < length; i++) arr[i] = Math.floor(Math.random() * 256);
  return arr;
}

async function testKEMVariant(name, wrapper) {
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
    const match = ss1.length === ss2.length && ss1.every((b, i) => b === ss2[i]);
    console.log("Shared secret match:", match);

    return match;
  } catch (error) {
    console.error(`Error in KEM ${name}:`, error);
    if (error.stack) console.error(error.stack);
    return false;
  }
}

async function fuzzTestKEMVariant(name, wrapper) {
  console.log(`\n--- Fuzz Testing KEM ${name} ---`);
  try {
    // Generate valid keypair
    const { publicKey, secretKey } = wrapper.generateKeypair();

    // Test with valid encaps/decaps
    for (let i = 0; i < 5; ++i) {
      const { ciphertext, sharedSecret: ss1 } = wrapper.encapsulate(publicKey);
      const ss2 = wrapper.decapsulate(ciphertext, secretKey);
      if (ss1.length !== ss2.length || !ss1.every((b, i) => b === ss2[i])) {
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
    if (ssCorrupt && ssCorrupt.every((b, i) => b === ss1[i])) {
      console.error('Fuzz fail: corrupted ciphertext produced same shared secret!');
      return false;
    }

    // Fuzz: wrong secret key
    const { secretKey: wrongSK } = wrapper.generateKeypair();
    const ssWrong = wrapper.decapsulate(ciphertext, wrongSK);
    if (ssWrong && ssWrong.every((b, i) => b === ss1[i])) {
      console.error('Fuzz fail: wrong secret key produced same shared secret!');
      return false;
    }

    console.log('Fuzz test passed');
    return true;
  } catch (error) {
    console.error(`Fuzz error in KEM ${name}:`, error);
    return false;
  }
}

async function runKEMTests() {
  try {
    console.log('Initializing PQC KEMs...');
    const { mlkem } = await createPQ();
    const { frodokem } = await createPQ();
    console.log('Initialization complete, starting KEM tests...');

    const results = {};
    for (const variant of mlkemVariants) {
      results[variant] = await testKEMVariant(variant, mlkem[variant]);
    }

    for (const variant of frodoKEMVariants) {
      results[variant] = await testKEMVariant(variant, frodokem[variant]);
    }

    console.log('\nKEM Test Results:');
    for (const variant of mlkemVariants) {
      console.log(`${variant}:`, results[variant] ? 'PASS' : 'FAIL');
    }

    for (const variant of frodoKEMVariants) {
      console.log(`${variant}:`, results[variant] ? 'PASS' : 'FAIL');
    }

    console.log('\nStarting KEM Fuzz Tests...');
    const fuzzResults = {};
    for (const variant of mlkemVariants) {
      fuzzResults[variant] = await fuzzTestKEMVariant(variant, mlkem[variant]);
    }

    for (const variant of frodoKEMVariants) {
      fuzzResults[variant] = await fuzzTestKEMVariant(variant, frodokem[variant]);
    }

    console.log('\nKEM Fuzz Test Results:');
    for (const variant of mlkemVariants) {
      console.log(`${variant}:`, fuzzResults[variant] ? 'PASS' : 'FAIL');
    }

    for (const variant of frodoKEMVariants) {
      console.log(`${variant}:`, fuzzResults[variant] ? 'PASS' : 'FAIL');
    }
  } catch (error) {
    console.error('Fatal error:', error);
    if (error.stack) console.error(error.stack);
  }
}

runKEMTests().catch(error => {
  console.error('Unhandled error:', error);
  if (error.stack) console.error(error.stack);
  process.exit(1);
});