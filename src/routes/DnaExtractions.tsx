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
import { GlobalFilter, Multi, multiSelectFilter } from "../components/Filter";
import IndeterminateCheckbox from "../components/IndeterminateCheckbox";
import SelectInput from "../components/SelectInput";
import { getLocalityOptions } from "../helpers/getLocalityOptions";
import { ReactComponent as ExportIcon } from "../images/export.svg";
import { DnaExtractionsType, StorageType } from "../types";
import "./Table.scss";

const DnaExtractions: React.FC = () => {
  const [storage, setStorage] = useState<StorageType[]>([]);
  const [extractions, setExtractions] = useState<DnaExtractionsType[]>([]);
  const db = getDatabase();

  useEffect(() => {
    onValue(ref(db, "extractions/"), (snapshot) => {
      const items: DnaExtractionsType[] = [];
      snapshot.forEach((child) => {
        let childItem = child.val();
        childItem.key = child.key;
        items.push(childItem);
      });
      setExtractions(items);
    });
    onValue(ref(db, "storage/"), (snapshot) => {
      const items: StorageType[] = [];
      snapshot.forEach((child) => {
        let childItem = child.val();
        childItem.key = child.key;
        items.push(childItem);
      });
      setStorage(items);
    });
  }, [db]);

  const editItem = useCallback(
    (key: string, newValue: string, id: string) => {
      if (!newValue) return;
      update(ref(db, "extractions/" + key), {
        [id]: newValue,
      });
    },
    [db]
  );

  const boxOptions = useMemo(
    () =>
      storage.map((i) => ({
        value: i.key,
        label: i.box,
        storageSite: i.storageSite,
      })),
    [storage]
  );

  const localityOptions = useMemo(
    () => getLocalityOptions(extractions),
    [extractions]
  );

  const columns: Column<any>[] = useMemo(
    () => [
      {
        Header: "Isolate code",
        accessor: "isolateCode",
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Species (original det.)",
        accessor: "speciesOrig",
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Species, updated name",
        accessor: "speciesUpdated",
        Cell: ({ row: { original } }) => (
          <input
            onChange={(e) => (original.speciesUpdated = e.target.value)}
            onBlur={(e) =>
              editItem(original.key, e.target.value, "speciesUpdated")
            }
            defaultValue={[original.speciesUpdated] || ""}
          ></input>
        ),
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Project",
        accessor: "project",
        Cell: ({ row: { original } }) => (
          <input
            onChange={(e) => (original.project = e.target.value)}
            onBlur={(e) => editItem(original.key, e.target.value, "project")}
            defaultValue={[original.project] || ""}
          ></input>
        ),
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Isolation date",
        accessor: "dateIsolation",
        Cell: ({ row: { original } }) => (
          <input
            type="date"
            onChange={(e) => (original.dateIsolation = e.target.value)}
            onBlur={(e) =>
              editItem(original.key, e.target.value, "dateIsolation")
            }
            defaultValue={[original.dateIsolation] || ""}
          ></input>
        ),
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "ng/ul",
        accessor: "ngul",
        Cell: ({ row: { original } }) => (
          <input
            onChange={(e) => (original.ngul = e.target.value)}
            onBlur={(e) => editItem(original.key, e.target.value, "ngul")}
            defaultValue={[original.ngul] || ""}
          ></input>
        ),
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Box name",
        accessor: "box",
        Cell: ({ row: { original } }) => (
          <SelectInput
            options={boxOptions}
            value={
              original.box ? { value: original.box, label: original.box } : null
            }
            onChange={(value: any) => {
              editItem(original.key, value.value, "box");
            }}
            isSearchable
            className="narrow"
          />
        ),
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Storage site",
        accessor: "storageSite",
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Locality code",
        accessor: "localityCode",
        Cell: ({ row: { original } }) => (
          <SelectInput
            options={localityOptions}
            value={
              original.localityCode
                ? { value: original.localityCode, label: original.localityCode }
                : null
            }
            onChange={(value: any) => {
              editItem(original.key, value.value, "localityCode");
              editItem(original.key, value.country, "country");
              editItem(original.key, value.state, "state");
              editItem(original.key, value.localityName, "localityName");
              editItem(original.key, value.latitude, "latitude");
              editItem(original.key, value.longitude, "longitude");
              editItem(original.key, value.altitude, "altitude");
              editItem(original.key, value.habitat, "habitat");
              editItem(original.key, value.dateCollection, "dateCollection");
              editItem(original.key, value.collector, "collector");
            }}
            isSearchable
            className="narrow"
          />
        ),
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Country",
        accessor: "country",
        Cell: ({ row: { original } }) => (
          <input
            onChange={(e) => {
              original.country = e.target.value;
            }}
            onBlur={(e) => {
              editItem(original.key, e.target.value, "country");
              editItem(original.key, "", "localityCode");
            }}
            defaultValue={[original.country] || ""}
            disabled={original.localityCode}
          ></input>
        ),
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "State/province",
        accessor: "state",
        Cell: ({ row: { original } }) => (
          <input
            onChange={(e) => {
              original.state = e.target.value;
            }}
            onBlur={(e) => {
              editItem(original.key, e.target.value, "state");
              editItem(original.key, "", "localityCode");
            }}
            defaultValue={[original.state] || ""}
            disabled={original.localityCode}
          ></input>
        ),
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Kit",
        accessor: "kit",
        Cell: ({ row: { original } }) => (
          <input
            onChange={(e) => (original.kit = e.target.value)}
            onBlur={(e) => editItem(original.key, e.target.value, "kit")}
            defaultValue={[original.kit] || ""}
          ></input>
        ),
        Filter: Multi,
        filter: multiSelectFilter,
      },

      {
        Header: "Locality name",
        accessor: "localityName",
        Cell: ({ row: { original } }) => (
          <input
            onChange={(e) => {
              original.localityName = e.target.value;
            }}
            onBlur={(e) => {
              editItem(original.key, e.target.value, "localityName");
              editItem(original.key, "", "localityCode");
            }}
            defaultValue={[original.localityName] || ""}
            disabled={original.localityCode}
          ></input>
        ),
        Filter: Multi,
        filter: multiSelectFilter,
      },
    ],
    [boxOptions, editItem, localityOptions]
  );
  // Create an editable cell renderer
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

  const tableData = React.useMemo(
    () =>
      extractions.map((ex) => {
        const storageData = storage.find((i) => i.key === ex.box);
        return {
          ...ex,
          box: storageData?.box,
          storageSite: storageData?.storageSite,
        };
      }),
    [extractions, storage]
  );

  const tableInstance = useTable(
    {
      columns,
      data: tableData,
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
    state,
    prepareRow,
    selectedFlatRows,
    setGlobalFilter,
    preGlobalFilteredRows,
  } = tableInstance;
  return (
    <>
      <div className="controls">
        <GlobalFilter
          preGlobalFilteredRows={preGlobalFilteredRows}
          globalFilter={state.globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
        <div className="download">
          <CSVLink
            data={selectedFlatRows.map((i) => i.values)}
            filename="DNA-extractions.csv"
          >
            <div className="export">
              <ExportIcon />
              export CSV
            </div>
          </CSVLink>
        </div>
      </div>
      <div className="table-container">
        <table className="table" {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => {
                  return (
                    <th key={column.id}>
                      <span
                        {...column.getHeaderProps(
                          column.getSortByToggleProps()
                        )}
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
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} key={row.original.key}>
                  {row.cells.map((cell) => {
                    return (
                      <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default DnaExtractions;
