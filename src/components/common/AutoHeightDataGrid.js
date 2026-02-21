import React from 'react';
import { DataGrid } from 'react-data-grid';
import useResizeObserver from '../../hooks/useResizeObserver';

/**
 * A wrapper around DataGrid that automatically adjusts its height to fit the container.
 * @param {Array} columns - The columns definition for the DataGrid.
 * @param {Array} rows - The rows data for the DataGrid.
 * @returns A DataGrid component that fills the available height of its container.
 * Usage:
 * <AutoHeightDataGrid columns={columns} rows={rows} />
 */
export default function AutoHeightDataGrid({ ...props}) {
  const containerRef = React.useRef(null);
  const { height } = useResizeObserver(containerRef);

  return (
      <DataGrid
        {...props}
        height={height}
        style={{ height: height ? height : '100%' }} // Subtracting 2px for borders/margins
      />
  );
}