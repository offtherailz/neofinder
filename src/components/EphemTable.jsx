import React, { useState, useMemo } from "react";
import DataGrid from "./common/AutoHeightDataGrid";
import "react-data-grid/lib/styles.css";


/**
 * Component to display ephemerids in a table format using react-data-grid.
 * @param {ephemerids[]} array of ephemerids
 * @returns
 */
export default function EphemTable({ephemerids}) {
  const rows = ephemerids?.ephem ?? [];
  const [filters, setFilters] = useState({});


  // Define columns
  const columns = useMemo(
    () => [
      {
        key: "date",
        name: "Date",
        resizable: true,
        sortable: true,
        filterable: true,
        renderCell: ({ row }) => row.date.toLocaleString()
      },
      { key: "ra", name: "R.A.", resizable: true, sortable: true, filterable: true },
      { key: "dec", name: "Dec", resizable: true, sortable: true, filterable: true },
      { key: "elong", name: "Elong", resizable: true, sortable: true, filterable: true },
      { key: "v", name: "Vmag", resizable: true, sortable: true, filterable: true },
      { key: "motion", name: "Motion(/min) ", resizable: true, sortable: true, filterable: true },
      { key: "pa", name: "P.A.", resizable: true, sortable: true, filterable: true }
    ],
    []
  );

  // Filtering logic
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return String(row[key]).toLowerCase().includes(String(value).toLowerCase());
      });
    });
  }, [rows, filters]);

  // Header filters renderer
  function FilterRenderer({ column }) {
    return (
      <input
        style={{ width: "100%" }}
        placeholder={`Filter ${column.name}`}
        value={filters[column.key] ?? ""}
        onChange={(e) =>
          setFilters({ ...filters, [column.key]: e.target.value })
        }
      />
    );
  }

  // Enhance columns with filter renderer
  const columnsWithFilters = columns.map((col) => ({
    ...col,
    headerRenderer: (p) => (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span>{p.column.name}</span>
        <FilterRenderer column={p.column} />
      </div>
    )
  }));

  return (
    <div >
      <DataGrid
        className="rdg-light"
        columns={columnsWithFilters}
        rows={filteredRows}
        defaultColumnOptions={{ resizable: true, sortable: true }}
      />
    </div>
  );
}

