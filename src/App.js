import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import SkyMap from './components/SkyMap';
import MyPosition from './components/MyPosition';
import { applyAsteroidsFilter, getVirtualHorizonByAltitude, skyMapCenter } from './utils/utils';
import NeocpAsteroidsTable from './components/AsteroidsTable';
import { fetchAsteroids } from './api/neocp';
import { getSetting, saveSetting } from './persistence';
import { CONFIG_KEYS, DEFAULT_CAMERA_SAMPLING, DEFAULT_EPHEM_PARAMS, DEFAULT_MAX_OFFSET_ARCSEC } from './constants';
import Sidebar from './components/common/SideBar';
import EphemTable from './components/EphemTable';
import logo from './logo192.png';
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
  const [loadingAsteroids, setLoadingAsteroids] = useState(false);
  const [showAsteroids, setShowAsteroids] = useState(() => {
    return getSetting(CONFIG_KEYS.SHOW_ASTEROIDS) ?? true
    });
  const [refreshAsteroids, setRefreshAsteroids] = useState(false);
  const [selectedAsteroids, setSelectedAsteroids] = useState(new Set());
  const [ephemerids, setEphemerids] = useState({});
  const [ephemParams, setEphemParam] = useState(() => {
    return getSetting(CONFIG_KEYS.EPHEM_PARAMS) ?? DEFAULT_EPHEM_PARAMS; // TODO: set form data
  });
  const [cameraSampling, setCameraSampling] = useState(() => {
    return getSetting(CONFIG_KEYS.CAMERA_SAMPLING) ?? DEFAULT_CAMERA_SAMPLING;
  });
  const [maxOffsetArcsec, setMaxOffsetArcsec] = useState(() => {
    return getSetting(CONFIG_KEYS.MAX_OFFSET_ARCSEC) ?? DEFAULT_MAX_OFFSET_ARCSEC;
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
    setLoadingAsteroids(true);
    fetchAsteroids().then(data => {
      setAsteroids(data);
    }).finally(() => {
      setLoadingAsteroids(false);
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
      ephemerids,
    };
  }, [horizonData, position, time, activeHorizon, horizonHeight, ephemerids]);
  const filteredAsteroids = useMemo(() => {
    if (!asteroids || !filter) return asteroids;
    return applyAsteroidsFilter(asteroids, filter, filterData);
  }, [asteroids, filter, filterData]);
  const [showEphemName, setShowEphemName] = useState();
  const ephemOnMap = useMemo(() => {
    if (!ephemerids || !filteredAsteroids) return null;
    const features = [];
    for (const [name, obj] of Object.entries(ephemerids)) {
      const asteroid = filteredAsteroids.features.find(f => f.properties.name === name);
      if (asteroid) {
        // add all ephem points as a line feature, with name as property
        features.push({
          type: "Feature",
          geometry: {
            type: "MultiLineString",
            coordinates:
            // "10 08 53.4" "-02 13 39"
              [obj.ephem.map(e => {
                const raParts = e.ra.split(" ").map(parseFloat);
                const decParts = e.dec.split(" ").map(parseFloat);
                return [
                  (raParts[0] + raParts[1]/60 + raParts[2]/3600) * 15, // in degrees
                  decParts[0] + decParts[1]/60 + decParts[2]/3600 // in degrees
                ];
              })]
          },
          properties: {
            name
          }
        });
      }
    }
    return {
      type: "FeatureCollection",
      features
    };
  }, [ephemerids, filteredAsteroids]);
  const data = useMemo(() => {
    const selectedEphems = Object.keys(ephemerids).filter(name => selectedAsteroids.has(name));
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
      ...(ephemOnMap ? [{
        geoJSON: ephemOnMap,
        category: "ephemerids"
      }] : []),
      ...((selectedEphems.length > 0 && ephemOnMap?.features) ? [{
        geoJSON: {
          type: "FeatureCollection",
          features: ephemOnMap.features.filter(f => selectedEphems.includes(f.properties.name))
        },
        category: "selectedEphem"
      }] : [])

    ];
  }, [filteredAsteroids, activeHorizon, horizonData, asteroids, selectedAsteroids, showAsteroids, ephemOnMap, ephemerids]);

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
    saveSetting(CONFIG_KEYS.CAMERA_SAMPLING, cameraSampling);
    saveSetting(CONFIG_KEYS.MAX_OFFSET_ARCSEC, maxOffsetArcsec);
    console.log("Settings saved");

  };
  return (
    <div className="App">
      <header className="App-header">
         <img
            src={logo}
            className="App-logo"
            alt="logo"
          />
        <h1>

          NEO Finder
          </h1>




      </header>
      <div className="position-controls">
          <MyPosition
          position={position}
          setPosition={setPosition}
          setActiveHorizon={setActiveHorizon}
          activeHorizon={activeHorizon}
          horizonData={horizonData}
          saveSettings={saveSettings}
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
          cameraSampling={cameraSampling}
          setCameraSampling={setCameraSampling}
          maxOffsetArcsec={maxOffsetArcsec}
          setMaxOffsetArcsec={setMaxOffsetArcsec}
        /></div>
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
          loadingAsteroids={loadingAsteroids}
          setRefreshAsteroids={setRefreshAsteroids}
          selectedAsteroids={selectedAsteroids}
          setSelectedAsteroids={setSelectedAsteroids}
          filter={filter}
          setFilter={setFilter}
        />
      </main>
      <footer>
        <i>This research has made use of data and/or services provided by the International Astronomical Union's <a href="https://www.minorplanetcenter.net/">Minor Planet Center.</a></i><br />
        <i>developed by <a href="https://github.com/offtherailz">@offtherailz</a> as a member and with collaboration of <a href="https://www.astrofilispezzini.org/">AAS</a></i>

      </footer>
      <Sidebar
        title={`Ephemerids for ${showEphemName}`}
        isOpen={showEphemName}
        setIsOpen={setShowEphemName}
        position="right"
        width={900}
        >

          <EphemTable
            height="100%"
            ephemerids={ephemerids?.[showEphemName]}
            cameraSampling={cameraSampling}
            maxOffsetArcsec={maxOffsetArcsec}
            />
        </Sidebar>
    </div>
  );
}

export default App;
