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
}) {
  const aladinRef = useRef(null);
  const [ready, setReady] = useState(false);

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

    // --- Ephemeris trails ---
    const ephemNames = Object.keys(ephemerids);
    if (ephemNames.length > 0) {
      ephemNames.forEach(name => {
        const obj = ephemerids[name];
        const pts = (obj?.ephem ?? []).filter(e => Number.isFinite(e.radd) && Number.isFinite(e.decdd));
        if (pts.length < 2) return;

        const isSelected = selectedAsteroids.has(name);
        const color = isSelected ? '#2196f3' : '#4caf50';
        const lineWidth = isSelected ? 3 : 1.5;

        const overlay = A.graphicOverlay({ color, lineWidth });
        aladin.addOverlay(overlay);
        overlay.add(A.polyline(pts.map(e => [e.radd, e.decdd]), { color }));
      });
    }
  }, [ready, filteredAsteroids, selectedAsteroids, ephemerids]);

  return (
    <div style={{ width: '100%', height: 500, position: 'relative' }}>
      <div id="aladin-main-map" style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
