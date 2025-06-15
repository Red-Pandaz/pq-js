export default init;
const initDilithium = require('./dilithium/index.js');

async function createPQ() {
  const dilithium = await initDilithium();
  return { dilithium };
}

module.exports = { createPQ };