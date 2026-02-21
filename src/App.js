import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import SkyMap from './components/SkyMap';
import MyPosition from './components/MyPosition';
import { applyAsteroidsFilter, getVirtualHorizonByAltitude, skyMapCenter } from './utils/utils';
import NeocpAsteroidsTable from './components/AsteroidsTable';
import { fetchAsteroids } from './api/neocp';
import { getSetting, saveSetting } from './persistence';
import { CONFIG_KEYS, DEFAULT_EPHEM_PARAMS } from './constants';
import Details from './components/Details';
import Sidebar from './components/common/SideBar';
import EphemTable from './components/EphemTable';
const HORIZON_RESOLUTION = 360; // points
const DEFAULT_TIME_UPDATE_INTERVAL = 60000;
function App() {
  // position and time
  const [position, setPosition] = useState(() => {
    return getSetting(CONFIG_KEYS.SAVED_POSITION) || null;
  });
  const [autoUpdate, setAutoUpdate] = useState(() => {
    return getSetting(CONFIG_KEYS.AUTO_UPDATE) ?? true;
  });
  const [time, setTime] = useState(new Date());
  const [refreshTime, setRefreshTime] = useState(() => {
    return getSetting(CONFIG_KEYS.REFRESH_TIME) ?? DEFAULT_TIME_UPDATE_INTERVAL;
  });

  // horizon activation an height
  const [activeHorizon, setActiveHorizon] = useState(() => {
    return getSetting(CONFIG_KEYS.ACTIVE_HORIZON) || false;
  });
  const [horizonData, setHorizonData] = useState();
  const [horizonHeight, setHorizonHeight] = useState(() => {
    const savedHeight = getSetting(CONFIG_KEYS.HORIZON_HEIGHT);
    return savedHeight !== null ? savedHeight : 0; // default to 0 degrees
  }); // in degrees

  // asteroids
  const [asteroids, setAsteroids] = useState();
  const [showAsteroids, setShowAsteroids] = useState(() => {
    return getSetting(CONFIG_KEYS.SHOW_ASTEROIDS) ?? true
    });
  const [refreshAsteroids, setRefreshAsteroids] = useState(false);
  const [selectedAsteroids, setSelectedAsteroids] = useState(new Set());
  const [ephemerids, setEphemerids] = useState({});
  const [ephemParams, setEphemParam] = useState(() => {
    return getSetting(CONFIG_KEYS.EPHEM_PARAMS) ?? DEFAULT_EPHEM_PARAMS; // TODO: set form data
  });
  const [filter, setFilter] = useState(() => {
    return getSetting(CONFIG_KEYS.FILTER) || {};
  });
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoUpdate) {
        setTime(new Date());
        setRefreshAsteroids(!refreshAsteroids);
      }
    }, refreshTime);
    return () => clearInterval(interval);
  }, [autoUpdate, refreshTime, refreshAsteroids]);



  // load asteroids
  useEffect(() => {
    fetchAsteroids().then(data => {
      setAsteroids(data);
    });
  }, [refreshAsteroids]);

  // set horizon data for position and time
  useEffect(() => {
    if (position) {
      const data = getVirtualHorizonByAltitude(position.latitude, position.longitude, time, horizonHeight, HORIZON_RESOLUTION);
      setHorizonData(data);
    }
  }, [time, activeHorizon, position, horizonHeight]);

  const filterData = useMemo(() => {
    return {
      horizonData,
      position,
      time,
      activeHorizon,
      horizonHeight,
    };
  }, [horizonData, position, time, activeHorizon, horizonHeight]);
  const filteredAsteroids = useMemo(() => {
    if (!asteroids || !filter) return asteroids;
    return applyAsteroidsFilter(asteroids, filter, filterData);
  }, [asteroids, filter, filterData]);
  const [showEphemName, setShowEphemName] = useState();
  const data = useMemo(() => {

    return [
      ...(horizonData && activeHorizon ? [{
        geoJSON: horizonData,
        category: "horizon"
      }] : []),
      ...(asteroids && filteredAsteroids && showAsteroids ? [{
        geoJSON: filteredAsteroids,
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
  }, [filteredAsteroids, activeHorizon, horizonData, asteroids, selectedAsteroids, showAsteroids]);

  const configOverrides = useMemo(() => {

    if(position) {
      const center = skyMapCenter(position?.latitude, position?.longitude, time ?? new Date())
      return {
        center: center
      };
    }
    return {}
  }, [position, time]);

  const saveSettings = () => {
    if (position) {
      saveSetting(CONFIG_KEYS.SAVED_POSITION, position);
    }
    if (activeHorizon) {
      saveSetting(CONFIG_KEYS.ACTIVE_HORIZON, activeHorizon);
    }
    if (horizonHeight !== null) {
      saveSetting(CONFIG_KEYS.HORIZON_HEIGHT, horizonHeight);
    }
    saveSetting(CONFIG_KEYS.AUTO_UPDATE, autoUpdate);
    saveSetting(CONFIG_KEYS.REFRESH_TIME, refreshTime);
    saveSetting(CONFIG_KEYS.SHOW_ASTEROIDS, showAsteroids);
    saveSetting(CONFIG_KEYS.FILTER, filter);
    saveSetting(CONFIG_KEYS.EPHEM_PARAMS, ephemParams);
    console.log("Settings saved");

  };
  return (
    <div className="App">
      <header className="App-header">
        <h1>NEO Finder</h1>
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
          refreshTime={refreshTime}
          setRefreshTime={setRefreshTime}
          showAsteroids={showAsteroids}
          setShowAsteroids={setShowAsteroids}
          ephemParams={ephemParams}
          setEphemParam={setEphemParam}
        /></div>



      </header>
      <main>
        <SkyMap data={data}
        // geopos={position ? [position.latitude, position.longitude] : undefined}
        configOverrides={configOverrides} />


      <NeocpAsteroidsTable
        openEphemerides={name =>
          setShowEphemName(name)

        }
          ephemerids={ephemerids}
          setEphemerids={setEphemerids}
          ephemParams={ephemParams}
          setEphemParam={setEphemParam}
          filterData={filterData}
          asteroids={asteroids}
          filteredAsteroids={filteredAsteroids}
          refreshAsteroids={refreshAsteroids}
          setRefreshAsteroids={setRefreshAsteroids}
          selectedAsteroids={selectedAsteroids}
          setSelectedAsteroids={setSelectedAsteroids}
          filter={filter}
          setFilter={setFilter}
        />
      </main>
      <Sidebar
        title={`Ephemerids for ${showEphemName}`}
        isOpen={showEphemName}
        setIsOpen={setShowEphemName}
        position="right"
        width="500"
        >

          <EphemTable
            ephemerids={ephemerids?.[showEphemName]}
            />
        </Sidebar>
    </div>
  );
}

export default App;
