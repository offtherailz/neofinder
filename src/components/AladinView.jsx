import React, { useCallback, useEffect, useRef, useState } from 'react';
import { loadAladinScript } from '../utils/aladin';

/**
 * Shows an Aladin Lite sky view centered on the selected ephemeris position.
 * @param {Object[]} rows - All ephemeris rows (with radd/decdd in decimal degrees).
 * @param {Object|null} selectedRow - The currently selected ephemeris row.
 */
export default function AladinView({ rows = [], selectedRow = null, fovSize = null }) {
  const divId = useRef(`aladin-${Math.random().toString(36).substr(2, 9)}`);
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const aladinRef = useRef(null);
  const [showTrail, setShowTrail] = useState(true);
  const [showFov, setShowFov] = useState(true);
  const [ready, setReady] = useState(false);

  // Initialize Aladin once on mount
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        await loadAladinScript();
        if (cancelled) return;
        const el = document.getElementById(divId.current);
        if (!el) return;
        // Wait until container has non-zero height (flex layout may not be settled yet)
        await new Promise(resolve => {
          const check = () => el.clientHeight > 0 ? resolve() : requestAnimationFrame(check);
          check();
        });
        if (cancelled) return;
        const A = window.A;
        const centerRow = selectedRow ?? rows[0];
        const ra = centerRow?.radd ?? 0;
        const dec = centerRow?.decdd ?? 0;
        const aladin = A.aladin(`#${divId.current}`, {
          target: `${ra} ${dec}`,
          cooFrame: 'ICRSd',
          survey: 'P/DSS2/color',
          fov: 0.25,
          showReticle: true,
          showZoomControl: true,
          showFullscreenControl: true,
          showLayersControl: true,
          showGotoControl: false,
          showFrame: true,
          showProjectionControl: false,
          showSimbadPointerControl: false,
        });
        if (cancelled) return;
        aladinRef.current = aladin;
        setReady(true);
      } catch (err) {
        console.error('Failed to load Aladin Lite:', err);
      }
    };
    init();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update view and overlays when selection or trail toggle changes
  useEffect(() => {
    if (!ready || !aladinRef.current) return;
    const aladin = aladinRef.current;
    const A = window.A;

    // Center on selected row (or first row if none selected)
    const centerRow = selectedRow ?? rows[0];
    if (centerRow?.radd != null && centerRow?.decdd != null) {
      aladin.gotoRaDec(centerRow.radd, centerRow.decdd);
    }

    // Zoom to field when a row is selected
    if (selectedRow?.radd != null) {
      const fieldDeg = fovSize?.width && fovSize?.height
        ? Math.max(fovSize.width, fovSize.height) * 3
        : 0.5;
      aladin.setFov(fieldDeg);
    }

    // Rebuild all layers
    aladin.removeLayers();

    const validRows = rows.filter(r => Number.isFinite(r.radd) && Number.isFinite(r.decdd));

    // Trail: polyline + small dot markers for all positions
    if (showTrail && validRows.length > 1) {
      const trailOverlay = A.graphicOverlay({ color: '#29b6f6', lineWidth: 2 });
      aladin.addOverlay(trailOverlay);
      const points = validRows.map(r => [r.radd, r.decdd]);
      trailOverlay.add(A.polyline(points, { color: '#29b6f6' }));

      const trailCat = A.catalog({ name: 'Trail positions', color: '#29b6f6', sourceSize: 6, shape: 'circle' });
      aladin.addCatalog(trailCat);
      trailCat.addSources(validRows.map(r => A.source(r.radd, r.decdd, { date: String(r.date) })));
    }

    // Selected position marker (always shown if available)
    if (selectedRow?.radd != null && Number.isFinite(selectedRow.radd)) {
      const selCat = A.catalog({ name: 'Selected position', color: '#ffeb3b', sourceSize: 14, shape: 'cross' });
      aladin.addCatalog(selCat);
      selCat.addSources([A.source(selectedRow.radd, selectedRow.decdd, { date: String(selectedRow.date) })]);
    }

  }, [ready, selectedRow, showTrail, rows, fovSize]);

  // Draw FOV rectangle on canvas overlay using world2pix (works at any zoom level)
  const drawFov = useCallback(() => {
    const canvas = canvasRef.current;
    const aladin = aladinRef.current;
    if (!canvas || !aladin) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!showFov || !fovSize?.width || !fovSize?.height ||
        selectedRow?.radd == null || !Number.isFinite(selectedRow.radd)) return;

    const ra0 = selectedRow.radd;
    const dec0 = selectedRow.decdd;
    const cosDec = Math.cos(dec0 * Math.PI / 180) || 1;
    const halfW = (fovSize.width / 2) / cosDec;
    const halfH = fovSize.height / 2;

    const skyCorners = [
      [ra0 - halfW, dec0 - halfH],
      [ra0 + halfW, dec0 - halfH],
      [ra0 + halfW, dec0 + halfH],
      [ra0 - halfW, dec0 + halfH],
    ];

    const pix = skyCorners.map(([ra, dec]) => aladin.world2pix(ra, dec));
    if (pix.some(p => !p || !Number.isFinite(p[0]))) return;

    ctx.save();
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(pix[0][0], pix[0][1]);
    for (let i = 1; i < pix.length; i++) ctx.lineTo(pix[i][0], pix[i][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }, [showFov, fovSize, selectedRow]);

  // Attach Aladin pan/zoom listeners → redraw canvas
  useEffect(() => {
    if (!ready || !aladinRef.current) return;
    const aladin = aladinRef.current;
    drawFov();
    aladin.on('positionChanged', drawFov);
    aladin.on('zoomChanged', drawFov);
    return () => {
      try { aladin.off('positionChanged', drawFov); } catch (_) {}
      try { aladin.off('zoomChanged', drawFov); } catch (_) {}
    };
  }, [ready, drawFov]);

  // Keep canvas sized to its wrapper and redraw on resize
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;
    const sync = () => {
      canvas.width = wrapper.clientWidth;
      canvas.height = wrapper.clientHeight;
      drawFov();
    };
    const ro = new ResizeObserver(sync);
    ro.observe(wrapper);
    sync();
    return () => ro.disconnect();
  }, [drawFov]);

  if (rows.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '4px 0', flexWrap: 'wrap', flexShrink: 0 }}>
        <strong style={{ fontSize: '0.95em' }}>Sky field (Aladin)</strong>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.9em', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={showTrail}
            onChange={e => setShowTrail(e.target.checked)}
          />
          Show trajectory
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.9em', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={showFov}
            onChange={e => setShowFov(e.target.checked)}
          />
          Show FOV
        </label>
        {(selectedRow ?? rows[0]) && (
          <span style={{ fontSize: '0.82em', color: '#555' }}>
            RA: {(selectedRow ?? rows[0]).ra} &nbsp;|&nbsp; Dec: {(selectedRow ?? rows[0]).dec}
          </span>
        )}
      </div>
      <div ref={wrapperRef} style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <div id={divId.current} style={{ width: '100%', height: '100%' }} />
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} />
      </div>
    </div>
  );
}
