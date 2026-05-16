import React, { useEffect, useState } from 'react';
import { FaMapMarkerAlt, FaSave, FaPlay, FaWpforms, FaPause } from 'react-icons/fa';
import { GiHorizonRoad } from "react-icons/gi";
import { GiAsteroid } from "react-icons/gi";
import UTCDateTimePicker from './UTCDateTimePicker';
import './style/position.css';
import Modal from './common/Modal';
import EphemMPCForm from './EphForm';
import Tabs from './common/Tabs';
import { getSetting } from '../persistence';
import { CONFIG_KEYS, DEFAULT_CAMERA_SAMPLING, DEFAULT_MAX_OFFSET_ARCSEC, DEFAULT_FOV_SIZE } from '../constants';

/** Convert decimal degrees to { deg, min, sec } (all non-negative) */
function degToDMS(degrees) {
  const d = Math.floor(degrees);
  const rem = (degrees - d) * 60;
  const m = Math.floor(rem);
  const s = parseFloat(((rem - m) * 60).toFixed(2));
  return { deg: d, min: m, sec: s };
}

/** Convert { deg, min, sec } to decimal degrees */
function dmsToDeg({ deg, min, sec }) {
  return (Number(deg) || 0) + (Number(min) || 0) / 60 + (Number(sec) || 0) / 3600;
}
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
  cameraSampling,
  setCameraSampling = () => {},
  maxOffsetArcsec,
  setMaxOffsetArcsec = () => {},
  fovSize,
  setFovSize = () => {},
}) => {
  const [, setError] = useState(null);
  const [collapsed, setCollapsed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showEphemParamsForm, setShowEphemParamsForm] = useState(false);
  const observatoryLocked = Number(ephemParams?.Parallax) === 1;

  const savedCameraSampling = getSetting(CONFIG_KEYS.CAMERA_SAMPLING);
  const cameraSamplingValue = Number.isFinite(cameraSampling)
    ? cameraSampling
    : (Number.isFinite(savedCameraSampling) ? savedCameraSampling : DEFAULT_CAMERA_SAMPLING);
  const savedMaxOffsetArcsec = getSetting(CONFIG_KEYS.MAX_OFFSET_ARCSEC);
  const maxOffsetArcsecValue = Number.isFinite(maxOffsetArcsec)
    ? maxOffsetArcsec
    : (Number.isFinite(savedMaxOffsetArcsec) ? savedMaxOffsetArcsec : DEFAULT_MAX_OFFSET_ARCSEC);
  const [cameraSamplingInput, setCameraSamplingInput] = useState(String(cameraSamplingValue));
  const [maxOffsetArcsecInput, setMaxOffsetArcsecInput] = useState(String(maxOffsetArcsecValue));

  // FOV local DMS state
  const resolvedFov = (fovSize?.width != null && fovSize?.height != null) ? fovSize : DEFAULT_FOV_SIZE;
  const [fovWidthDMS, setFovWidthDMS] = useState(() => degToDMS(resolvedFov.width));
  const [fovHeightDMS, setFovHeightDMS] = useState(() => degToDMS(resolvedFov.height));

  // Sync local DMS when fovSize changes from outside
  useEffect(() => {
    if (fovSize?.width != null) setFovWidthDMS(degToDMS(fovSize.width));
    if (fovSize?.height != null) setFovHeightDMS(degToDMS(fovSize.height));
  }, [showEphemParamsForm, fovSize?.width, fovSize?.height]); // re-sync when modal opens

  const commitFovSize = () => {
    const w = dmsToDeg(fovWidthDMS);
    const h = dmsToDeg(fovHeightDMS);
    if (w > 0 && h > 0) {
      setFovSize({ width: w, height: h });
    }
  };

  useEffect(() => {
    setCameraSamplingInput(String(cameraSamplingValue));
  }, [cameraSamplingValue, showEphemParamsForm]);

  useEffect(() => {
    setMaxOffsetArcsecInput(String(maxOffsetArcsecValue));
  }, [maxOffsetArcsecValue, showEphemParamsForm]);

  const commitCameraSampling = () => {
    const nextValue = parseFloat(cameraSamplingInput);
    if (Number.isFinite(nextValue) && nextValue > 0) {
      setCameraSampling(nextValue);
      setCameraSamplingInput(String(nextValue));
      return;
    }
    setCameraSampling(DEFAULT_CAMERA_SAMPLING);
    setCameraSamplingInput(String(DEFAULT_CAMERA_SAMPLING));
  };

  const commitMaxOffsetArcsec = () => {
    const nextValue = parseFloat(maxOffsetArcsecInput);
    if (Number.isFinite(nextValue) && nextValue > 0) {
      setMaxOffsetArcsec(nextValue);
      setMaxOffsetArcsecInput(String(nextValue));
      return;
    }
    setMaxOffsetArcsec(DEFAULT_MAX_OFFSET_ARCSEC);
    setMaxOffsetArcsecInput(String(DEFAULT_MAX_OFFSET_ARCSEC));
  };

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
        <h2>Posizione</h2>&nbsp;&nbsp;
        <div className="position-viewer-buttons">
          <button className={showEphemParamsForm ? "button-active" : ""} title="Show params form"
        onClick={() => setShowEphemParamsForm(!showEphemParamsForm)}
        disabled={isLoading}>
          <FaWpforms />
        </button>
        <button title={isLoading ? "loading" : "get current position"}
        onClick={getMyPosition}
        disabled={isLoading || observatoryLocked}>
          <FaMapMarkerAlt />
        </button>
        <button className={autoUpdate ? "button-active" : ""} title="toggle auto update"
        onClick={() => setAutoUpdate(!autoUpdate)}>
          {autoUpdate ? <FaPause /> : <FaPlay />}
        </button>
        </div>
      </div>
      {!collapsed && (<div className="position-viewer-content">
          <label>
            Lat :
            <input
              type="number"
              value={position?.latitude ?? ''}
              onChange={(e) => setPosition({ ...position, latitude: parseFloat(e.target.value) })}
              disabled={isLoading || observatoryLocked}
            />
          </label>
          <label>
            Lon :
            <input
              type="number"
              value={position?.longitude ?? ''}
              onChange={(e) => setPosition({ ...position, longitude: parseFloat(e.target.value) })}
              disabled={isLoading || observatoryLocked}
            />
          </label>
          <label>
            Hor (deg):
            <input
              type="number"
              value={horizonHeight ?? ''}
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
        <Tabs
          tabs={[
            {
              label: 'MPC Params',
              content: (
                <EphemMPCForm
                  params={ephemParams}
                  setParams={setEphemParam}
                />
              )
            },
            {
              label: 'Camera',
              content: (
                <div className="form-container">
                  <h1 className="form-title">Impostazioni Camera</h1>
                  <form className="form-grid">
                    <label className="form-label" title="Campionamento della camera in arcsec/pixel">
                      Cam (arcsec/px)
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={cameraSamplingInput}
                        onChange={(e) => setCameraSamplingInput(e.target.value)}
                        onBlur={commitCameraSampling}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            commitCameraSampling();
                          }
                        }}
                        className="form-input"
                      />
                    </label>
                  </form>
                  <div style={{ marginTop: '0.75rem' }}>
                    Formula per la massima esposizione: (sampling * 60) / motion, con motion in arcsec/min
                  </div>

                  <h2 className="form-title" style={{ marginTop: '1.25rem' }}>Campo Visivo</h2>
                  <div style={{ fontSize: '0.82em', color: '#555', marginBottom: '0.5rem' }}>
                    Il campo visivo della camera viene disegnato sulla mappa del cielo quando si visualizzano le effemeridi.
                  </div>
                  <form style={{ display: 'flex', flexWrap: 'wrap', gap: 12, width: '100%', boxSizing: 'border-box' }}>
                    <fieldset style={{ border: '1px solid #ccc', borderRadius: 4, padding: '0.5rem 0.75rem', flex: '1 1 160px', minWidth: 0, boxSizing: 'border-box' }}>
                      <legend style={{ fontSize: '0.85em' }}>Width</legend>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <label className="form-label" style={{ flex: 1, minWidth: 0 }} title="Degrees">
                          °
                          <input type="number" min="0" step="1" className="form-input"
                            value={fovWidthDMS.deg}
                            onChange={e => setFovWidthDMS(p => ({ ...p, deg: e.target.value }))}
                            onBlur={commitFovSize}
                            onKeyDown={e => e.key === 'Enter' && commitFovSize()}
                          />
                        </label>
                        <label className="form-label" style={{ flex: 1, minWidth: 0 }} title="Arcminutes">
                          ′
                          <input type="number" min="0" max="59" step="1" className="form-input"
                            value={fovWidthDMS.min}
                            onChange={e => setFovWidthDMS(p => ({ ...p, min: e.target.value }))}
                            onBlur={commitFovSize}
                            onKeyDown={e => e.key === 'Enter' && commitFovSize()}
                          />
                        </label>
                        <label className="form-label" style={{ flex: 1, minWidth: 0 }} title="Arcseconds">
                          ″
                          <input type="number" min="0" max="59.99" step="0.1" className="form-input"
                            value={fovWidthDMS.sec}
                            onChange={e => setFovWidthDMS(p => ({ ...p, sec: e.target.value }))}
                            onBlur={commitFovSize}
                            onKeyDown={e => e.key === 'Enter' && commitFovSize()}
                          />
                        </label>
                      </div>
                    </fieldset>
                    <fieldset style={{ border: '1px solid #ccc', borderRadius: 4, padding: '0.5rem 0.75rem', flex: '1 1 160px', minWidth: 0, boxSizing: 'border-box' }}>
                      <legend style={{ fontSize: '0.85em' }}>Height</legend>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <label className="form-label" style={{ flex: 1, minWidth: 0 }} title="Degrees">
                          °
                          <input type="number" min="0" step="1" className="form-input"
                            value={fovHeightDMS.deg}
                            onChange={e => setFovHeightDMS(p => ({ ...p, deg: e.target.value }))}
                            onBlur={commitFovSize}
                            onKeyDown={e => e.key === 'Enter' && commitFovSize()}
                          />
                        </label>
                        <label className="form-label" style={{ flex: 1, minWidth: 0 }} title="Arcminutes">
                          ′
                          <input type="number" min="0" max="59" step="1" className="form-input"
                            value={fovHeightDMS.min}
                            onChange={e => setFovHeightDMS(p => ({ ...p, min: e.target.value }))}
                            onBlur={commitFovSize}
                            onKeyDown={e => e.key === 'Enter' && commitFovSize()}
                          />
                        </label>
                        <label className="form-label" style={{ flex: 1, minWidth: 0 }} title="Arcseconds">
                          ″
                          <input type="number" min="0" max="59.99" step="0.1" className="form-input"
                            value={fovHeightDMS.sec}
                            onChange={e => setFovHeightDMS(p => ({ ...p, sec: e.target.value }))}
                            onBlur={commitFovSize}
                            onKeyDown={e => e.key === 'Enter' && commitFovSize()}
                          />
                        </label>
                      </div>
                    </fieldset>
                  </form>

                  <button style={{ marginTop: '0.75rem' }} onClick={() => {
                    setCameraSampling(DEFAULT_CAMERA_SAMPLING);
                    setCameraSamplingInput(String(DEFAULT_CAMERA_SAMPLING));
                    setMaxOffsetArcsec(DEFAULT_MAX_OFFSET_ARCSEC);
                    setMaxOffsetArcsecInput(String(DEFAULT_MAX_OFFSET_ARCSEC));
                    setFovSize(DEFAULT_FOV_SIZE);
                    setFovWidthDMS(degToDMS(DEFAULT_FOV_SIZE.width));
                    setFovHeightDMS(degToDMS(DEFAULT_FOV_SIZE.height));
                  }}>
                    Reset valori
                  </button>
                </div>
              )
            }
          ]}
        />
      </Modal>
    }
    </>

  );
};

export default MyPosition;