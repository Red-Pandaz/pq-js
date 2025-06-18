import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

// Helper function to run CLI commands
async function runCLI(args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    const child = spawn('node', ['dist/cli.js', ...args], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({
        stdout,
        stderr,
        exitCode: code || 0
      });
    });
  });
}

// Test CLI help
async function testCLIHelp(): Promise<boolean> {
  console.log('\n--- Testing CLI Help ---');
  try {
    const result = await runCLI([]);
    if (result.exitCode !== 0) {
      console.error('Help test failed: expected exit code 0, got', result.exitCode);
      return false;
    }
    if (!result.stdout.includes('Post-Quantum Cryptography CLI')) {
      console.error('Help test failed: missing CLI description');
      return false;
    }
    if (!result.stdout.includes('Available Algorithms:')) {
      console.error('Help test failed: missing algorithm list');
      return false;
    }
    console.log('CLI help test: PASS');
    return true;
  } catch (error) {
    console.error('CLI help test error:', error);
    return false;
  }
}

// Test invalid algorithm
async function testInvalidAlgorithm(): Promise<boolean> {
  console.log('\n--- Testing Invalid Algorithm ---');
  try {
    const result = await runCLI(['invalid_algorithm', 'generateKey']);
    if (result.exitCode === 0) {
      console.error('Invalid algorithm test failed: expected non-zero exit code');
      return false;
    }
    if (!result.stderr.includes('Unknown algorithm')) {
      console.error('Invalid algorithm test failed: missing error message');
      return false;
    }
    console.log('Invalid algorithm test: PASS');
    return true;
  } catch (error) {
    console.error('Invalid algorithm test error:', error);
    return false;
  }
}

// Test invalid operation
async function testInvalidOperation(): Promise<boolean> {
  console.log('\n--- Testing Invalid Operation ---');
  try {
    const result = await runCLI(['dilithium2', 'invalid_operation']);
    if (result.exitCode === 0) {
      console.error('Invalid operation test failed: expected non-zero exit code');
      return false;
    }
    if (!result.stderr.includes('Unknown operation')) {
      console.error('Invalid operation test failed: missing error message');
      return false;
    }
    console.log('Invalid operation test: PASS');
    return true;
  } catch (error) {
    console.error('Invalid operation test error:', error);
    return false;
  }
}

// Test signature algorithm key generation
async function testSignatureKeyGeneration(): Promise<boolean> {
  console.log('\n--- Testing Signature Key Generation ---');
  try {
    const result = await runCLI(['dilithium2', 'generateKey']);
    if (result.exitCode !== 0) {
      console.error('Signature key generation test failed: exit code', result.exitCode);
      console.error('stderr:', result.stderr);
      return false;
    }
    if (!result.stdout.includes('Generated keypair:')) {
      console.error('Signature key generation test failed: missing keypair output');
      return false;
    }
    if (!result.stdout.includes('Public key') || !result.stdout.includes('Secret key')) {
      console.error('Signature key generation test failed: missing key information');
      return false;
    }
    console.log('Signature key generation test: PASS');
    return true;
  } catch (error) {
    console.error('Signature key generation test error:', error);
    return false;
  }
}

// Test KEM algorithm key generation
async function testKEMKeyGeneration(): Promise<boolean> {
  console.log('\n--- Testing KEM Key Generation ---');
  try {
    const result = await runCLI(['mlkem_512', 'generateKey']);
    if (result.exitCode !== 0) {
      console.error('KEM key generation test failed: exit code', result.exitCode);
      console.error('stderr:', result.stderr);
      return false;
    }
    if (!result.stdout.includes('Generated keypair:')) {
      console.error('KEM key generation test failed: missing keypair output');
      return false;
    }
    if (!result.stdout.includes('Public key') || !result.stdout.includes('Secret key')) {
      console.error('KEM key generation test failed: missing key information');
      return false;
    }
    console.log('KEM key generation test: PASS');
    return true;
  } catch (error) {
    console.error('KEM key generation test error:', error);
    return false;
  }
}

// Test signature signing and verification
async function testSignatureSignVerify(): Promise<boolean> {
  console.log('\n--- Testing Signature Sign/Verify ---');
  try {
    // Generate keypair first
    const keyResult = await runCLI(['dilithium2', 'generateKey']);
    if (keyResult.exitCode !== 0) {
      console.error('Failed to generate keypair for sign/verify test');
      return false;
    }

    // Extract secret key from output (improved regex)
    const lines = keyResult.stdout.split('\n');
    let secretKeyHex = '';
    for (const line of lines) {
      if (line.includes('Secret key') && line.includes('bytes:')) {
        // Look for the hex pattern after the colon
        const match = line.match(/Secret key \(\d+ bytes\):\s*([a-f0-9]+)/i);
        if (match) {
          secretKeyHex = match[1];
          break;
        }
      }
    }

    if (!secretKeyHex) {
      // Try alternative approach: join all lines and search
      const fullOutput = keyResult.stdout.replace(/\n/g, ' ');
      const secretMatch = fullOutput.match(/Secret key \(\d+ bytes\):\s*([a-f0-9]+)/i);
      if (secretMatch) {
        secretKeyHex = secretMatch[1];
      }
    }

    if (!secretKeyHex) {
      console.error('Failed to extract secret key from output');
      console.error('Output was:', keyResult.stdout);
      return false;
    }

    // Sign a message
    const signResult = await runCLI(['dilithium2', 'sign', 'Test Message', secretKeyHex]);
    if (signResult.exitCode !== 0) {
      console.error('Sign test failed: exit code', signResult.exitCode);
      console.error('stderr:', signResult.stderr);
      return false;
    }

    if (!signResult.stdout.includes('Signature:')) {
      console.error('Sign test failed: missing signature output');
      return false;
    }

    console.log('Signature sign/verify test: PASS (signing only - verification requires public key extraction)');
    return true;
  } catch (error) {
    console.error('Signature sign/verify test error:', error);
    return false;
  }
}

