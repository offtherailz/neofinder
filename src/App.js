import React, { useState, useEffect, useMemo, useRef } from 'react';
import './App.css';
import AladinMainMap from './components/AladinMainMap';
import { FaBook } from 'react-icons/fa';
import MyPosition from './components/MyPosition';
import { applyAsteroidsFilter, getVirtualHorizonByAltitude } from './utils/utils';
import NeocpAsteroidsTable from './components/AsteroidsTable';
import { fetchAsteroids } from './api/neocp';
import { getSetting, saveSetting } from './persistence';
import { CONFIG_KEYS, DEFAULT_CAMERA_SAMPLING, DEFAULT_EPHEM_PARAMS, DEFAULT_MAX_OFFSET_ARCSEC, DEFAULT_FOV_SIZE } from './constants';
import Sidebar from './components/common/SideBar';
import EphemTable from './components/EphemTable';
import logo from './logo192.png';
import ReferencesModal from './components/ReferencesModal';
const HORIZON_RESOLUTION = 360; // points
const DEFAULT_TIME_UPDATE_INTERVAL = 60000;
const OBS_CODES_LEGACY_URL = "https://minorplanetcenter.net/iau/lists/ObsCodes.html";

const parseLegacyObsLine = (text, code) => {
  const line = text
    .split(/\r?\n/)
    .find((row) => row.slice(0, 3).toUpperCase() === code);
  if (!line) {
    return null;
  }

  const longitude = line.slice(4, 13).trim();
  const rhocosphi = line.slice(13, 21).trim();
  const rhosinphi = line.slice(21, 30).trim();
  const name = line.slice(30).trim();

  if (!Number.isFinite(Number(longitude)) || !Number.isFinite(Number(rhocosphi)) || !Number.isFinite(Number(rhosinphi))) {
    return null;
  }

  return {
    obscode: code,
    longitude,
    rhocosphi,
    rhosinphi,
    name,
  };
};

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
    return getSetting(CONFIG_KEYS.ACTIVE_HORIZON) ?? true;
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
  const positionSyncingEphemParams = useRef(false);
  const observatoriesByCodeRef = useRef(new Map());
  const legacyObsTextRef = useRef(null);
  const legacyObsRequestRef = useRef(null);
  // When position changes, update ephemParams to use observer's real coordinates (Parallax=2)
  useEffect(() => {
    if (position?.latitude != null && position?.longitude != null) {
      positionSyncingEphemParams.current = true;
      setEphemParam(prev => ({
        ...prev,
        lat: position.latitude,
        long: position.longitude,
        alt: position.altitude ?? 0,
      }));
    }
  }, [position]);
  const [cameraSampling, setCameraSampling] = useState(() => {
    return getSetting(CONFIG_KEYS.CAMERA_SAMPLING) ?? DEFAULT_CAMERA_SAMPLING;
  });
  const [maxOffsetArcsec, setMaxOffsetArcsec] = useState(() => {
    return getSetting(CONFIG_KEYS.MAX_OFFSET_ARCSEC) ?? DEFAULT_MAX_OFFSET_ARCSEC;
  });
  const [fovSize, setFovSize] = useState(() => {
    return getSetting(CONFIG_KEYS.FOV_SIZE) ?? DEFAULT_FOV_SIZE;
  });
  useEffect(() => {
    saveSetting(CONFIG_KEYS.FOV_SIZE, fovSize);
  }, [fovSize]);
  useEffect(() => {
    if (position) {
      saveSetting(CONFIG_KEYS.SAVED_POSITION, position);
    }
  }, [position]);
  useEffect(() => {
    if (horizonHeight !== null && horizonHeight !== undefined && !Number.isNaN(horizonHeight)) {
      saveSetting(CONFIG_KEYS.HORIZON_HEIGHT, horizonHeight);
    }
  }, [horizonHeight]);
  useEffect(() => {
    saveSetting(CONFIG_KEYS.ACTIVE_HORIZON, activeHorizon);
  }, [activeHorizon]);
  useEffect(() => {
    if (positionSyncingEphemParams.current) {
      positionSyncingEphemParams.current = false;
      return;
    }
    saveSetting(CONFIG_KEYS.EPHEM_PARAMS, ephemParams);
  }, [ephemParams]);
  useEffect(() => {
    if (Number(ephemParams?.Parallax) !== 1) {
      return;
    }

    const code = String(ephemParams?.obscode ?? '').trim().toUpperCase();
    if (!/^[A-Z0-9]{3}$/.test(code)) {
      return;
    }

    let isCancelled = false;
    const normalizeLongitude = (lonEast) => {
      return ((lonEast + 180) % 360 + 360) % 360 - 180;
    };
    const applyObservatory = (obs) => {
      if (isCancelled || !obs) {
        return;
      }
      const longitudeEast = Number(obs.longitude);
      const rhoCosPhi = Number(obs.rhocosphi);
      const rhoSinPhi = Number(obs.rhosinphi);
      if (!Number.isFinite(longitudeEast) || !Number.isFinite(rhoCosPhi) || !Number.isFinite(rhoSinPhi)) {
        return;
      }
      const latitude = (Math.atan2(rhoSinPhi, rhoCosPhi) * 180) / Math.PI;
      const longitude = normalizeLongitude(longitudeEast);
      setPosition((prev) => {
        const prevAltitude = prev?.altitude ?? 0;
        if (prev?.latitude === latitude && prev?.longitude === longitude) {
          return prev;
        }
        return {
          latitude,
          longitude,
          altitude: prevAltitude,
        };
      });
    };

    const getLegacyObsText = async () => {
      if (legacyObsTextRef.current) {
        return legacyObsTextRef.current;
      }
      if (!legacyObsRequestRef.current) {
        legacyObsRequestRef.current = fetch(OBS_CODES_LEGACY_URL)
          .then((res) => {
            if (!res.ok) {
              throw new Error(`Unable to fetch legacy obs list: ${res.status}`);
            }
            return res.text();
          })
          .then((text) => {
            legacyObsTextRef.current = text;
            return text;
          })
          .finally(() => {
            legacyObsRequestRef.current = null;
          });
      }
      return legacyObsRequestRef.current;
    };

    const loadObservatory = async () => {
      try {
        if (observatoriesByCodeRef.current.has(code)) {
          applyObservatory(observatoriesByCodeRef.current.get(code));
          return;
        }

        const legacyText = await getLegacyObsText();
        const obs = parseLegacyObsLine(legacyText, code);

        if (obs?.obscode) {
          observatoriesByCodeRef.current.set(String(obs.obscode).toUpperCase(), obs);
        }
        applyObservatory(obs);
      } catch (err) {
        console.warn('Unable to resolve observatory code', err);
      }
    };

    loadObservatory();
    return () => {
      isCancelled = true;
    };
  }, [ephemParams?.Parallax, ephemParams?.obscode]);
  const [filter, setFilter] = useState(() => {
    return getSetting(CONFIG_KEYS.FILTER) || {};
  });
  useEffect(() => {
    saveSetting(CONFIG_KEYS.FILTER, filter);
  }, [filter]);
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
  const mapRef = useRef(null);
  const centerMap = (ra, dec) => mapRef.current?.gotoRaDec(ra, dec);
  const [tableHeight, setTableHeight] = useState(300);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  const onDragHandleMouseDown = (e) => {
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartHeight.current = tableHeight;
    e.preventDefault();
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      const delta = dragStartY.current - e.clientY;
      setTableHeight(Math.max(80, dragStartHeight.current + delta));
    };
    const onMouseUp = () => { isDragging.current = false; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [tableHeight]);
  const [showReferencesModal, setShowReferencesModal] = useState(false);

  const saveSettings = () => {
    if (position) {
      saveSetting(CONFIG_KEYS.SAVED_POSITION, position);
    }
    saveSetting(CONFIG_KEYS.ACTIVE_HORIZON, activeHorizon);
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
    saveSetting(CONFIG_KEYS.FOV_SIZE, fovSize);
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
        <h1><span className="neo">NEO</span> Finder</h1>




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
          fovSize={fovSize}
          setFovSize={setFovSize}
        /></div>
      <main>
        <div className="app-map-wrapper" style={{ flex: 1, minHeight: 0 }}>
          <AladinMainMap
            ref={mapRef}
            filteredAsteroids={filteredAsteroids}
            selectedAsteroids={selectedAsteroids}
            ephemerids={ephemerids}
            position={position}
            time={time}
            horizonData={horizonData}
            activeHorizon={activeHorizon}
            setActiveHorizon={setActiveHorizon}
          />
        </div>
        <div className="resize-handle" onMouseDown={onDragHandleMouseDown}>
          <div className="resize-handle-bar" />
        </div>
        <div className="app-table-wrapper" style={{ height: tableHeight, flex: 'none' }}>
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
          onCenterMap={centerMap}
        />
        </div>
      </main>
      <footer>
        <i>This research has made use of data and/or services provided by the International Astronomical Union's <a href="https://www.minorplanetcenter.net/">Minor Planet Center.</a></i><br />
        <i>developed by <a href="https://github.com/offtherailz">@offtherailz</a> as a member and with collaboration of <a href="https://www.astrofilispezzini.org/">AAS</a></i>
        &nbsp;<button title="Apri risorse e riferimenti" onClick={() => setShowReferencesModal(true)}>
                  <FaBook />
                </button>
            <ReferencesModal open={showReferencesModal} onClose={() => setShowReferencesModal(false)} />
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
            fovSize={fovSize}
            />
        </Sidebar>
    </div>
  );
}

export default App;
