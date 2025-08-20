import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import SkyMap from './components/SkyMap';
import MyPosition from './components/MyPosition';
import { getVirtualHorizonByAltitude } from './utils';
import NeocpAsteroidsTable from './components/AsteroidsTable';
import { fetchAsteroids } from './api/neocp';
import { getSetting, saveSetting } from './persistence';
import { CONFIG_KEYS } from './constants';
const HORIZON_RESOLUTION = 360; // points
const TIME_UPDATE_INTERVAL = 1000;
function App() {
  // position and time
  const [position, setPosition] = useState(() => {
    return getSetting(CONFIG_KEYS.SAVED_POSITION) || null;
  });
  const [autoUpdate, setAutoUpdate] = useState(() => {
    return getSetting(CONFIG_KEYS.AUTO_UPDATE) ?? true;
  });
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoUpdate) {
        setTime(new Date());
      }
    }, TIME_UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [autoUpdate]);
  const [activeHorizon, setActiveHorizon] = useState(() => {
    return getSetting(CONFIG_KEYS.ACTIVE_HORIZON) || false;
  });
  const [horizonData, setHorizonData] = useState();
  const [horizonHeight, setHorizonHeight] = useState(() => {
    const savedHeight = getSetting(CONFIG_KEYS.HORIZON_HEIGHT);
    return savedHeight !== null ? savedHeight : 0; // default to 0 degrees
  }); // in degrees
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
      const data = getVirtualHorizonByAltitude(position.latitude, position.longitude, time, horizonHeight, HORIZON_RESOLUTION);
      setHorizonData(data);
    }
  }, [time, activeHorizon, position, horizonHeight]);
  const data = useMemo(() => {
    return [
      ...(horizonData && activeHorizon ? [{
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
  }, [activeHorizon, horizonData, asteroids, selectedAsteroids]);

  const configOverrides = useMemo(() => {
    return {
      center: position ? [position.latitude, position.longitude] : undefined,
    };
  }, [position]);

  const saveSettings = () => {
    if (position) {
      saveSetting(CONFIG_KEYS.SAVED_POSITION, position);
    }
    if (activeHorizon) {
      localStorage.setItem(CONFIG_KEYS.ACTIVE_HORIZON, JSON.stringify(activeHorizon));
    }
    if (horizonHeight !== null) {
      saveSetting(CONFIG_KEYS.HORIZON_HEIGHT, horizonHeight);
    }

  };
  return (
    <div className="App">
      <header className="App-header">
        <h1>NEO Finder</h1>
        <div class="controls">
          <button onClick={() => setRefreshAsteroids(!refreshAsteroids)}>Refresh Asteroids</button>
        </div>
        <div className="position-controls">
          <MyPosition
          position={position}
          setPosition={setPosition}
          setActiveHorizon={setActiveHorizon}
          activeHorizon={activeHorizon}
          horizonData={horizonData}
          saveSettings={saveSettings()}
          horizonHeight={horizonHeight}
          setHorizonHeight={setHorizonHeight}
          time={time}
          setTime={setTime}
          autoUpdate={autoUpdate}
          setAutoUpdate={setAutoUpdate}
        /></div>


      </header>
      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
        <SkyMap data={data}
        // geopos={position ? [position.latitude, position.longitude] : undefined}
        configOverrides={configOverrides} />
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
