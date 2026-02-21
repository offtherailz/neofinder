import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaUndo, FaSave, FaPlay, FaWpforms, FaPause } from 'react-icons/fa';
import { GiHorizonRoad } from "react-icons/gi";
import { GiAsteroid } from "react-icons/gi";
import UTCDateTimePicker from './UTCDateTimePicker';
import './style/position.css';
import Modal from './common/Modal';
import EphemMPCForm from './EphForm';
const MyPosition = ({

  position,
  setPosition,
  setActiveHorizon,
  activeHorizon,
  horizonData,
  saveSettings,
  horizonHeight,
  setHorizonHeight,
  ephemParams,
  setEphemParam,
  time,
  setTime,
  autoUpdate,
  setAutoUpdate,
  refreshTime,
  setRefreshTime,
  showAsteroids = false,
  setShowAsteroids = () => {},
}) => {
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showEphemParamsForm, setShowEphemParamsForm] = useState(false);

  const getMyPosition = () => {
    if (!navigator.geolocation) {
      setError('Geolocation.');
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

  // useEffect(() => {
  //   // Recupera la lista degli osservatori all'avvio
  //   fetchObservatories()
  //     .then(res => res.text())
  //     .then(html => setObservatories(parseObsCodes(html)))
  //     .catch(() => setObservatories([]));
  // }, []);
  // useEffect(() => {
  //   // Se selezionato un osservatorio, aggiorna coordinate e altitudine
  //   if (selectedObs) {
  //     const obs = observatories.find(o => o.code === selectedObs);
  //     if (obs) {
  //       setPosition({ latitude: obs.latitude, longitude: obs.longitude });
  //       setHorizonHeight(obs.altitude);
  //     }
  //   }
  // }, [selectedObs, observatories, setPosition, setHorizonHeight]);
  // div
  return (<>
    <div className="position-viewer">
      <div className="position-viewer-header">
        <button style={{
          // not like a button
          background: 'none',
          border: 'none',
          fontSize: '1rem',
          cursor: 'pointer',
        }}
        alt="Expand/Collapse position viewer"
        title={collapsed ? "expand" : "collapse"} onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '▼' : '▲'}
        </button>
        <h2>Position</h2>&nbsp;&nbsp;
        <div className="position-viewer-buttons">
          <button className={showEphemParamsForm ? "button-active" : ""} title="Show params form"
        onClick={() => setShowEphemParamsForm(!showEphemParamsForm)}
        disabled={isLoading}>
          <FaWpforms />
        </button>
        <button title={isLoading ? "loading" : "get current position"}
        onClick={getMyPosition}
        disabled={isLoading}>
          <FaMapMarkerAlt />
        </button>
        <button title="reset position"
        onClick={() => setPosition(null)}>
          <FaUndo />
        </button>
        <button title="save position"
        onClick={saveSettings}>
          <FaSave />
        </button>
        <button className={activeHorizon ? "button-active" : ""} title="set active horizon"
        onClick={() => setActiveHorizon(!activeHorizon)}>
          <GiHorizonRoad />
        </button>
        <button className={autoUpdate ? "button-active" : ""} title="toggle auto update"
        onClick={() => setAutoUpdate(!autoUpdate)}>
          {autoUpdate ? <FaPause /> : <FaPlay />}
        </button>
        <button className={showAsteroids ? "button-active" : ""} title="toggle asteroids"
        onClick={() => setShowAsteroids(!showAsteroids)}>
          <GiAsteroid />
        </button>
        </div>
      </div>
      {!collapsed && (<div className="position-viewer-content">
          <label>
            Lat :
            <input
              type="number"
              value={position?.latitude || ''}
              onChange={(e) => setPosition({ ...position, latitude: parseFloat(e.target.value) })}
              disabled={isLoading}
            />
          </label>
          <label>
            Lon :
            <input
              type="number"
              value={position?.longitude || ''}
              onChange={(e) => setPosition({ ...position, longitude: parseFloat(e.target.value) })}
              disabled={isLoading}
            />
          </label>
          <label>
            Hor (deg):
            <input
              type="number"
              value={horizonHeight || ''}
              onChange={(e) => setHorizonHeight(parseFloat(e.target.value))}
              disabled={isLoading}
            />
          </label>
          <label>
            Time (UTC):
            <UTCDateTimePicker
              className="time-picker"
              value={time}
              onChange={(newTime) => setTime(newTime)}
              disabled={isLoading}
            />
          </label>
          <label>
            Refresh:
            <select value={refreshTime} onChange={(e) => {
              setRefreshTime(e.target.value);
            }}>
              <option value={30000}>30s</option>
              <option value={60000}>1m</option>
              <option value={300000}>5m</option>
              <option value={600000}>10m</option>
            </select>


          </label>
        </div>)}
    </div>
    {
      <Modal open={showEphemParamsForm} onClose={() => {setShowEphemParamsForm(false)}}>
        <EphemMPCForm
          params={ephemParams}
          setParams={setEphemParam}
        />
      </Modal>
    }
    </>

  );
};

export default MyPosition;