// @ts-nocheck

import { getDatabase, ref, update } from "firebase/database";
import React, { useCallback, useMemo } from "react";
import { CSVLink } from "react-csv";
import {
  Column,
  useFilters,
  useGlobalFilter,
  useRowSelect,
  useSortBy,
  useTable,
} from "react-table";
import {
  CreatableSelectCell,
  customComparator,
  EditableCell,
} from "../components/Cell";
import { GlobalFilter, Multi, multiSelectFilter } from "../components/Filter";
import IndeterminateCheckbox from "../components/IndeterminateCheckbox";
import { ReactComponent as ExportIcon } from "../images/export.svg";
import { DnaExtractionsType, StorageType } from "../types";

interface DnaExtractionsProps {
  storage: StorageType[];
  extractions: DnaExtractionsType[];
}

const Storage: React.FC<DnaExtractionsProps> = ({ storage, extractions }) => {
  const db = getDatabase();

  const editItem = useCallback(
    (key: string, newValue: string, id: string) => {
      update(ref(db, "storage/" + key), {
        [id]: newValue,
      });
    },
    [db]
  );
  const storageOptions = useMemo(
    () =>
      Object.values(
        storage.reduce(
          (acc, cur) => Object.assign(acc, { [cur.storageSite]: cur }),
          {}
        )
      ).map((i: any) => ({
        value: i.storageSite,
        label: i.storageSite,
      })),
    [storage]
  );

  const DefaultCell = React.memo<React.FC<any>>(
    ({ value, row, cell }) => (
      <EditableCell
        initialValue={value}
        row={row}
        cell={cell}
        dbName="storage/"
      />
    ),
    customComparator
  );

  const columns: Column<any>[] = useMemo(
    () => [
      {
        Header: "Box name",
        accessor: "box",
        Cell: DefaultCell,
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Storage site",
        accessor: "storageSite",
        Cell: React.memo<React.FC<any>>(
          ({ value, row, cell }) => (
            <CreatableSelectCell
              initialValue={value}
              row={row}
              cell={cell}
              options={storageOptions}
              dbName="storage/"
            />
          ),
          customComparator
        ),
        Filter: Multi,
        filter: multiSelectFilter,
      },
    ],
    [editItem, storageOptions]
  );

  const tableInstance = useTable(
    {
      columns,
      data: storage,
    },
    useGlobalFilter,
    useFilters,
    useSortBy,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: "selection",
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <div>
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            </div>
          ),
          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
      ]);
    }
  );
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    setGlobalFilter,
    state,
    prepareRow,
    selectedFlatRows,
    preGlobalFilteredRows,
  } = tableInstance;

  return (
    <>
      <div
        className="table-container"
        style={{
          height: `80vh`,
          overflow: "auto",
        }}
      >
        <table className="table" {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup, index) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={index}>
                {headerGroup.headers.map((column) => (
                  <th key={column.id}>
                    <span
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                    >
                      {column.render("Header")}
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? " ⬇️"
                            : " ⬆️"
                          : ""}
                      </span>
                    </span>
                    <div className="filter-wrapper">
                      {column.canFilter ? column.render("Filter") : null}
                    </div>
                  </th>
                ))}
                <th>List of samples in the box</th>
              </tr>
            ))}
          </thead>

          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              const samples = extractions.filter((i) => {
                return i.box === row.original.key;
              });
              return (
                <tr {...row.getRowProps()} key={row.original.key}>
                  {row.cells.map((cell) => {
                    return (
                      <td
                        key={row.id + cell.column.id}
                        {...cell.getCellProps()}
                      >
                        {cell.render("Cell")}
                      </td>
                    );
                  })}
                  <td className="sample-list">
                    {samples.map((sample, index) => (
                      <span key={index} className="sample">
                        {sample.isolateCode}
                      </span>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="controls">
        <div className="download">
          <CSVLink
            data={selectedFlatRows.map((i) => i.values)}
            filename="storage.csv"
          >
            <div className="export">
              <ExportIcon />
              export CSV
            </div>
          </CSVLink>
        </div>
        <GlobalFilter
          preGlobalFilteredRows={preGlobalFilteredRows}
          globalFilter={state.globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
      </div>
    </>
  );
};

export default Storage;
