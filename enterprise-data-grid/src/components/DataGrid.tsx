
import { useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";

import type {
  DataGridProps,
} from "../types/data-grid-contract";

interface CellPosition {
  row: number;
  col: number;
}

function DataGrid<T>({
  data,
  columns,
  ariaLabel,
  onRowSelect,
}: DataGridProps<T>) {
  // 1. Create a unique ID for keyboard instructions
  const instructionsId = useId();

  // 2. Manage the currently active cell
  const [activeCell, setActiveCell] =
    useState<CellPosition>({ row: 0, col: 0 });

  // 3. Manage the selected row
  const [selectedRow, setSelectedRow] =
    useState<number | null>(null);

  // 4. Store DOM references to table cells
  const cellRefs = useRef<
    Map<string, HTMLTableCellElement>
  >(new Map());

  // Create a unique position key
  const getCellKey = (row: number, col: number) => {
    return `${row}-${col}`;
  };

  // Convert a cell value into renderable content
  const renderCell = (value: T[keyof T]): ReactNode => {
    if (value === null || value === undefined) {
      return "";
    }

    return String(value);
  };

  // Move keyboard focus to a specific cell
  const moveFocus = (row: number, col: number) => {
    const target = cellRefs.current.get(
      getCellKey(row, col)
    );

    if (!target) {
      return;
    }

    setActiveCell({ row, col });
    target.focus();
  };

  // Select a row and notify the parent component
  const selectRow = (rowIndex: number) => {
    if (!onRowSelect) {
      return;
    }

    setSelectedRow(rowIndex);
    onRowSelect(data[rowIndex]);
  };

  // Handle keyboard navigation
  const handleKeyDown = (
    event: KeyboardEvent<HTMLTableCellElement>,
    rowIndex: number,
    colIndex: number
  ) => {
    let nextRow = rowIndex;
    let nextCol = colIndex;

    const lastRow = data.length - 1;
    const lastCol = columns.length - 1;

    switch (event.key) {
      case "ArrowRight":
        nextCol = Math.min(colIndex + 1, lastCol);
        break;

      case "ArrowLeft":
        nextCol = Math.max(colIndex - 1, 0);
        break;

      case "ArrowDown":
        nextRow = Math.min(rowIndex + 1, lastRow);
        break;

      case "ArrowUp":
        nextRow = Math.max(rowIndex - 1, 0);
        break;

      case "Home":
        if (event.ctrlKey) {
          nextRow = 0;
        }
        nextCol = 0;
        break;

      case "End":
        if (event.ctrlKey) {
          nextRow = lastRow;
        }
        nextCol = lastCol;
        break;

      case "Enter":
      case " ":
        if (!onRowSelect) {
          return;
        }
        event.preventDefault();
        selectRow(rowIndex);
        return;

      default:
        return;
    }

    event.preventDefault();
    moveFocus(nextRow, nextCol);
  };

  return (
    <section className="grid-section">
      <p id={instructionsId} className="grid-instructions">
        Use arrow keys to navigate between cells.
        Press Home or End to move within a row.
        Press Ctrl+Home or Ctrl+End to navigate
        to the first or last cell.
        {onRowSelect &&
          " Press Enter or Space to select a row."}
      </p>

      <div className="table-container">
        <table
          role="grid"
          aria-label={ariaLabel}
          aria-describedby={instructionsId}
        >
          <thead>
            <tr role="row">
              {columns.map((column) => (
                <th
                  key={String(column.accessorKey)}
                  scope="col"
                  role="columnheader"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ||
            columns.length === 0 ? (
              <tr role="row">
                <td
                  role="gridcell"
                  colSpan={Math.max(columns.length, 1)}
                  tabIndex={0}
                  className="empty-cell"
                >
                  No data available.
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr
                  key={rowIndex}
                  role="row"
                  aria-selected={
                    onRowSelect
                      ? selectedRow === rowIndex
                      : undefined
                  }
                  className={
                    selectedRow === rowIndex && onRowSelect
                      ? "selected-row"
                      : ""
                  }
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={String(column.accessorKey)}
                      role="gridcell"
                      tabIndex={
                        activeCell.row === rowIndex &&
                        activeCell.col === colIndex
                          ? 0
                          : -1
                      }
                      ref={(element) => {
                        const key = getCellKey(
                          rowIndex,
                          colIndex
                        );

                        if (element) {
                          cellRefs.current.set(
                            key,
                            element
                          );
                        } else {
                          cellRefs.current.delete(key);
                        }
                      }}
                      onFocus={() =>
                        setActiveCell({
                          row: rowIndex,
                          col: colIndex,
                        })
                      }
                      onKeyDown={(event) =>
                        handleKeyDown(
                          event,
                          rowIndex,
                          colIndex
                        )
                      }
                      onClick={() => {
                        moveFocus(rowIndex, colIndex);
                        selectRow(rowIndex);
                      }}
                    >
                      {renderCell(
                        item[column.accessorKey]
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="sr-only" aria-live="polite">
        {selectedRow !== null && onRowSelect
          ? `Row ${selectedRow + 1} selected`
          : ""}
      </p>
    </section>
  );
}

export default DataGrid;
