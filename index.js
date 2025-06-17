const { init: initDilithium, cleanup: cleanupDilithium } = require('./sig/dilithium/src/index.js');
const { init: initSphincs, cleanup: cleanupSphincs } = require('./sig/sphincs/src/index.js');
const { init: initFalcon, cleanup: cleanupFalcon } = require('./sig/falcon/src/index.js');
const { init: initMLKEM, cleanup: cleanupMLKEM } = require('./kem/mlkem/src/index.js'); 
const { init: initFrodoKEM, cleanup: cleanupFrodoKEM } = require('./kem/frodokem/src/index.js');

async function createPQ() {
  const dilithium = await initDilithium();
  const sphincs = await initSphincs();
  const falcon = await initFalcon();
  const mlkem = await initMLKEM();
  const frodokem = await initFrodoKEM();
  return { dilithium, sphincs, falcon, mlkem, frodokem };
}

function cleanupPQ() {
  cleanupDilithium();
  cleanupSphincs();
  cleanupFalcon();
  cleanupMLKEM();
  cleanupFrodoKEM();
}

module.exports = { createPQ, cleanupPQ };