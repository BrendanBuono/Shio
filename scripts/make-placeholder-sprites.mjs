// Generates the placeholder pixel-art sprite sheets under public/game/sprites.
// Frames are drawn as text grids so they can be edited without an image editor.
// Run with: npm run sprites
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'game', 'sprites');

const palette = {
  '.': null,
  k: [29, 29, 43, 255], // outline
  s: [230, 57, 70, 255], // body, the original box's red
  b: [164, 22, 26, 255], // body shadow
  w: [255, 255, 255, 255], // eye
  f: [43, 45, 66, 255], // feet
  g: [90, 166, 74, 255], // grass
  G: [126, 200, 80, 255], // grass highlight
  d: [141, 90, 59, 255], // dirt
  D: [107, 66, 38, 255], // dirt speck
};

const body = [
  '................',
  '................',
  '.....kkkkkk.....',
  '....kssssssk....',
  '...kssssssssk...',
  '...kswwsswwsk...',
  '...kskwsskwsk...',
  '...kssssssssk...',
  '...ksbssssbsk...',
  '...kssbbbbssk...',
  '....kssssssk....',
  '.....kkkkkk.....',
];

const legs = {
  stand: ['.....kf..kf.....', '.....kf..kf.....', '....kff..kff....', '................'],
  stepLeft: ['....kf...kf.....', '...kf.....kf....', '..kff.....kff...', '................'],
  stepRight: ['.....kf...kf....', '....kf.....kf...', '...kff.....kff..', '................'],
  tucked: ['.....kf..kf.....', '....kff..kff....', '................', '................'],
};

const playerFrames = [
  [...body, ...legs.stand], // 0 idle
  [...body, ...legs.stepLeft], // 1 walk
  [...body, ...legs.stand], // 2 walk
  [...body, ...legs.stepRight], // 3 walk
  [...body, ...legs.stand], // 4 walk
  [...body, ...legs.tucked], // 5 jump
];

const grassTop = ['gGggGgGggGgGgGgG', 'ggGgggGggGggGggg'];
const dirtRow = (y) => Array.from({ length: 16 }, (_, x) => ((x * 7 + y * 13) % 11 === 0 ? 'D' : 'd')).join('');
const tileFrames = [
  [...grassTop, ...Array.from({ length: 14 }, (_, i) => dirtRow(i + 2))], // 0 grass top
  Array.from({ length: 16 }, (_, i) => dirtRow(i)), // 1 dirt fill
];

function encodeSheet(frames) {
  const height = frames[0].length;
  const width = frames[0][0].length;
  for (const frame of frames) {
    if (frame.length !== height || frame.some((row) => row.length !== width)) {
      throw new Error('Every frame must be the same size');
    }
  }
  const sheetWidth = width * frames.length;
  const stride = sheetWidth * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0; // PNG filter type: none
    frames.forEach((frame, f) => {
      for (let x = 0; x < width; x++) {
        const rgba = palette[frame[y][x]];
        if (rgba === undefined) throw new Error(`Unknown palette key '${frame[y][x]}'`);
        const offset = y * stride + 1 + (f * width + x) * 4;
        if (rgba) raw.set(rgba, offset);
      }
    });
  }
  return encodePng(sheetWidth, height, raw);
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typed = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typed));
  return Buffer.concat([length, typed, crc]);
}

function encodePng(width, height, raw) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth
  header[9] = 6; // colour type: RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'player.png'), encodeSheet(playerFrames));
writeFileSync(join(outDir, 'tiles.png'), encodeSheet(tileFrames));
console.log(`wrote player.png (${playerFrames.length} frames) and tiles.png (${tileFrames.length} frames) to ${outDir}`);
