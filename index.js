const { init: initDilithium, cleanup: cleanupDilithium } = require('./sig/dilithium/src/index.js');
const { init: initSphincs, cleanup: cleanupSphincs } = require('./sig/sphincs/src/index.js');
const { init: initFalcon, cleanup: cleanupFalcon } = require('./sig/falcon/src/index.js');
const { init: initMLKEM, cleanup: cleanupMLKEM } = require('./kem/mlkem/src/index.js'); 

async function createPQ() {
  const dilithium = await initDilithium();
  const sphincs = await initSphincs();
  const falcon = await initFalcon();
  const mlkem = await initMLKEM();
  return { dilithium, sphincs, falcon, mlkem };
}

function cleanupPQ() {
  cleanupDilithium();
  cleanupSphincs();
  cleanupFalcon();
  cleanupMLKEM();
}

module.exports = { createPQ, cleanupPQ };