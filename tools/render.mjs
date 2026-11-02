// Rendert ein Video: node tools/render.mjs <compositionId> <out.mp4> [startFrame-endFrame]
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const [id, out, range] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id});
const frameRange = range ? range.split('-').map(Number) : null;
let last = -1;
await renderMedia({
  serveUrl,
  composition,
  codec: 'h264',
  crf: 18,
  pixelFormat: 'yuv420p',
  outputLocation: out,
  frameRange,
  concurrency: 6,
  onProgress: ({progress}) => {
    const p = Math.floor(progress * 20);
    if (p !== last) {
      last = p;
      console.log(`${Math.round(progress * 100)}%`);
    }
  },
});
console.log('fertig', out);
