// Vice Nights — the hand-in program for the gta6-cover-art-01 entry.
// It is plain Node 22 with only the standard library, and it runs with no
// network: it copies this repository's app/ and screenshots/ into the output
// folder and writes dossier.json there with the vendored make.fun library,
// so the judge can read the app's source and screenshots from one file.
// The output folder is /output in the grader; locally, setting
// MAKEFUN_OUTPUT_DIR points it somewhere else instead:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Run it twice and the two output trees must be byte-identical.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The caps below mirror the gate: at most 4 screenshots of 256 KiB each,
// app/ under 993 files and 48 MiB, paths under 1,000 bytes, and the dossier
// text capped at 160 KiB. Anything over a cap fails the hand-in here rather
// than silently passing a broken entry to the scorer.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
