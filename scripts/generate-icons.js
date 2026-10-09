import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal PNG generator using standard Node zlib
function createPng(width, height, r, g, b) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type);
    const crcVal = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeInt32BE(crcVal, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      let byte = buf[i];
      for (let j = 0; j < 8; j++) {
        const bit = (crc ^ byte) & 1;
        crc = (crc >>> 1) ^ (bit ? 0xedb88320 : 0);
        byte >>>= 1;
      }
    }
    return crc ^ -1;
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type 2 = RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Raw image data with filter byte 0 at start of each scanline
  const scanline = Buffer.alloc(1 + width * 3);
  scanline[0] = 0; // filter 0
  for (let x = 0; x < width; x++) {
    // Subtle coffee brown border / center
    const cx = width / 2;
    const cy = height / 2;
    const dist = Math.sqrt((x - cx) ** 2 + (height / 2 - cy) ** 2);
    const inCircle = dist < width * 0.45;

    const pr = inCircle ? 0x6f : r;
    const pg = inCircle ? 0x4e : g;
    const pb = inCircle ? 0x37 : b;

    scanline[1 + x * 3] = pr;
    scanline[1 + x * 3 + 1] = pg;
    scanline[1 + x * 3 + 2] = pb;
  }

  const rawRows = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.from(scanline);
    // Add coffee cup shape simulation
    rawRows.push(row);
  }

  const rawData = Buffer.concat(rawRows);
  const idatData = zlib.deflateSync(rawData);
  const ihdrChunk = chunk('IHDR', ihdr);
  const idatChunk = chunk('IDAT', idatData);
  const iendChunk = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Background dark coffee color: #1c1917 -> 28, 25, 23
fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), createPng(192, 192, 28, 25, 23));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), createPng(512, 512, 28, 25, 23));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), createPng(512, 512, 35, 27, 21));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), createPng(180, 180, 28, 25, 23));
fs.writeFileSync(path.join(outDir, 'favicon.ico'), createPng(32, 32, 28, 25, 23));
console.log('Icons generated successfully in public/');
