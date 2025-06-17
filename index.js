const { init: initDilithium, cleanup: cleanupDilithium } = require('./dilithium/src/index.js');
const { init: initSphincs, cleanup: cleanupSphincs } = require('./sphincs/src/index.js');

async function createPQ() {
  const dilithium = await initDilithium();
  const sphincs = await initSphincs();
  return { dilithium, sphincs };
}

function cleanupPQ() {
  cleanupDilithium();
  cleanupSphincs();
}

module.exports = { createPQ, cleanupPQ };