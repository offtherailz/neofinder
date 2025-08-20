import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaUndo, FaSave, FaCity, FaPlay, FaPause } from 'react-icons/fa';
import UTCDateTimePicker from './UTCDateTimePicker';
import './style/position.css';
const MyPosition = ({
  position,
  setPosition,
  setActiveHorizon,
  activeHorizon,
  horizonData,
  saveSettings,
  horizonHeight,
  setHorizonHeight,
  time,
  setTime,
  autoUpdate,
  setAutoUpdate
}) => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
  // div
  return (
    <div className="position-viewer">
      <div className="position-viewer-header">
        <h2>Position</h2>
        <div className="position-viewer-buttons">
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
          <FaCity />
        </button>
        <button className={autoUpdate ? "button-active" : ""} title="toggle auto update"
        onClick={() => setAutoUpdate(!autoUpdate)}>
          {autoUpdate ? <FaPause /> : <FaPlay />}
        </button>
        </div>
      </div>
      <div className="position-viewer-content">
        <label>
          Lat:
          <input
            type="number"
            value={position?.latitude || ''}
            onChange={(e) => setPosition({ ...position, latitude: parseFloat(e.target.value) })}
            disabled={isLoading}
          />
        </label>
        <label>
          Lon:
          <input
            type="number"
            value={position?.longitude || ''}
            onChange={(e) => setPosition({ ...position, longitude: parseFloat(e.target.value) })}
            disabled={isLoading}
          />
        </label>
        <label>
          Hor(deg):
          <input
            type="number"
            value={horizonHeight || ''}
            onChange={(e) => setHorizonHeight(parseFloat(e.target.value))}
            disabled={isLoading}
          />
        </label>
        <label>
          Time:
          <UTCDateTimePicker
            className="time-picker"
            value={time}
            onChange={(newTime) => setTime(newTime)}
            disabled={isLoading}
          />
        </label>
      </div>
    </div>

  );
};

export default MyPosition;