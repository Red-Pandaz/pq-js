const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const distBrowserDir = path.join(root, 'dist-browser');
const wrappers = [
  'sig/dilithium',
  'sig/falcon',
  'sig/sphincs',
  'kem/mlkem',
  'kem/frodokem',
  'kem/classic_mceliece',
];

function copyDirContents(srcDir, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  const files = fs.readdirSync(srcDir);
  files.forEach(file => {
    const src = path.join(srcDir, file);
    const dest = path.join(destDir, file);
    fs.copyFileSync(src, dest);
    console.log(`Copied ${src} → ${dest}`);
  });
}

// 1. Copy wrapper output files to dist/[sig|kem]/[algo] for Node.js usage
wrappers.forEach(wrapper => {
  const algo = path.basename(wrapper);
  const group = wrapper.split('/')[0]; // 'sig' or 'kem'

  const srcDir = path.join(root, wrapper, 'dist');
  const destDir = path.join(distDir, group, algo);

  if (!fs.existsSync(srcDir)) {
    console.warn(`⚠️  Wrapper build output not found: ${srcDir}`);
    return;
  }

  copyDirContents(srcDir, destDir);

  // Move compiled index.js if in dist/[...]/src/index.js
  const indexPath = path.join(destDir, 'src', 'index.js');
  if (fs.existsSync(indexPath)) {
    const movedPath = path.join(destDir, 'index.js');
    fs.renameSync(indexPath, movedPath);
    console.log(`Moved ${indexPath} → ${movedPath}`);

    try {
      fs.rmdirSync(path.join(destDir, 'src'));
    } catch (e) {
      // ignore if not empty
    }
  }
});

// 2. Copy wrapper files to dist-browser/[sig|kem]/[algo] for browser usage
wrappers.forEach(wrapper => {
  const algo = path.basename(wrapper);
  const group = wrapper.split('/')[0]; // 'sig' or 'kem'

  const srcDir = path.join(root, wrapper, 'dist-browser');
  const destDir = path.join(distBrowserDir, group, algo);

  if (!fs.existsSync(srcDir)) {
    // Fallback to dist if dist-browser doesn't exist, as some may not have a browser-specific build
    const fallbackSrcDir = path.join(root, wrapper, 'dist');
    if (fs.existsSync(fallbackSrcDir)) {
      copyDirContents(fallbackSrcDir, destDir);
    } else {
      console.warn(`⚠️  Wrapper build output not found for browser: ${srcDir} and no fallback.`);
    }
    return;
  }

  copyDirContents(srcDir, destDir);
});

// 3. Move dist/src/*.js to dist/
const distSrc = path.join(distDir, 'src');
if (fs.existsSync(distSrc)) {
  const files = fs.readdirSync(distSrc);
  files.forEach(file => {
    const from = path.join(distSrc, file);
    const to = path.join(distDir, file);
    fs.renameSync(from, to);
    console.log(`Moved dist/src/${file} → dist/${file}`);
  });

  try {
    fs.rmdirSync(distSrc);
  } catch (e) {
    // ignore
  }
}
