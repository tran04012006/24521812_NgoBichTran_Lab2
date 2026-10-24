
import type { ReactNode } from "react";

import type {
  DataGridProps,
} from "../types/data-grid-contract";

function DataGrid<T>({
  data,
  columns,
  ariaLabel,
}: DataGridProps<T>) {
  // Convert a cell value to a React-renderable value
  const renderCell = (value: T[keyof T]): ReactNode => {
    if (value === null || value === undefined) {
      return "";
    }

    return String(value);
  };

  return (
    <div className="table-container">
      <table>
        <caption>{ariaLabel}</caption>

        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.accessorKey)}
                scope="col"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={Math.max(columns.length, 1)}>
                No data available.
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td key={String(column.accessorKey)}>
                    {renderCell(item[column.accessorKey])}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataGrid;
