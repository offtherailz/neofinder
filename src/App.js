import React, { useState, useEffect, useMemo, useRef } from 'react';
import './App.css';
import SkyMap from './components/SkyMap';
import MyPosition from './components/MyPosition';
import { getVirtualHorizonByAltitude } from './utils';
import NeocpAsteroidsTable from './components/AsteroidsTable';
const neocpToGeoJSON = (json) => {
  // transforms the NEOCP data into a GeoJSON format
  /*
  "Temp_Desig": "P22dfLf",
    "Score": 92,
    "Discovery_year": 2025,
    "Discovery_month": 8,
    "Discovery_day": 19.6,
    "R.A.": 3.7359,
    "Decl.": 14.0856,
    "V": 22.1,
    "Updated": "Added Aug. 19.65 UT",
    "NObs": 3,
    "Arc": 0.04,
    "H": 21.7,
    "Not_Seen_dys": 0.04
  },*/
  return json.map((item) => {
    return {
      type: "Feature",
      properties: {
        name: item.Temp_Desig,
        score: item.Score,
        discoveryDate: `${item.Discovery_year}-${String(item.Discovery_month).padStart(2, '0')}-${String(Math.floor(item.Discovery_day)).padStart(2, '0')}`,
        magnitude: item.V,
        updated: item.Updated,
        observations: item.NObs,
        arc: item.Arc,
        hMagnitude: item.H,
        notSeenDays: item.Not_Seen_dys
      },
      geometry: {
        type: "Point",
        coordinates: [item["R.A."], item["Decl."]]
      }
    };
  });
};
const fetchAsteroids = () => {
  return fetch('https://www.minorplanetcenter.net/Extended_Files/neocp.json')
    .then(response => response.json())
    .then(data => {
      return {"type": "FeatureCollection", features: neocpToGeoJSON(data)};
    })
    .catch(error => console.error('Error fetching asteroids:', error));
}

function App() {
  const [position, setPosition] = useState(null);
  const [horizonData, setHorizonData] = useState();
  const [asteroids, setAsteroids] = useState();
  const [refreshAsteroids, setRefreshAsteroids] = useState(false);
  const [selectedAsteroids, setSelectedAsteroids] = useState(new Set());
  useEffect(() => {
    fetchAsteroids().then(data => {
      setAsteroids(data);
    });
  }, [refreshAsteroids]);

  useEffect(() => {
    if (position) {
      const data = getVirtualHorizonByAltitude(position.latitude, position.longitude, new Date(), 10, 360);
      setHorizonData(data);
    }
  }, [position]);
  const data = useMemo(() => {
    return [
      ...(horizonData ? [{
        geoJSON: horizonData,
        category: "horizon"
      }] : []),
      ...(asteroids ? [{
        geoJSON: asteroids,
        category: "asteroids"
      }] : []),
      ...(selectedAsteroids.size > 0 && asteroids?.features ? [{
        geoJSON: {
          type: "FeatureCollection",
          features: asteroids.features.filter(f => selectedAsteroids.has(f.properties.name))
        },
        category: "selected"
      }] : []),
    ];
  }, [horizonData, asteroids, selectedAsteroids]);
  const configOverrides = useMemo(() => {
    return {
      center: position ? [position.latitude, position.longitude] : undefined,
    };
  }, [position]);
  return (
    <div className="App">
      <header className="App-header">
        <h1>NEO Finder</h1>
        <div class="controls">
          <button onClick={() => setRefreshAsteroids(!refreshAsteroids)}>Refresh Asteroids</button>
        </div>

      </header>
      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
        <SkyMap data={data}
        geopos={position ? [position.latitude, position.longitude] : undefined}
        configOverrides={configOverrides} />
        <MyPosition
        position={position}
        setPosition={setPosition}
        />

      </div>
  <NeocpAsteroidsTable
          asteroids={asteroids}
          refreshAsteroids={refreshAsteroids}
          setRefreshAsteroids={setRefreshAsteroids}
          selectedAsteroids={selectedAsteroids}
          setSelectedAsteroids={setSelectedAsteroids}

        />
    </div>
  );
}

export default App;
