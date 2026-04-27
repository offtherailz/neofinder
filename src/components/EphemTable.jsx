import React, { useState, useMemo, useCallback } from "react";
import DataGrid from "./common/AutoHeightDataGrid";
import AladinView from "./AladinView";
import "react-data-grid/lib/styles.css";


/**
 * Component to display ephemerids in a table format using react-data-grid.
 * @param {ephemerids[]} array of ephemerids
 * @returns
 */
export default function EphemTable({ephemerids, cameraSampling = 1.055}) {
  const [filters] = useState({});
  const [selectedRowIdx, setSelectedRowIdx] = useState(null);


  // Define columns
  const columns = useMemo(
    () => [
      {
        key: "date",
        name: "Date, Time (UTC)",
        resizable: true,
        sortable: true,
        filterable: true,
        renderCell: ({ row }) => // UTC date formatting
          new Date(row.date).toLocaleString("en-US", {
            timeZone: "UTC",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
          })
      },
      { key: "ra", name: "R.A.", resizable: true, sortable: true, filterable: true },
      { key: "dec", name: "Dec", resizable: true, sortable: true, filterable: true },
      { key: "elong", name: "Elong", resizable: true, sortable: true, filterable: true },
      { key: "v", name: "Vmag", resizable: true, sortable: true, filterable: true },
      { key: "motion", name: "Motion(/min) ", resizable: true, sortable: true, filterable: true },
      { key: "pa", name: "P.A.", resizable: true, sortable: true, filterable: true },

      {
        key: "maxExposure",
        name: "Max Exp (s)",
        resizable: true,
        sortable: true,
        filterable: true,
        renderCell: ({ row }) => {
          const motionValue = Number(row.motion);
          const samplingValue = Number(cameraSampling);
          if (!Number.isFinite(motionValue) || !Number.isFinite(samplingValue) || motionValue <= 0 || samplingValue <= 0) {
            return "n/a";
          }
          return ((samplingValue * 60) / motionValue).toFixed(1);
        }
      },
      {
        key: "mapOffsets",
        name: "Map/Offsets",
        resizable: true,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => (
          <span>
            {row.mapUrl
              ? <a href={row.mapUrl} target="_blank" rel="noreferrer">Map</a>
              : <span style={{color:'#aaa'}}>Map</span>}
            {' / '}
            {row.offsetsUrl
              ? <a href={row.offsetsUrl} target="_blank" rel="noreferrer">Offsets</a>
              : <span style={{color:'#aaa'}}>Offsets</span>}
          </span>
        )
      }
    ],
    [cameraSampling]
  );

  // Filtering logic
  const filteredRows = useMemo(() => {
    const rows = ephemerids?.ephem ?? [];
    return rows.filter((row) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return String(row[key]).toLowerCase().includes(String(value).toLowerCase());
      });
    });
  }, [ephemerids, filters]);


  // Enhance columns with filter renderer
  const columnsWithFilters = columns.map((col) => ({
    ...col
  }));

  const suppressedCount = ephemerids?.suppressedCount ?? 0;

  const handleCellClick = useCallback(({ rowIdx }) => {
    setSelectedRowIdx(prev => (prev === rowIdx ? null : rowIdx));
  }, []);

  const selectedRow = selectedRowIdx != null ? filteredRows[selectedRowIdx] ?? null : null;

  return (
    <div>
      <DataGrid
        className="rdg-light"
        columns={columnsWithFilters}
        rows={filteredRows}
        defaultColumnOptions={{ resizable: true, sortable: true }}
        onCellClick={handleCellClick}
        rowClass={(row, idx) => idx === selectedRowIdx ? 'ephem-row-selected' : undefined}
      />
      {suppressedCount > 0 && (
        <div style={{ marginTop: 4, padding: '4px 8px', background: '#fff3cd', color: '#856404', borderRadius: 4, fontSize: '0.85em' }}>
          ⚠️ {suppressedCount} row{suppressedCount > 1 ? 's' : ''} with suppressed data (not shown)
        </div>
      )}
      <AladinView rows={filteredRows} selectedRow={selectedRow} />
    </div>
  );
}

