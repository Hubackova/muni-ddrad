// @ts-nocheck

import { getDatabase, onValue, ref, update } from "firebase/database";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CSVLink } from "react-csv";
import {
  Column,
  useFilters,
  useGlobalFilter,
  useRowSelect,
  useSortBy,
  useTable,
} from "react-table";
import CreatableSelectInput from "../components/CreatableSelectInput";
import { GlobalFilter, Multi, multiSelectFilter } from "../components/Filter";
import IndeterminateCheckbox from "../components/IndeterminateCheckbox";
import { ReactComponent as ExportIcon } from "../images/export.svg";
import { DnaExtractionsType, StorageType } from "../types";
import "./Table.scss";

const Storage: React.FC = () => {
  const [storage, setStorage] = useState<StorageType[]>([]);
  const [extractions, setExtractions] = useState<DnaExtractionsType[]>([]);
  const db = getDatabase();

  useEffect(() => {
    onValue(ref(db, "storage/"), (snapshot) => {
      const items: any = [];
      snapshot.forEach((child) => {
        let childItem = child.val();
        childItem.key = child.key;
        items.push(childItem);
      });
      setStorage(items);
    });

    onValue(ref(db, "extractions/"), (snapshot) => {
      const items: DnaExtractionsType[] = [];
      snapshot.forEach((child) => {
        let childItem = child.val();
        childItem.key = child.key;
        items.push(childItem);
      });
      setExtractions(items);
    });
  }, [db]);

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

  const columns: Column<any>[] = useMemo(
    () => [
      {
        Header: "Box name",
        accessor: "box",
        Cell: ({ row: { original } }) => (
          <input
            onChange={(e) => (original.box = e.target.value)}
            onBlur={(e) => editItem(original.key, e.target.value, "box")}
            defaultValue={[original.box] || ""}
          ></input>
        ),
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Storage site",
        accessor: "storageSite",
        Cell: ({ row: { original } }) => (
          <CreatableSelectInput
            options={storageOptions}
            value={
              original.storageSite
                ? { value: original.storageSite, label: original.storageSite }
                : null
            }
            onChange={(value: any) => {
              editItem(original.key, value.value, "storageSite");
            }}
            isSearchable
            className="narrow"
          />
        ),
        Filter: Multi,
        filter: multiSelectFilter,
      },
    ],
    [editItem, storageOptions]
  );

  const EditableCell: React.FC<any> = ({
    value: initialValue,
    row,
    cell,
    column: { id },
  }) => {
    const [value, setValue] = React.useState(initialValue);

    const onChange = (e: any) => {
      setValue(e.target.value);
    };
    const onBlur = (e: any) => {
      if (e.target.value)
        editItem(row.original.key, e.target.value, cell.column.id);
    };
    React.useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);
    return <input value={value} onChange={onChange} onBlur={onBlur} />;
  };

  const tableInstance = useTable(
    {
      columns,
      data: storage,
      defaultColumn: { Cell: EditableCell, Filter: () => {} },
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
      <div className="table-container">
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
                      <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                    );
                  })}
                  <td className="sample-list">
                    {samples.map((sample) => (
                      <span className="sample">{sample.isolateCode}</span>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Storage;
