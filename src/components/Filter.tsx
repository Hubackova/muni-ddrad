// @ts-nocheck

import React, { useMemo, useState } from "react";
import { useAsyncDebounce } from "react-table";

// Component for Global Filter
export function GlobalFilter({ globalFilter, setGlobalFilter }) {
  const [value, setValue] = useState(globalFilter);

  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <div>
      <label>Search Table: </label>
      <input
        value={value || ""}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder=" Enter value "
        className="w-25"
        style={{
          fontSize: "1.1rem",
          margin: "15px",
          display: "inline",
        }}
      />
    </div>
  );
}

// Component for Default Column Filter
export function DefaultFilterForColumn({
  column: {
    filterValue,
    preFilteredRows: { length },
    setFilter,
  },
}) {
  return (
    <input
      value={filterValue || ""}
      onChange={(e) => {
        // Set undefined to remove the filter entirely
        setFilter(e.target.value || undefined);
      }}
      placeholder={`Search ${length} records..`}
      style={{ marginTop: "10px" }}
    />
  );
}

// Component for Default Column Filter Ediatble
export function DefaultFilterForColumnEditable({
  value: initialValue,
  row,
  cell,
  column: {
    filterValue,
    preFilteredRows: { length },
    setFilter,
  },
}) {
  // We need to keep and update the state of the cell normally
  const [value, setValue] = React.useState(initialValue);

  const onChange = (e: any) => {
    setValue(e.target.value);
  };

  // We'll only update the external data when the input is blurred
  const onBlur = (e: any) => {
    if (e.target.value)
      editItem(row.original.key, e.target.value, cell.column.id);
  };

  // If the initialValue is changed external, sync it up with our state
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <input
      value={filterValue || value || ""}
      onChange={(e) => {
        // Set undefined to remove the filter entirely
        setFilter(e.target.value || undefined);
        onChange();
      }}
      onBlur={onBlur}
      placeholder={`Search ${length} records..`}
      style={{ marginTop: "10px" }}
    />
  );
}

// Component for Custom Select Filter
export function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}) {
  // Use preFilteredRows to calculate the options
  const options = useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach((row) => {
      options.add(row.values[id]);
    });
    return [...options.values()];
  }, [id, preFilteredRows]);

  // UI for Multi-Select box
  return (
    <select
      value={filterValue}
      onChange={(e) => {
        setFilter(e.target.value || undefined);
      }}
    >
      <option value="">All</option>
      {options.map((option, i) => (
        <option key={i} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
