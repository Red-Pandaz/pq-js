const { init: initDilithium, cleanup: cleanupDilithium } = require('./dist/sig/dilithium/src');
const { init: initSphincs, cleanup: cleanupSphincs } = require('./dist/sig/sphincs/src/index.js');
const { init: initFalcon, cleanup: cleanupFalcon } = require('./dist/sig/falcon/src/index.js');
const { init: initMLKEM, cleanup: cleanupMLKEM } = require('./kem/mlkem/src/index.js'); 
const { init: initFrodoKEM, cleanup: cleanupFrodoKEM } = require('./kem/frodokem/src/index.js');
const { initSmall: initMcElieceSmall, initFull: initMcElieceFull, cleanupSmall: cleanupMcElieceSmall, cleanupFull: cleanupMcElieceFull } = require('./kem/classic_mceliece/src/index.js');

// By default, createPQ uses the small build for Classic McEliece (only small/medium variants, 512MB RAM)
async function createPQ() {
  const dilithium = await initDilithium();
  const sphincs = await initSphincs();
  const falcon = await initFalcon();
  const mlkem = await initMLKEM();
  const frodokem = await initFrodoKEM();
  const mceliece = await initMcElieceSmall();
  return { dilithium, sphincs, falcon, mlkem, frodokem, mceliece };
}

function cleanupPQ() {
  cleanupDilithium();
  cleanupSphincs();
  cleanupFalcon();
  cleanupMLKEM();
  cleanupFrodoKEM();
  cleanupMcElieceSmall();
}

// createPQFull uses the full build for Classic McEliece (all variants, 2GB RAM)
async function createPQFull() {
  const dilithium = await initDilithium();
  const sphincs = await initSphincs();
  const falcon = await initFalcon();
  const mlkem = await initMLKEM();
  const frodokem = await initFrodoKEM();
  const mceliece = await initMcElieceFull();
  return { dilithium, sphincs, falcon, mlkem, frodokem, mceliece };
}

function cleanupPQFull() {
  cleanupDilithium();
  cleanupSphincs();
  cleanupFalcon();
  cleanupMLKEM();
  cleanupFrodoKEM();
  cleanupMcElieceFull();
}

module.exports = { createPQ, cleanupPQ, createPQFull, cleanupPQFull };