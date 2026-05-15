import React, { useEffect, useRef, useState } from 'react';
import { loadAladinScript } from '../utils/aladin';
import { skyMapCenter } from '../utils/utils';

/**
 * Main Aladin Lite sky map replacing d3-celestial SkyMap.
 *
 * Shows:
 *  - All filtered asteroids (orange circles)
 *  - Selected asteroids (blue crosses, larger)
 *  - Ephemeris trails as polylines (green)
 *  - Selected ephemeris trails (blue, thicker)
 *
 * @param {Object}   filteredAsteroids  GeoJSON FeatureCollection of asteroids (coords in degrees)
 * @param {Set}      selectedAsteroids  Set of asteroid name strings currently selected
 * @param {Object}   ephemerids         Map of name → { ephem: [{radd, decdd}] }
 * @param {Object}   position           { latitude, longitude } or null
 * @param {Date}     time               Current time (used to compute LST center)
 */
export default function AladinMainMap({
  filteredAsteroids,
  selectedAsteroids = new Set(),
  ephemerids = {},
  position = null,
  time = new Date(),
  horizonData = null,
}) {
  const aladinRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [showHorizon, setShowHorizon] = useState(false);

  // Compute center RA/Dec from Local Sidereal Time + observer latitude
  const computeCenter = () => {
    if (position?.latitude != null && position?.longitude != null) {
      const [ra, dec] = skyMapCenter(position.latitude, position.longitude, time ?? new Date());
      return { ra, dec };
    }
    return { ra: 0, dec: 0 };
  };

  // Initialize once on mount
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        await loadAladinScript();
        if (cancelled) return;
        const A = window.A;
        const { ra, dec } = computeCenter();
        const aladin = A.aladin('#aladin-main-map', {
          target: `${ra} ${dec}`,
          cooFrame: 'ICRSd',
          survey: 'P/DSS2/color',
          fov: 60,
          showReticle: false,
          showZoomControl: true,
          showFullscreenControl: true,
          showLayersControl: true,
          showGotoControl: true,
          showFrame: true,
          showProjectionControl: false,
          showSimbadPointerControl: false,
        });
        if (cancelled) return;
        aladinRef.current = aladin;
        setReady(true);
      } catch (err) {
        console.error('Failed to load Aladin Lite (main map):', err);
      }
    };
    init();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-center when position or time changes (after init)
  useEffect(() => {
    if (!ready || !aladinRef.current) return;
    const { ra, dec } = computeCenter();
    aladinRef.current.gotoRaDec(ra, dec);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, position, time]);

  // Rebuild catalog/overlay layers when data changes
  useEffect(() => {
    if (!ready || !aladinRef.current) return;
    const aladin = aladinRef.current;
    const A = window.A;

    aladin.removeLayers();

    // --- All asteroids (orange) ---
    const allFeatures = filteredAsteroids?.features ?? [];
    if (allFeatures.length > 0) {
      const cat = A.catalog({ name: 'Asteroids', color: '#ff6600', shape: 'circle', sourceSize: 8 });
      aladin.addCatalog(cat);
      const sources = allFeatures
        .filter(f => {
          const [ra, dec] = f.geometry?.coordinates ?? [];
          return Number.isFinite(ra) && Number.isFinite(dec);
        })
        .map(f => {
          const [ra, dec] = f.geometry.coordinates;
          return A.source(ra, dec, { name: f.properties?.name ?? '' });
        });
      cat.addSources(sources);
    }

    // --- Selected asteroids (blue cross, larger) ---
    const selectedFeatures = allFeatures.filter(f => selectedAsteroids.has(f.properties?.name));
    if (selectedFeatures.length > 0) {
      const selCat = A.catalog({ name: 'Selected', color: '#2196f3', shape: 'cross', sourceSize: 16 });
      aladin.addCatalog(selCat);
      selCat.addSources(
        selectedFeatures
          .filter(f => {
            const [ra, dec] = f.geometry?.coordinates ?? [];
            return Number.isFinite(ra) && Number.isFinite(dec);
          })
          .map(f => {
            const [ra, dec] = f.geometry.coordinates;
            return A.source(ra, dec, { name: f.properties?.name ?? '' });
          })
      );
    }

    // --- Ephemeris trails (only for selected asteroids) ---
    if (selectedAsteroids.size > 0) {
      selectedAsteroids.forEach(name => {
        const obj = ephemerids[name];
        const pts = (obj?.ephem ?? []).filter(e => Number.isFinite(e.radd) && Number.isFinite(e.decdd));
        if (pts.length < 2) return;

        const overlay = A.graphicOverlay({ color: '#2196f3', lineWidth: 3 });
        aladin.addOverlay(overlay);
        overlay.add(A.polyline(pts.map(e => [e.radd, e.decdd]), { color: '#2196f3' }));
      });
    }

    // --- Virtual horizon ---
    if (showHorizon && horizonData) {
      const multiLine = horizonData.features?.[0]?.geometry?.coordinates ?? [];
      if (multiLine.length > 0) {
        const pts = multiLine[0].filter(([ra, dec]) => Number.isFinite(ra) && Number.isFinite(dec));
        if (pts.length > 1) {
          const horizonOverlay = A.graphicOverlay({ color: '#00e676', lineWidth: 2 });
          aladin.addOverlay(horizonOverlay);
          horizonOverlay.add(A.polyline(pts, { color: '#00e676' }));
        }
      }
    }
  }, [ready, filteredAsteroids, selectedAsteroids, ephemerids, showHorizon, horizonData]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '3px 6px', flexShrink: 0, background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: '0.85em' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={showHorizon}
            onChange={e => setShowHorizon(e.target.checked)}
            disabled={!horizonData}
          />
          Mostra orizzonte
        </label>
      </div>
      <div id="aladin-main-map" style={{ flex: 1, minHeight: 0 }} />
    </div>
  );
}
