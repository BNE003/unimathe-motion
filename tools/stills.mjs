// Rendert Standbilder zu Sekundenmarken: node tools/stills.mjs out-dir 0.5 2.0 ...
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const [outDir, ...secs] = process.argv.slice(2);
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: process.env.COMP ?? 'Eigenvektoren'});
for (const s of secs) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(Number(s) * composition.fps));
  const output = path.join(outDir, `t${String(s).replace('.', '_')}.png`);
  await renderStill({serveUrl, composition, frame, output, scale: 0.5});
  console.log('ok', s, output);
}
