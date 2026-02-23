import React, { useMemo, useState } from 'react';
import { SelectColumn } from 'react-data-grid';
import DataGrid from './common/AutoHeightDataGrid';
import 'react-data-grid/lib/styles.css';
import './style/asteroid-table.css';
import { applyAsteroidsFilter } from '../utils/utils';
import { GiAsteroid, GiMoonOrbit } from 'react-icons/gi';
import { fetchEphemerides } from '../api/neocp';
import AsteroidFilter from './AstFilter';

const arrayAvg = (arr = []) => arr?.length  ? (arr.reduce((acc, v) => acc + v, 0) / arr.length).toFixed(3) : NaN;
export function NeocpAsteroidsTable({
    ephemParams,
    setEphemParams,
    filteredAsteroids,
    asteroids,
    selectedAsteroids = [],
    setSelectedAsteroids,
    refreshAsteroids,
    setRefreshAsteroids = () => {},
    filter = {},
    loadingAsteroids,
    ephemerids = {},
    openEphemerides = () => {},
    setEphemerids = () => {},
    openPanel,
    setFilter = () => {},
}) {
  const [sortColumns, setSortColumns] = useState([]);
  const [loading, setLoading] = useState();
  const [progress, setProgress] = useState(0);
  const features = filteredAsteroids?.features || [];

  const buttonsColumn = useMemo(() => ({
    key: 'actions',
    name: 'Actions',
    renderCell: ({ row }) => (<button className={ephemerids?.[row.Temp_Desig ] ? "button-active" : ""} onClick={(evt, data) => {
          fetchEphemerides({ ...ephemParams, obj: row.Temp_Desig })
            .then(newEphemerides => {
              setEphemerids((ee) => ({
                ...ee,
                ...newEphemerides
              }));
              openEphemerides(row.Temp_Desig);

            }).catch(e => {
              console.log(e);
            })
        }}>
        <GiMoonOrbit title="Get ephemerides" />
      </button>),
    width: 100,
  }), [ephemParams, ephemerids, setEphemerids]);

  const columns = [
    SelectColumn,
    buttonsColumn,
    {
      key: 'Temp_Desig',
      name: 'Temp_Desig',
      sortable: true,
      resizable: true
    }, {
      key: 'Score',
      width: 80,
      name: 'Score',
      sortable: true,
      resizable: true
    },{
      key: 'R.A.',
      name: 'R.A.',
      sortable: true,
      resizable: true
    },{
      key: 'Decl.',
      name: 'Decl.',
      sortable: true,
      resizable: true
    }, {
      key: 'speed',
      name: 'avg. speed',
      sortable: true,
      resizable: true
    },{
      key: 'NObs',
      name: 'NObs',
      width: 80,
      sortable: true,
      resizable: true
    },{
      key: 'Not_Seen_dys',
      name: 'Not seen(days)',

      sortable: true,
      resizable: true
    },{
      key: 'V',
      name: 'V',
      width: 80,

      sortable: true,
      resizable: true
    },{
      key: 'H',
      name: 'H',
      width: 80,

      sortable: true,
      resizable: true
    },{
      key: 'Note',
      name: 'Note',
      width: 80,

      sortable: true,
      resizable: true
    },{
      key: 'Updated',
      name: 'Updated',
      sortable: true,
      resizable: true
    }
  ]

  function getSpeed(dd = []) {
    const avgSpeed = arrayAvg(dd.map(ep => ep?.motion).filter(ep => !!ep));
    if(isNaN(avgSpeed)) return "n/a";
    return avgSpeed;
  }
  function getDiscoveryDate(data = {}) {
      const year = data.Discovery_year;
      const month = data.Discovery_month - 1; // month in JS: 0 = gennaio
      const day = Math.floor(data.Discovery_day);
      const fraction = data.Discovery_day - day;

      // calcolo ore/minuti/secondi dalla parte decimale
      const hours = Math.floor(fraction * 24); // TODO: UTC
      // const minutes = Math.floor((fraction * 24 - hours) * 60);
      // const seconds = Math.floor((((fraction * 24 - hours) * 60) - minutes) * 60);
      return `${year}-${month}-${day} (~${hours}:00)`
  }
  const rows = applyAsteroidsFilter(features ?? [], filter, { ephemerids })
        .map(f => f.properties)
        .map(p => ({
          ...p,
          speed: getSpeed(ephemerids?.[p.Temp_Desig]?.ephem),
          discovery: getDiscoveryDate(p)
        }));


  // Sorting logic
  function getSortedRows(rows, sortColumns) {
    if (sortColumns.length === 0) return rows;
    const [{ columnKey, direction }] = sortColumns;

    return [...rows].sort((a, b) => {
      if (a[columnKey] == null) return 1;
      if (b[columnKey] == null) return -1;
      if (typeof a[columnKey] === 'number' && typeof b[columnKey] === 'number') {
        return direction === 'ASC' ? a[columnKey] - b[columnKey] : b[columnKey] - a[columnKey];
      }
      return direction === 'ASC'
        ? String(a[columnKey]).localeCompare(String(b[columnKey]))
        : String(b[columnKey]).localeCompare(String(a[columnKey]));
    });
  }
  function rowKeyGetter(row) {
    return row.name;
  }

  const fetchAllEphemerides = (obj) => {
    setLoading("ephemerides");
    // if obj are too many, we should batch them to avoid overloading the server
    const batchSize = 1;
    const batches = [];
    for (let i = 0; i < obj.length; i += batchSize) {
      batches.push(obj.slice(i, i + batchSize));
    }
    // one at a time to avoid overloading the server

    const processBatches = async () => {
      // set counter to track progress
      setProgress(batches.length);
      for (const batch of batches) {
        try {
          const result = await fetchEphemerides({ ...ephemParams, obj: batch });
          setEphemerids((ee) => ({
            ...ee,
            ...result
          }));
        } catch (e) {
          console.log(e);
        } finally {
            setProgress((p) => p - 1);
        }
      }
      setLoading(false);
      setProgress(0);
    };
    processBatches();

  };
  return (<div id="NeocpAsteroidsTable" style={{ display: 'flex', flexDirection: 'column' }}>
     <div>
      <div className="controls">
        <div>
          <button title="refresh the list of asteroids" onClick={() => setRefreshAsteroids(!refreshAsteroids)}><GiAsteroid /> Refresh Asteroids</button>
          <button title="Fetch ephemerides for all the objects in the table" onClick={() => fetchAllEphemerides(features.map(f => f.properties.Temp_Desig))}><GiMoonOrbit />Fetch ephemerides</button>
          <AsteroidFilter
            filter={filter}
            setFilter={setFilter}
            />
        </div>
        <div style={{ textAlign: 'center', marginTop: '10px'}}>
        {loading || loadingAsteroids
          ?(<>
            {loadingAsteroids ? 'Loading asteroids...' : null}
            {loading ? `Loading ${loading}... ${progress} remaining` : null}
            </>)
          : (<div>{
            filteredAsteroids?.features && (
                `(${filteredAsteroids?.features.length} asteroid${filteredAsteroids?.features.length > 1 ? 's' : ''} filtered)`
              )
            }
            {selectedAsteroids.length > 0 && (
                `(${selectedAsteroids.length} asteroid${selectedAsteroids.length > 1 ? 's' : ''} selected)`
            )}
            {asteroids && asteroids.features.length > 0 && (
                `${asteroids.features.length} asteroid${asteroids.features.length > 1 ? 's' : ''} Total.`
            )}</div>)
        }
    </div>
        </div>
    </div>
    <div style={{flex: 1, minHeight: 250}}>
      <DataGrid
        className="rdg-light"
        rowKeyGetter={rowKeyGetter}
        columns={columns}
        rows={getSortedRows(rows, sortColumns)}
        sortColumns={sortColumns}
        onSortColumnsChange={setSortColumns}
        selectedRows={selectedAsteroids}
        onSelectedRowsChange={setSelectedAsteroids}
      />
      </div>
    </div>)
}

export default NeocpAsteroidsTable;