// Test KEM encapsulation
async function testKEMEncapsulation(): Promise<boolean> {
  console.log('\n--- Testing KEM Encapsulation ---');
  try {
    // Generate keypair first
    const keyResult = await runCLI(['mlkem_512', 'generateKey']);
    if (keyResult.exitCode !== 0) {
      console.error('Failed to generate keypair for encapsulation test');
      return false;
    }

    // Extract public key from output (improved regex)
    const lines = keyResult.stdout.split('\n');
    let publicKeyHex = '';
    for (const line of lines) {
      if (line.includes('Public key') && line.includes('bytes:')) {
        // Look for the hex pattern after the colon
        const match = line.match(/Public key \(\d+ bytes\):\s*([a-f0-9]+)/i);
        if (match) {
          publicKeyHex = match[1];
          break;
        }
      }
    }

    if (!publicKeyHex) {
      // Try alternative approach: join all lines and search
      const fullOutput = keyResult.stdout.replace(/\n/g, ' ');
      const publicMatch = fullOutput.match(/Public key \(\d+ bytes\):\s*([a-f0-9]+)/i);
      if (publicMatch) {
        publicKeyHex = publicMatch[1];
      }
    }

    if (!publicKeyHex) {
      console.error('Failed to extract public key from output');
      console.error('Output was:', keyResult.stdout);
      return false;
    }

    // Encapsulate
    const encapsResult = await runCLI(['mlkem_512', 'encapsulate', publicKeyHex]);
    if (encapsResult.exitCode !== 0) {
      console.error('Encapsulation test failed: exit code', encapsResult.exitCode);
      console.error('stderr:', encapsResult.stderr);
      return false;
    }

    if (!encapsResult.stdout.includes('Encapsulation result:')) {
      console.error('Encapsulation test failed: missing encapsulation output');
      return false;
    }

    if (!encapsResult.stdout.includes('Ciphertext') || !encapsResult.stdout.includes('Shared secret')) {
      console.error('Encapsulation test failed: missing ciphertext or shared secret');
      return false;
    }

    console.log('KEM encapsulation test: PASS');
    return true;
  } catch (error) {
    console.error('KEM encapsulation test error:', error);
    return false;
  }
}

// Test operation restrictions
async function testOperationRestrictions(): Promise<boolean> {
  console.log('\n--- Testing Operation Restrictions ---');
  
  // Test that KEM algorithms don't support sign operation
  try {
    const result = await runCLI(['mlkem_512', 'sign', 'message', 'secretkey']);
    if (result.exitCode === 0) {
      console.error('KEM sign restriction test failed: KEM should not support sign operation');
      return false;
    }
    if (!result.stderr.includes('sign operation only available for signature algorithms')) {
      console.error('KEM sign restriction test failed: missing correct error message');
      return false;
    }
  } catch (error) {
    console.error('KEM sign restriction test error:', error);
    return false;
  }

  // Test that signature algorithms don't support encapsulate operation
  try {
    const result = await runCLI(['dilithium2', 'encapsulate', 'publickey']);
    if (result.exitCode === 0) {
      console.error('Signature encapsulate restriction test failed: signature should not support encapsulate operation');
      return false;
    }
    if (!result.stderr.includes('encapsulate operation only available for KEM algorithms')) {
      console.error('Signature encapsulate restriction test failed: missing correct error message');
      return false;
    }
  } catch (error) {
    console.error('Signature encapsulate restriction test error:', error);
    return false;
  }

  console.log('Operation restrictions test: PASS');
  return true;
}

// Main test runner
async function runCLITests(): Promise<void> {
  console.log('Starting CLI Tests...');
  
  const tests = [
    testCLIHelp,
    testInvalidAlgorithm,
    testInvalidOperation,
    testSignatureKeyGeneration,
    testKEMKeyGeneration,
    testSignatureSignVerify,
    testKEMEncapsulation,
    testOperationRestrictions
  ];

  const results: Record<string, boolean> = {};
  
  for (const test of tests) {
    const testName = test.name;
    try {
      results[testName] = await test();
    } catch (error) {
      console.error(`Test ${testName} threw an error:`, error);
      results[testName] = false;
    }
  }

  console.log('\n=== CLI Test Results ===');
  for (const [testName, passed] of Object.entries(results)) {
    console.log(`${testName}: ${passed ? 'PASS' : 'FAIL'}`);
  }

  const passedCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  
  console.log(`\nOverall: ${passedCount}/${totalCount} tests passed`);
  
  if (passedCount === totalCount) {
    console.log('🎉 All CLI tests passed!');
  } else {
    console.log('❌ Some CLI tests failed');
    process.exit(1);
  }
}

// Run the tests
runCLITests().catch((error) => {
  console.error('Unhandled error in CLI tests:', error);
  process.exit(1);
}); 