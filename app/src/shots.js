// Fixed scenes for screenshots: ?shot=editor shows the page with sample
// photos loaded; ?shot=cover shows the finished cover alone; ?shot=export
// renders one export and writes its real PNG size into #status, so the
// export path can be checked headlessly. window.__shotReady is set once
// the scene has painted.
export async function runShot(shot, query, state, loadSamplePhoto, loadImage, redraw) {
  const caption = query.get('caption') ?? 'Sunset Heist';
  const subtitle = query.get('subtitle') ?? 'VICE NIGHTS · EST. 2026';
  const badge = query.get('badge') ?? 'NEW';
  state.title = caption;
  state.subtitle = subtitle;
  state.badge = badge;
  if (query.get('layout')) state.layout = query.get('layout');
  if (query.get('grade')) state.grade = query.get('grade');
  if (query.get('size')) state.size = query.get('size');
  document.getElementById('title').value = caption;
  document.getElementById('subtitle').value = subtitle;
  document.getElementById('badge').value = badge;
  const photoA = query.get('photo') ?? 'pier';
  const photoB = query.get('photo2') ?? 'boulevard';
  await loadSamplePhoto(0, photoA);
  await loadSamplePhoto(1, photoB);
  state.panelPhoto = [0, 1, shot === 'cover' && query.get('layout') === 'trio' ? 0 : 1];
  if (query.get('panelPhoto')) {
    state.panelPhoto = query.get('panelPhoto').split(',').map(Number);
  }
  if (query.get('panY')) {
    state.panY = query.get('panY').split(',').map(Number);
  }
  if (query.get('zoom')) {
    state.zoom = query.get('zoom').split(',').map(Number);
  }
  if (shot === 'cover' || shot === 'export') {
    document.body.classList.add('shot-cover');
    document.getElementById('export').textContent = '';
  }
  if (document.fonts?.load) {
    try { await document.fonts.load('80px "AntonCover"'); } catch { /* fall back to system font */ }
  }
  redraw();
  if (shot === 'export') {
    const { renderExportCanvas } = await import('./cover.js');
    const out = renderExportCanvas(state);
    const blob = await new Promise((resolve) => out.toBlob(resolve, 'image/png'));
    const status = document.getElementById('status');
    status.textContent = `EXPORT ${out.width}x${out.height} png=${blob.size} bytes type=${blob.type}`;
    document.title = status.textContent;
  }
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
