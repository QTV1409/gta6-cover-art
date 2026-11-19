// Vice Nights editor: wires the controls to the cover renderer. Three photo
// slots feed three panels; each panel picks a photo and has its own zoom and
// pan. Layout, grade, caption and export size are one click each, and the
// preview canvas redraws live on every change. Photos never leave the machine.
import { GRADES, LAYOUTS, SIZES, defaultCoverState, drawCover, renderExportCanvas } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const state = defaultCoverState();
let selectedPanel = 0;

function redraw() {
  const size = SIZES[state.size];
  canvas.width = size.w;
  canvas.height = size.h;
  drawCover(canvas, state);
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

/** Loads a File object into photo slot `slot`, then redraws. */
export async function loadPhotoFile(slot, file) {
  if (!file) return;
  state.photos[slot] = await loadImage(URL.createObjectURL(file));
  document.getElementById(`slot-${slot}-name`).textContent = file.name;
  state.panelPhoto[selectedPanel] = slot;
  syncPanelControls();
  redraw();
}

/** Loads a bundled sample photo into slot `slot`. */
export async function loadSamplePhoto(slot, sample) {
  state.photos[slot] = await loadImage(`samples/${sample}.jpg`);
  document.getElementById(`slot-${slot}-name`).textContent = `Sample: ${sample}`;
  redraw();
}

/** Builds the layout / grade / size picker buttons from the renderer tables. */
export function buildPickerButtons() {
  const layoutBox = document.getElementById('layout-pick');
  Object.entries(LAYOUTS).forEach(([key, layout]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pick';
    button.dataset.value = key;
    button.textContent = layout.name;
    button.addEventListener('click', () => {
      state.layout = key;
      layoutBox.querySelectorAll('.pick').forEach((b) => b.classList.toggle('on', b === button));
      redraw();
    });
    layoutBox.appendChild(button);
  });
  layoutBox.firstChild.classList.add('on');
  const gradeBox = document.getElementById('grade-pick');
  Object.entries(GRADES).forEach(([key, grade]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pick';
    button.dataset.value = key;
    button.textContent = grade.name;
    button.addEventListener('click', () => {
      state.grade = key;
      gradeBox.querySelectorAll('.pick').forEach((b) => b.classList.toggle('on', b === button));
      redraw();
    });
    gradeBox.appendChild(button);
  });
  gradeBox.firstChild.classList.add('on');
  const sizeBox = document.getElementById('size-pick');
  Object.entries(SIZES).forEach(([key, size]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pick';
    button.dataset.value = key;
    button.textContent = size.label;
    button.addEventListener('click', () => {
      state.size = key;
      sizeBox.querySelectorAll('.pick').forEach((b) => b.classList.toggle('on', b === button));
      document.getElementById('export').textContent = `Export PNG ${size.w} × ${size.h}`;
      redraw();
    });
    sizeBox.appendChild(button);
  });
  sizeBox.firstChild.classList.add('on');
}

/** Keeps the panel crop controls in step with the selected panel. */
export function syncPanelControls() {
  const i = selectedPanel;
  document.getElementById('panel-label').textContent = `Panel ${i + 1} crop`;
  document.getElementById('panel-photo').value = String(state.panelPhoto[i]);
  document.getElementById('zoom').value = String(state.zoom[i]);
  document.getElementById('pan-x').value = String(state.panX[i]);
  document.getElementById('pan-y').value = String(state.panY[i]);
  document.getElementById('zoom-value').textContent = `${Math.round(state.zoom[i] * 100)}%`;
  document.querySelectorAll('#panel-tabs .pick').forEach((b, j) => b.classList.toggle('on', j === i));
}

/** Exports the current cover at the chosen size as a PNG download. */
export function exportCoverPng() {
  const out = renderExportCanvas(state);
  const size = SIZES[state.size];
  out.toBlob((blob) => {
    if (!blob) {
      status.textContent = 'Export failed — try again.';
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-nights-cover-${size.w}x${size.h}.png`;
    a.click();
    status.textContent = `Saved vice-nights-cover-${size.w}x${size.h}.png`;
  }, 'image/png');
}

function wireControls() {
  buildPickerButtons();
  for (let slot = 0; slot < 3; slot++) {
    document.getElementById(`photo-${slot}`).addEventListener('change', (e) => {
      loadPhotoFile(slot, e.target.files[0]).catch(() => {
        status.textContent = 'That photo could not be read.';
      });
    });
    document.getElementById(`sample-${slot}`).addEventListener('click', () => {
      loadSamplePhoto(slot, slot === 1 ? 'boulevard' : 'pier').catch(() => {
        status.textContent = 'Sample photo could not be loaded.';
      });
    });
  }
  const panelTabs = document.getElementById('panel-tabs');
  for (let i = 0; i < 3; i++) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pick';
    button.textContent = `Panel ${i + 1}`;
    button.addEventListener('click', () => {
      selectedPanel = i;
      syncPanelControls();
    });
    panelTabs.appendChild(button);
  }
  document.getElementById('panel-photo').addEventListener('change', (e) => {
    state.panelPhoto[selectedPanel] = Number(e.target.value);
    redraw();
  });
  document.getElementById('zoom').addEventListener('input', (e) => {
    state.zoom[selectedPanel] = Number(e.target.value);
    document.getElementById('zoom-value').textContent = `${Math.round(state.zoom[selectedPanel] * 100)}%`;
    redraw();
  });
  document.getElementById('pan-x').addEventListener('input', (e) => {
    state.panX[selectedPanel] = Number(e.target.value);
    redraw();
  });
  document.getElementById('pan-y').addEventListener('input', (e) => {
    state.panY[selectedPanel] = Number(e.target.value);
    redraw();
  });
  document.getElementById('title').addEventListener('input', (e) => {
    state.title = e.target.value;
    redraw();
  });
  document.getElementById('subtitle').addEventListener('input', (e) => {
    state.subtitle = e.target.value;
    redraw();
  });
  document.getElementById('badge').addEventListener('input', (e) => {
    state.badge = e.target.value;
    redraw();
  });
  document.getElementById('halftone').addEventListener('change', (e) => {
    state.halftone = e.target.checked;
    redraw();
  });
  document.getElementById('vignette').addEventListener('change', (e) => {
    state.vignette = e.target.checked;
    redraw();
  });
  document.getElementById('rays').addEventListener('change', (e) => {
    state.rays = e.target.checked;
    redraw();
  });
  document.getElementById('borders').addEventListener('change', (e) => {
    state.borders = e.target.checked;
    redraw();
  });
  document.getElementById('fill-all').addEventListener('click', () => {
    const slot = state.photos[0] ? 0 : state.photos.findIndex(Boolean);
    if (slot < 0) {
      status.textContent = 'Add a photo first, then fill all panels with it.';
      return;
    }
    state.panelPhoto = [slot, slot, slot];
    syncPanelControls();
    redraw();
    status.textContent = 'One photo now fills all three panels.';
  });
  document.getElementById('export').addEventListener('click', exportCoverPng);
}

wireControls();
syncPanelControls();

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  runShot(shot, params, state, loadSamplePhoto, loadImage, redraw);
} else {
  if (document.fonts?.load) {
    document.fonts.load('80px "AntonCover"').then(redraw).catch(() => redraw());
  }
  redraw();
}
