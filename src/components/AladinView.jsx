import React, { useEffect, useRef, useState } from 'react';
import { loadAladinScript } from '../utils/aladin';

/**
 * Shows an Aladin Lite sky view centered on the selected ephemeris position.
 * @param {Object[]} rows - All ephemeris rows (with radd/decdd in decimal degrees).
 * @param {Object|null} selectedRow - The currently selected ephemeris row.
 */
export default function AladinView({ rows = [], selectedRow = null }) {
  const divId = useRef(`aladin-${Math.random().toString(36).substr(2, 9)}`);
  const aladinRef = useRef(null);
  const [showTrail, setShowTrail] = useState(true);
  const [ready, setReady] = useState(false);

  // Initialize Aladin once on mount
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        await loadAladinScript();
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
  }, [ready, selectedRow, showTrail, rows]);

  if (rows.length === 0) return null;

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 6, flexWrap: 'wrap' }}>
        <strong style={{ fontSize: '0.95em' }}>Sky field (Aladin)</strong>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.9em', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={showTrail}
            onChange={e => setShowTrail(e.target.checked)}
          />
          Show trajectory
        </label>
        {(selectedRow ?? rows[0]) && (
          <span style={{ fontSize: '0.82em', color: '#555' }}>
            RA: {(selectedRow ?? rows[0]).ra} &nbsp;|&nbsp; Dec: {(selectedRow ?? rows[0]).dec}
          </span>
        )}
      </div>
      <div id={divId.current} style={{ width: '100%', height: 420 }} />
    </div>
  );
}
