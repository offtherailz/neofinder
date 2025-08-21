import React, { useEffect, useState } from 'react';
import { DataGrid, SelectColumn } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import { applyAsteroidsFilter } from '../utils';
import { FaFilter } from 'react-icons/fa';
import { GiAsteroid } from 'react-icons/gi';
import { fetchEphemerides } from '../api/neocp';

export function NeocpAsteroidsTable({
    filteredAsteroids,
    asteroids,
    selectedAsteroids = [],
    setSelectedAsteroids,
    refreshAsteroids,
    setRefreshAsteroids = () => {},
    filter = {},
    horizonData = {},
    setFilter = () => {},
}) {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [sortColumns, setSortColumns] = useState([]);

  useEffect(() => {
      // Each feature has a 'properties' object
      const features = filteredAsteroids?.features || [];
      if (features.length === 0) return;

      // Get all property keys from the first feature
      const propertyKeys = Object.keys(features[0].properties);

      // Build columns config
      const cols = propertyKeys.filter(k => k !== "itemData").map(key => ({
        key,
        name: key,
        sortable: true,
        resizable: true,
      })).map((col) => ({
              ...col,
              // if Temp_Design, frozen
              frozen: col.key === "Temp_Desig",
       }));

      // Build rows array
      const rowsArr = applyAsteroidsFilter(features, filter).map(f => f.properties);
      const buttonsColumn = {
        key: 'actions',
        name: 'Actions',
        renderCell: ({ row }) => (
          <button onClick={(evt, data) => {
              alert(`Fetching ephemerides for ${row.Temp_Desig}`);
              fetchEphemerides({ obj: row.Temp_Desig })
            }}>
            <GiAsteroid title="Get ephemerides" />
          </button>
        ),
        width: 100,
      };
      setColumns([SelectColumn, buttonsColumn, ...cols]);
      setRows(rowsArr);
      }, [filteredAsteroids?.features, filter]);

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
  return (<div id="NeocpAsteroidsTable" style={{ height: 600, width: '100%' }}>
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
    <div>
    <div style={{width: '100%', textAlign: 'center', marginTop: '10px'}}>
        {
          filteredAsteroids?.features.length > 0 && (
             `(${filteredAsteroids?.features.length} asteroid${filteredAsteroids?.features.length > 1 ? 's' : ''} filtered)`
          )
        }
        {selectedAsteroids.length > 0 && (
            `(${selectedAsteroids.length} asteroid${selectedAsteroids.length > 1 ? 's' : ''} selected)`
        )}
        {asteroids && asteroids.features.length > 0 && (
            `${asteroids.features.length} asteroid${asteroids.features.length > 1 ? 's' : ''} Total.`
        )}
    </div>
    <div>
      <div className="controls">
          <button onClick={() => setRefreshAsteroids(!refreshAsteroids)}>Refresh Asteroids</button>
          <button onClick={() => setFilter({})}>Reset Filter</button>
          <button className={filter?.horizon ? "button-active" : ""} onClick={() => setFilter({
            ...filter,
            horizon: !filter.horizon
          })}>
            <FaFilter /> Filter by Horizon
          </button>
        </div>
    </div>
    </div>
    </div>)
}

export default NeocpAsteroidsTable;