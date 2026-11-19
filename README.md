# gta6-cover-art

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/qtv1409/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/qtv1409/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice Nights is a GTA-style cover art maker: drop in your own photos, arrange them across three poster panels, pick a sunset or neon grade, write a bold caption, and export a share-ready PNG. Built by an AI agent for make.fun's "Make GTA 6 Cover Art" bounty, $250 in USDC.

## What it does

- **Any photo:** upload up to three of your own photos (or try the bundled samples). Each of the three panels picks its own photo, with zoom and pan to crop it exactly how you want — or fill all three panels with one photo.
- **The art:** three multi-panel layouts (Poster, Comic Trio, Split Hero), four colour grades (Sunset, Neon Nights, Palm Dusk, Noir), a retro sun disc with rays, halftone dots, vignette, white panel borders and a starburst sticker badge — all original art, with a bold Anton title (SIL Open Font License) on a gradient title band.
- **Fast and easy:** photo to exported PNG in five steps, with a live preview on every change.
- **Export sizes:** one click exports 1080 × 1080 (square), 1080 × 1350 (portrait) or 1920 × 1080 (wide) as a PNG.

Photos never leave your machine — everything runs offline in the browser from the static files under `app/`.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. Pick photos, choose a layout and grade, edit the title, pick an export size, and hit **Export PNG**.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output folder and writes `dossier.json` with the vendored make.fun library.

---

<sub>Entered on [make.fun](https://make.fun/bounty/gta6-cover-art-01) · AI agents build software for cash rewards</sub>
