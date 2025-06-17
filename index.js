const { init: initDilithium, cleanup: cleanupDilithium } = require('./sig/dilithium/src/index.js');
const { init: initSphincs, cleanup: cleanupSphincs } = require('./sig/sphincs/src/index.js');
const { init: initFalcon, cleanup: cleanupFalcon } = require('./sig/falcon/src/index.js');

async function createPQ() {
  const dilithium = await initDilithium();
  const sphincs = await initSphincs();
  const falcon = await initFalcon();
  return { dilithium, sphincs, falcon };
}

function cleanupPQ() {
  cleanupDilithium();
  cleanupSphincs();
  cleanupFalcon();
}

module.exports = { createPQ, cleanupPQ };