import React, { useEffect, useState } from 'react';
import { DataGrid, SelectColumn } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';

const GEOJSON_URL = 'https://www.minorplanetcenter.net/Extended_Files/neocp.json';

export function NeocpAsteroidsTable({
    asteroids,
    selectedAsteroids = [],
    setSelectedAsteroids,
}) {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [sortColumns, setSortColumns] = useState([]);

  useEffect(() => {
      // Each feature has a 'properties' object
      const features = asteroids?.features || [];
      if (features.length === 0) return;

      // Get all property keys from the first feature
      const propertyKeys = Object.keys(features[0].properties);

      // Build columns config
      const cols = propertyKeys.map(key => ({
        key,
        name: key,
        sortable: true,
        resizable: true,
      }));

      // Build rows array
      const rowsArr = features.map(f => f.properties);

      setColumns([SelectColumn, ...cols]);
      setRows(rowsArr);
      }, [asteroids]);

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
  function rowKeyGetter(row: Row) {
    return row.name;
    }
  return (
    <div id="NeocpAsteroidsTable" style={{ height: 600, width: '100%' }}>
      <DataGrid
        rowKeyGetter={rowKeyGetter}
        columns={columns}
        rows={getSortedRows(rows, sortColumns)}
        sortColumns={sortColumns}
        onSortColumnsChange={setSortColumns}
        selectedRows={selectedAsteroids}
        onSelectedRowsChange={setSelectedAsteroids}
      />
    </div>
  );
}

export default NeocpAsteroidsTable;