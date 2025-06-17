## ⚠️ Classic McEliece Variant Disclaimer & Usage

This package provides two builds for Classic McEliece KEM:

- **Small build:**  
  Includes only the small and medium variants (`348864`, `348864f`, `460896`, `460896f`).  
  These variants are supported with a moderate memory footprint (512MB RAM reserved) and will work on most systems.

- **Full build:**  
  Includes all Classic McEliece variants, including the largest (`6688128`, `6688128f`, `6960119`, `6960119f`, `8192128`, `8192128f`).  
  **Warning:** The largest variants require up to 2GB of RAM due to their extremely large key and ciphertext sizes. They may not work in all environments, especially in browsers or on systems with limited memory.

### Usage

- **Default (small/medium variants, efficient):**
  ```js
  const { createPQ } = require('pq-js');
  const pq = await createPQ();
  // pq.mceliece will only include the small/medium variants
  ```
  Only the small/medium WASM build is loaded (512MB RAM reserved).

- **Full (all variants, including large, 2GB RAM):**
  ```js
  const { createPQFull } = require('pq-js');
  const pq = await createPQFull();
  // pq.mceliece will include all variants, but 2GB RAM is reserved
  ```
  The full WASM build is loaded (2GB RAM reserved for Classic McEliece).

**Note:**  
- If you only use `createPQ`, the large/2GB WASM build is never loaded and no extra RAM is reserved.  
- Only use `createPQFull` if you need the largest Classic McEliece variants and your system can allocate sufficient memory.

---

## Classic McEliece Usage and Memory Details

For more details, see the documentation on memory requirements and supported variants.
