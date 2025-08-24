
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

  // Sideral local time calculation (LST) - copied
  const J2000 = new Date('2000-01-01T12:00:00Z');
  const jd = (date.getTime() - J2000.getTime()) / 86400000 + 2451545.0;
  const T = (jd - 2451545.0) / 36525;
  const theta0 = (280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000) % 360;
  const lst = deg2rad(theta0) + lon;

  const coordinates = [];
  for (let i = 0; i <= steps; i++) {
    const az = deg2rad(i); // Azimut in rad [0, 2π)

    // Dec calculation from height and azimut
    const sinDec = Math.sin(lat) * Math.sin(alt) + Math.cos(lat) * Math.cos(alt) * Math.cos(az);
    const dec = Math.asin(sinDec);

    // hour angle
    const cosH = (Math.sin(alt) - Math.sin(lat) * sinDec) / (Math.cos(lat) * Math.cos(dec));
    const H = Math.atan2(-Math.sin(az) * Math.cos(alt), cosH);

    // RA calculation
    const ra = (lst - H) % (2 * Math.PI);

    // Conversion in degrees
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


function filterMPCFeatureCollection(features, lat, lon, date = new Date(), horizon = 20) {
  const deg2rad = d => d * Math.PI / 180;
  const rad2deg = r => r * 180 / Math.PI;

  const latRad = deg2rad(lat);
  const lonRad = deg2rad(lon);

  function localSiderealTime(date, lon) {
    const JD = (date.getTime() / 86400000.0) + 2440587.5;
    const D = JD - 2451545.0;
    let GMST = 280.46061837 + 360.98564736629 * D;
    GMST = (GMST % 360 + 360) % 360;
    return deg2rad(GMST) + lon;
  }

  const lst = localSiderealTime(date, lonRad);

  const visibleFeatures = features
    .map(f => {
      const d = f?.properties?.itemData ?? {};
      if (!d["R.A."] || !d["Decl."]) return null;

      const ra = deg2rad(d["R.A."]);   // RA in gradi
      const dec = deg2rad(d["Decl."]); // Dec in gradi

      // Angolo orario
      let H = lst - ra;
      H = ((H + Math.PI) % (2 * Math.PI)) - Math.PI;

      // Altezza
      const sinAlt = Math.sin(dec) * Math.sin(latRad) +
                     Math.cos(dec) * Math.cos(latRad) * Math.cos(H);
      const alt = Math.asin(sinAlt);

      // Azimut
      const y = -Math.sin(H);
      const x = Math.cos(dec) * Math.sin(latRad) -
                Math.sin(dec) * Math.cos(latRad) * Math.cos(H);
      let az = Math.atan2(y, x);
      az = (az % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);

      // Clona la feature aggiungendo alt e az nelle properties
      return {
        ...f,
        properties: {
          ...f.properties,
          alt: rad2deg(alt),
          az: rad2deg(az)
        }
      };
    })
    .filter(f => f && f.properties.alt >= horizon);

  return visibleFeatures;
}


/**
 *
 * @param {FeatureCollection} asteroids feature collection of asteroids in GeoJSON format
 * @param {Object} filter contains:
 * - horizon: boolean, if true, filter by horizon
 * @param {*} filterData contains:
 * - horizonData: GeoJSON FeatureCollection of the horizon
 * - position: {latitude, longitude} of the observer
 * - time: Date object of the observation time
 * - activeHorizon: boolean, if true, the horizon is active
 * - horizonHeight: number, height of the horizon in degrees
 * @returns
 */
export function applyAsteroidsFilter(asteroids, filter, filterData) {

  if (!asteroids || !filter || !asteroids?.features) return asteroids;
  let { features } = asteroids;
  if( filter?.horizon && filterData?.horizonData) {
    const { position, time, activeHorizon, horizonHeight } = filterData;
    if (activeHorizon) {
      features = filterMPCFeatureCollection(
        features,
        position.latitude,
        position.longitude,
        time,
        horizonHeight
      )
    }

  }
  let notSeenMax;
    try{
      notSeenMax = parseFloat(filter?.notSeenMax)
    } catch(e) {
      console.log(e);
    }

    if(notSeenMax) {
      features = features.filter(({properties}) => {
        return properties.Not_Seen_dys <= notSeenMax;
      })
    }
  return {
    ...asteroids,
    features
  }

}

export function zenithRADec(latDeg, lonDeg, date = new Date()) {

  const norm360 = d => ((d % 360) + 360) % 360;

  // Julian Day (UTC)
  const JD = date.getTime() / 86400000 + 2440587.5;
  const D  = JD - 2451545.0;

  // GMST in deg (Compact formula)
  let GMST = 280.46061837 + 360.98564736629 * D;
  GMST = norm360(GMST);

  //  EAST positive lng
  const LSTdeg = norm360(GMST + lonDeg);

  const RA_zen_deg  = LSTdeg;
  const Dec_zen_deg = latDeg;

  return {
    ra_deg: RA_zen_deg,           // 0..360
    ra_hours: RA_zen_deg / 15,    // 0..24
    dec_deg: Dec_zen_deg
  };
}

/**
 * Returns the center of the map given your latitude, longitude and date.
 * This will put the azimuth at the center of the map.
 * @param {number} latDeg latitude
 * @param {number} lonDeg longitude
 * @param {Date} date the date
 * @returns {number[]}
 */
export function skyMapCenter(latDeg, lonDeg, date = new Date()) {

  const norm360 = d => ((d % 360) + 360) % 360;

  // Julian Day (UTC)
  const JD = date.getTime() / 86400000 + 2440587.5;
  const D  = JD - 2451545.0;

  // GMST in gradi
  let GMST = 280.46061837 + 360.98564736629 * D;
  GMST = norm360(GMST);

  // LST (longitudine Est positiva!)
  const LSTdeg = norm360(GMST + lonDeg);

  return [
    LSTdeg,   // longitude = RA (deg)
    latDeg,   // latitude  = Dec
    0
  ];
}

/**
 *
 * @param {string} line the line of text to parse
 * @returns {obj} and object structured like this:
 * date: dateUtc,
 * ra: "22 41 32.2"
 * dec: "+01 51 58"
 * elong: 164.6
 * v:  22.6
 * motion:   speed arcsecs/min // TODO: see also 2 directions.
 * pa:        // Position Angle, deg
 */
export function parseEphemLine(line) {
  line = line.trim();
  if (!line || line.startsWith("Date") || line.startsWith("h")) {
    return null; // ignora header o righe vuote
  }

  // split su 2 o più spazi
  const parts = line.split(/\s{1,}/);

  // Date + ora UT
  const year = parts[0];
  const month = parts[1]; // JS usa 0-based
  const day = parts[2]; //
  const [hour, min] = parts[3].length === 2 // can be 01 or 0130
    ? [parts[3], "00"]
    : [parts[3].substring(0,2), parts[3].substring(2,4)]
  // 2025-09-06T09:10:00Z
  const dateString = `${year}-${month}-${day}T${hour}:${min}:00Z`;
  const dateUtc = new Date(dateString);

  return {
    date: dateUtc,          // YYYY MM
    ra: `${parts[4]} ${parts[5]} ${parts[6]}`,    // "22 41 32.2"
    dec: `${parts[7]} ${parts[8]} ${parts[9]}`,   // "+01 51 58"
    elong: parseFloat(parts[10]),     // es. 164.6
    v: parseFloat(parts[11]),         // es. 22.6
    motion: parseFloat(parts[12]),    // speed arcsecs/min
    pa: parseFloat(parts[13])         // Position Angle, deg
  };
}

/**
 * Extract data from ephemerides HTML response.
 * @param {string} html - Html to parse
 * @returns {Object} an object that contains a key for each data collected.
 */
export function parseEphemeridesHtml(html) {
  const results = {};
  // Trova tutti i blocchi <b>ObjName</b> ... <pre>...</pre>
  const objRegex = /<b>([A-Za-z0-9]+)<\/b>[\s\S]*?<pre>([\s\S]*?)<\/pre>/g;
  let match;
  while ((match = objRegex.exec(html)) !== null) {
    const obj = match[1];
    const pre = match[2];
    // Estrai le righe della tabella (ignora header e link)
    const lines = pre
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('Date') && !l.startsWith('h') && !l.startsWith('<a') && !l.startsWith('Motion') && !l.startsWith('Uncertainty'));

    const ephem = lines
      .filter(line => !(line?.indexOf("suppressed") > 0))
      .map(line => {
      return parseEphemLine(line)
    });

    results[obj] = { ephem, suppressed: html.indexOf("suppressed") > 0 };
  }
  return results;
}