import React, { useState, useEffect } from 'react';

// Funzione per il calcolo dell'orizzonte (rimane la stessa)
const getVirtualHorizon = (latitude, longitude, radiusKm, steps = 360) => {
  const EARTH_RADIUS_KM = 6371;
  const coordinates = [];

  for (let i = 0; i <= steps; i++) {
    const angle = (i * 360) / steps;
    const bearingRad = (angle * Math.PI) / 180;
    const latRad = (latitude * Math.PI) / 180;
    const newLatRad = Math.asin(
      Math.sin(latRad) * Math.cos(radiusKm / EARTH_RADIUS_KM) +
      Math.cos(latRad) * Math.sin(radiusKm / EARTH_RADIUS_KM) * Math.cos(bearingRad)
    );
    const lonRad = (longitude * Math.PI) / 180;
    let newLonRad = lonRad + Math.atan2(
      Math.sin(bearingRad) * Math.sin(radiusKm / EARTH_RADIUS_KM) * Math.cos(latRad),
      Math.cos(radiusKm / EARTH_RADIUS_KM) - Math.sin(latRad) * Math.sin(newLatRad)
    );
    const newLat = (newLatRad * 180) / Math.PI;
    const newLon = (newLonRad * 180) / Math.PI;
    coordinates.push([parseFloat(newLon.toFixed(4)), parseFloat(newLat.toFixed(4))]);
  }

  return {
    "type": "FeatureCollection",
    "features": [{
      "type": "Feature",
      "properties": {
        "n": "Orizzonte virtuale"
      },
      "geometry": {
        "type": "MultiLineString",
        "coordinates": [coordinates]
      }
    }]
  };
};

const HorizonViewer = ({position, setPosition, horizonData, setHorizonData}) => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getMyPosition = () => {
    if (!navigator.geolocation) {
      setError('La geolocalizzazione non è supportata dal tuo browser.');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ latitude, longitude });
        setIsLoading(false);
      },
      (err) => {
        setError(`Errore: ${err.message}`);
        setIsLoading(false);
      }
    );
  };

  return (
    <div>
      <h2>Visualizzatore Orizzonte</h2>
      <button onClick={getMyPosition} disabled={isLoading}>
        {isLoading ? 'Rilevamento...' : 'Ottieni la mia posizione'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {position && (
        <div>
          <h3>La tua posizione:</h3>
          <p>Latitudine: {position.latitude.toFixed(4)}</p>
          <p>Longitudine: {position.longitude.toFixed(4)}</p>
        </div>
      )}


    </div>
  );
};

export default HorizonViewer;