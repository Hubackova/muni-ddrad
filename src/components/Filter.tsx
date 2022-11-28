// @ts-nocheck
import React, { useMemo, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { useAsyncDebounce } from "react-table";
import "./Filter.scss";

// Component for Global Filter
export function GlobalFilter({ globalFilter, setGlobalFilter }) {
  const [value, setValue] = useState(globalFilter);

  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <div>
      <span>Search Table: </span>
      <input
        value={value || ""}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder=" Enter value "
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
    if (e.target.value) editItem(row.original.key, e.target.value, cell.column.id);
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
export function SelectColumnFilter({ column: { filterValue, setFilter, preFilteredRows, id } }) {
  // Use preFilteredRows to calculate the options
  const options = useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach((row) => {
      options.add(row.values[id]);
    });
    return [...options.values()];
  }, [id, preFilteredRows]);
  const selectOptions = options.map((i) => ({ value: i, label: i }));
  // UI for Multi-Select box
  return (
    <CreatableSelect
      options={selectOptions}
      isSearchable={true}
      className="select-input-filter"
      classNamePrefix="select"
      menuPlacement="auto"
      isMulti
      formatCreateLabel={(userInput) => (
        <div className="search-label">{`Search for "${userInput}"`}</div>
      )}
      value={filterValue ? filterValue.map((i) => ({ value: i, label: i })) : ""}
      onChange={(e) => {
        setFilter(e.length > 0 ? e.map((i) => i.value) : "");
      }}
    />

    /*     <select
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
    </select> */
  );
}
export function NumberRangeColumnFilter({
  column: { filterValue = [], preFilteredRows, setFilter, id },
}) {
  const [min, max] = React.useMemo(() => {
    let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    preFilteredRows.forEach((row) => {
      min = Math.min(row.values[id], min);
      max = Math.max(row.values[id], max);
    });
    return [min, max];
  }, [id, preFilteredRows]);

  return (
    <div>
      <input
        value={filterValue[0] || ""}
        type="number"
        onChange={(e) => {
          const val = e.target.value;
          setFilter((old = []) => [val ? parseInt(val, 10) : undefined, old[1]]);
        }}
        placeholder={`Min (${min})`}
        style={{
          width: "70px",
          marginRight: "0.5rem",
        }}
      />
      to
      <input
        value={filterValue[1] || ""}
        type="number"
        onChange={(e) => {
          const val = e.target.value;
          setFilter((old = []) => [old[0], val ? parseInt(val, 10) : undefined]);
        }}
        placeholder={`Max (${max})`}
        style={{
          width: "70px",
          marginLeft: "0.5rem",
        }}
      />
    </div>
  );
}

export function multiSelectFilter(rows, columnIds, filterValue) {
  return filterValue.length === 0
    ? rows
    : rows.filter((row) => filterValue.includes(String(row.original[columnIds])));
}
