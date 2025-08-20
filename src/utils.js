import booleanPointInPolygon from '@turf/booleanPointInPolygon';
import lineString from '@turf/lineString';

export const deg2rad = d => d * Math.PI / 180;
export const rad2deg = r => r * 180 / Math.PI;



  // Calcolo tempo siderale locale (in radianti)
  function localSiderealTime(date, lon) {
    const JD = (date.getTime() / 86400000.0) + 2440587.5;
    const D = JD - 2451545.0;
    let GMST = 280.46061837 + 360.98564736629 * D;
    GMST = (GMST % 360 + 360) % 360; // normalizza [0,360)
    return deg2rad(GMST) + lon;
  }

const DEFAULT_SETTINGS = {
    raProp: 'ra',
    decProp: 'dec'
}

/**
 * Filters the visible objects for an indicated location
 * @param {Object[]} objects need to have ra and dec
 * @param {*} lat
 * @param {*} lon
 * @param {Date} date the current time, time where to find things
 * @param {Number} horizon Virtual horizon height in decimal degrees
 * @param {object} settings
 * @returns
 */
export function filterVisibleObjects(objects, lat, lon, date = new Date(), horizon = 0, settings = DEFAULT_SETTINGS) {
  lat = deg2rad(lat);
  lon = deg2rad(lon);
  const lst = localSiderealTime(date, lon);

  return objects
    .map(obj => {
      const ra = deg2rad(obj[settings.raProp]);   // in gradi input
      const dec = deg2rad(obj[settings.decProp]); // in gradi input

      // Angolo orario
      let H = lst - ra;
      H = ((H + Math.PI) % (2 * Math.PI)) - Math.PI; // normalizza [-π,π]

      // Altezza
      const sinAlt = Math.sin(dec) * Math.sin(lat) +
                     Math.cos(dec) * Math.cos(lat) * Math.cos(H);
      const alt = Math.asin(sinAlt);

      // Azimut
      const y = -Math.sin(H);
      const x = Math.cos(dec) * Math.sin(lat) -
                Math.sin(dec) * Math.cos(lat) * Math.cos(H);
      let az = Math.atan2(y, x);
      az = (az % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI); // [0,2π)

      return {
        ...obj,
        alt: rad2deg(alt),
        az: rad2deg(az)
      };
    })
    .filter(obj => obj.alt >= horizon);
}
export function hour2degree(ra) {
  return ra > 12 ? (ra - 24) * 15 : ra * 15;
}


/**
 * Calcola i punti per disegnare la linea dell'orizzonte virtuale.
 * @param {number} latitude - Latitudine del punto centrale (la tua posizione).
 * @param {number} longitude - Longitudine del punto centrale (la tua posizione).
 * @param {number} radiusKm - Raggio dell'orizzonte in chilometri.
 * @param {number} [steps=360] - Numero di segmenti per la linea dell'orizzonte.
 * @returns {object} Un oggetto GeoJSON MultiLineString che rappresenta l'orizzonte.
 */
export function getVirtualHorizon(latitude, longitude, radiusKm = 500, steps = 360) {
  // Raggio della Terra in chilometri
  const EARTH_RADIUS_KM = 6371;
  const coordinates = [];

  for (let i = 0; i <= steps; i++) {
    const angle = (i * 360) / steps;
    const bearingRad = (angle * Math.PI) / 180;

    // Calcolo la nuova latitudine
    const latRad = (latitude * Math.PI) / 180;
    const newLatRad = Math.asin(
      Math.sin(latRad) * Math.cos(radiusKm / EARTH_RADIUS_KM) +
      Math.cos(latRad) * Math.sin(radiusKm / EARTH_RADIUS_KM) * Math.cos(bearingRad)
    );

    // Calcolo la nuova longitudine
    const lonRad = (longitude * Math.PI) / 180;
    let newLonRad = lonRad + Math.atan2(
      Math.sin(bearingRad) * Math.sin(radiusKm / EARTH_RADIUS_KM) * Math.cos(latRad),
      Math.cos(radiusKm / EARTH_RADIUS_KM) - Math.sin(latRad) * Math.sin(newLatRad)
    );

    // Converto da radianti a gradi e aggiungo al risultato
    const newLat = (newLatRad * 180) / Math.PI;
    const newLon = (newLonRad * 180) / Math.PI;

    coordinates.push([newLon, newLat]);
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
}


/**
 * Calcola i punti per disegnare la linea dell'orizzonte virtuale
 * ad una data altezza.
 * @param {number} latitude - Latitudine dell'osservatore in gradi.
 * @param {number} longitude - Longitudine dell'osservatore in gradi.
 * @param {Date} date - Data e ora attuale.
 * @param {number} horizonAlt - Altezza dell'orizzonte virtuale in gradi.
 * @param {number} [steps=360] - Numero di segmenti per la linea dell'orizzonte.
 * @returns {object} Un oggetto GeoJSON MultiLineString che rappresenta l'orizzonte.
 */
export function getVirtualHorizonByAltitude(latitude, longitude, date, horizonAlt = 0, steps = 360) {
  const deg2rad = (deg) => deg * Math.PI / 180;
  const rad2deg = (rad) => rad * 180 / Math.PI;

  const lat = deg2rad(latitude);
  const lon = deg2rad(longitude);
  const alt = deg2rad(horizonAlt);

  // Calcolo del Tempo Siderale Locale (LST)
  const J2000 = new Date('2000-01-01T12:00:00Z');
  const jd = (date.getTime() - J2000.getTime()) / 86400000 + 2451545.0;
  const T = (jd - 2451545.0) / 36525;
  const theta0 = (280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000) % 360;
  const lst = deg2rad(theta0) + lon;

  const coordinates = [];
  for (let i = 0; i <= steps; i++) {
    const az = deg2rad(i); // Azimut in radianti [0, 2π)

    // Calcolo della Declinazione (dec) a partire da altezza e azimut
    const sinDec = Math.sin(lat) * Math.sin(alt) + Math.cos(lat) * Math.cos(alt) * Math.cos(az);
    const dec = Math.asin(sinDec);

    // Calcolo dell'Angolo Orario (H)
    const cosH = (Math.sin(alt) - Math.sin(lat) * sinDec) / (Math.cos(lat) * Math.cos(dec));
    const H = Math.atan2(-Math.sin(az) * Math.cos(alt), cosH);

    // Calcolo dell'Ascensione Retta (RA)
    const ra = (lst - H) % (2 * Math.PI);

    // Conversione e aggiunta delle coordinate
    const newLon = rad2deg(ra); // RA è la Longitudine nel sistema equatoriale
    const newLat = rad2deg(dec); // Dec è la Latitudine nel sistema equatoriale
    coordinates.push([newLon.toFixed(4), newLat.toFixed(4)]);
  }

  return {
    "type": "FeatureCollection",
    "features": [{
      "type": "Feature",
      "properties": {
        "n": "Orizzonte virtuale",
        "altitudine": horizonAlt
      },
      "geometry": {
        "type": "MultiLineString",
        "coordinates": [coordinates]
      }
    }]
  };
}

export function applyAsteroidsFilter(features, filter, horizonData) {
  return features.filter(f => {
    return true;
  });
}