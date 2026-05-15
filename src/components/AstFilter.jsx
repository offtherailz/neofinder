import React, { useState } from 'react';
import { FaFilter, FaInfoCircle } from 'react-icons/fa';
import Modal from './common/Modal';


import './style/filter.css';

export default function AsteroidFilter({ filter, setFilter }) {
  const [showFilters, setShowFilters] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilter({
      ...filter,
      [name]: value
    });
  };

  const toggleFlag = (name) => {
    setFilter({
      ...filter,
      [name]: !filter?.[name]
    });
  };

  const clearAll = () => {
    setFilter({});
  };

  return (
    <>
      <button onClick={() => setShowFilters(true)}>
        <FaFilter /> Filtri
      </button>

      <Modal open={showFilters} onClose={() => setShowFilters(false)}>
        <h2>Ricerca / filtri</h2>
        <form className="filter-form">
          <div className="filter-group">
            <button
              type="button"
              className={`horizon-toggle ${filter?.horizon ? 'button-active' : ''}`}
              onClick={() => toggleFlag('horizon')}
            >
              <FaFilter /> Horizon
            </button>
          </div>

          <fieldset>
            <legend>Identification</legend>
            <div className="filter-group">
              <label>
                Temp&nbsp;Desig
                <input
                  type="text"
                  name="tempDesig"
                  value={filter.tempDesig || ''}
                  onChange={handleChange}
                  placeholder="Search..."
                />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Score</legend>
            <div className="filter-group">
              <label>
                Min
                <input
                  type="number"
                  name="scoreMin"
                  value={filter.scoreMin || ''}
                  onChange={handleChange}
                  min="0"
                  max="100"
                />
              </label>
              <label>
                Max
                <input
                  type="number"
                  name="scoreMax"
                  value={filter.scoreMax || ''}
                  onChange={handleChange}
                  min="0"
                  max="100"
                />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Coordinates</legend>
            <div className="filter-group">
              <label>
                R.A. Min
                <input
                  type="number"
                  name="raMin"
                  value={filter.raMin || ''}
                  onChange={handleChange}
                  step="any"
                />
              </label>
              <label>
                R.A. Max
                <input
                  type="number"
                  name="raMax"
                  value={filter.raMax || ''}
                  onChange={handleChange}
                  step="any"
                />
              </label>
              <label>
                Decl. Min
                <input
                  type="number"
                  name="declMin"
                  value={filter.declMin || ''}
                  onChange={handleChange}
                  step="any"
                />
              </label>
              <label>
                Decl. Max
                <input
                  type="number"
                  name="declMax"
                  value={filter.declMax || ''}
                  onChange={handleChange}
                  step="any"
                />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend className="legend-with-info">
              Motion
              <button
                type="button"
                className="legend-info"
                data-tooltip="The Motion filter applies only to objects whose ephemerides have already been downloaded."
                aria-label="The Motion filter applies only to objects with downloaded ephemerides"
              >
                <FaInfoCircle />
              </button>
            </legend>
            <div className="filter-group">
              <label>
                Speed Min
                <input
                  type="number"
                  name="speedMin"
                  value={filter.speedMin || ''}
                  onChange={handleChange}
                  step="any"
                />
              </label>
              <label>
                Speed Max
                <input
                  type="number"
                  name="speedMax"
                  value={filter.speedMax || ''}
                  onChange={handleChange}
                  step="any"
                />
              </label>
              <label>
                N/A
                <input
                  type="checkbox"
                  name="motionNA"
                  checked={filter.motionNA ?? true}
                  onChange={(e) => setFilter({
                    ...filter,
                    motionNA: !(filter?.motionNA ?? true)
                  })}
                />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Observations</legend>
            <div className="filter-group">
              <label>
                NObs Min
                <input
                  type="number"
                  name="nobsMin"
                  value={filter.nobsMin || ''}
                  onChange={handleChange}
                />
              </label>
              <label>
                NObs Max
                <input
                  type="number"
                  name="nobsMax"
                  value={filter.nobsMax || ''}
                  onChange={handleChange}
                />
              </label>
            </div>
          </fieldset>
          <fieldset>
            <legend>Light</legend>
            <div className="filter-group">
              <label>
                Min V
                <input
                  type="number"
                  name="vMin"
                  value={filter.vMin || ''}
                  onChange={handleChange}
                  step="any"
                />
              </label>
              <label>
                Max V
                <input
                  type="number"
                  name="vMax"
                  value={filter.vMax || ''}
                  onChange={handleChange}
                  step="any"
                />
              </label>
              <label>
                Min H
                <input
                  type="number"
                  name="hMin"
                  value={filter.hMin || ''}
                  onChange={handleChange}
                  step="any"
                />
              </label>
              <label>
                Max H
                <input
                  type="number"
                  name="hMax"
                  value={filter.hMax || ''}
                  onChange={handleChange}
                  step="any"
                />
              </label>
            </div>
          </fieldset>
          <fieldset>
            <legend>Not seen</legend>
            <div className="filter-group">
              <label>
                Min days
                <input
                  type="number"
                  name="notSeenMin"
                  value={filter.notSeenMin || ''}
                  onChange={handleChange}
                  step="any"
                />
              </label>
              <label>
                Max days
                <input
                  type="number"
                  name="notSeenMax"
                  value={filter.notSeenMax || ''}
                  onChange={handleChange}
                  step="any"
                />
              </label>
            </div>
          </fieldset>
          <fieldset>
            <legend>Note</legend>
            <div className="filter-group checkbox-group">
                <label>
                S
                <button
                  type="button"
                  className="legend-info legend-info-native"
                  title={'Objects flagged with an "S" in the Note column are possibly in geocentric orbit and might soon be removed.'}
                  aria-label="Info about S note flag"
                >
                  <FaInfoCircle />
                </button>
                <input
                  type="checkbox"
                  name="noteS"
                  checked={filter.noteS ?? true}
                  onChange={(e) => setFilter({
                    ...filter,
                    noteS: !(filter?.noteS ?? true)
                  })}
                />
                </label>
                <label>
                B
                <button
                  type="button"
                  className="legend-info legend-info-native"
                  title={'Objects flagged with a "B" in the Note column have a possible bad tracklet or failed orbit fit and the ephemeris might not be correct. "B" flag does not overwrite the "S" flag.'}
                  aria-label="Info about B note flag"
                >
                  <FaInfoCircle />
                </button>
                <input
                  type="checkbox"
                  name="noteB"
                  checked={filter.noteB ?? true}
                  onChange={(e) => setFilter({
                    ...filter,
                    noteB: !(filter?.noteB ?? true)
                  })}
                />
                </label>
                <label>
                PCCP
                <button
                  type="button"
                  className="legend-info legend-info-native"
                  title="The object has been moved to pccp"
                  aria-label="Info about PCCP note flag"
                >
                  <FaInfoCircle />
                </button>
                <input
                  type="checkbox"
                  name="notePCCP"
                  checked={filter.notePCCP ?? true}
                  onChange={(e) => setFilter({
                    ...filter,
                    notePCCP: !(filter?.notePCCP ?? true)
                  })}
                />
                </label>
                <label>
                No notes
                <input
                  type="checkbox"
                  name="noteUndefined"
                  checked={filter.noteUndefined ?? true}
                  onChange={(e) => setFilter({
                    ...filter,
                    noteUndefined: !(filter?.noteUndefined ?? true)
                  })}
                />
                </label>
            </div>
          </fieldset>

          <div className="filter-buttons">
            <button type="button" onClick={clearAll}>
              Clear
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
