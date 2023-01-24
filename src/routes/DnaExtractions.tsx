// @ts-nocheck

import { getDatabase, ref, update } from "firebase/database";
import React, { useCallback, useMemo, useState } from "react";
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

interface DnaExtractionsProps {
  storage: StorageType[];
  extractions: DnaExtractionsType[];
}

const DnaExtractions: React.FC<DnaExtractionsProps> = ({
  storage,
  extractions,
}) => {
  const db = getDatabase();
  const [full, setFull] = useState(false);
  const editItem = useCallback(
    (key: string, newValue: string, id: string) => {
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

  const localityOptions = useMemo(() => getLocalityOptions(extractions), []);
  const customComparator = (prevProps, nextProps) => {
    return nextProps.value === prevProps.value;
  };

  const EditableCell = React.memo<React.FC<any>>(
    ({ value: initialValue, row, cell }) => {
      const [value, setValue] = React.useState(initialValue);
      const onChange = (e: any) => {
        setValue(e.target.value);
      };
      const onBlur = (e: any) => {
        editItem(row.original.key, e.target.value, cell.column.id);
      };
      console.log("render", initialValue);
      React.useEffect(() => {
        setValue(initialValue);
      }, [initialValue]);
      return <input value={value} onChange={onChange} onBlur={onBlur} />;
    },
    customComparator
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
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Project",
        accessor: "project",
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Isolation date",
        accessor: "dateIsolation",
        Cell: React.memo<React.FC<any>>(
          ({ row: { original } }) => (
            <input
              type="date"
              onChange={(e) => (original.dateIsolation = e.target.value)}
              onBlur={(e) =>
                editItem(original.key, e.target.value, "dateIsolation")
              }
              defaultValue={[original.dateIsolation] || ""}
            ></input>
          ),
          customComparator
        ),
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "ng/ul",
        accessor: "ngul",
        Cell: React.memo<React.FC<any>>(
          ({ row: { original } }) => (
            <input
              type="number"
              step=".00001"
              onChange={(e) => {
                original.ngul = e.target.value;
              }}
              onBlur={(e) => {
                editItem(original.key, e.target.value, "ngul");
              }}
              defaultValue={[original.ngul] || ""}
            />
          ),
          customComparator
        ),
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Box name",
        accessor: "box",
        Cell: React.memo<React.FC<any>>(
          ({ row: { original } }) => (
            <SelectInput
              options={boxOptions}
              value={
                original.box
                  ? { value: original.box, label: original.box }
                  : null
              }
              onChange={(value: any) => {
                editItem(original.key, value.value, "box");
              }}
              isSearchable
              className="narrow"
            />
          ),
          customComparator
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
        Cell: React.memo<React.FC<any>>(
          ({ row: { original } }) => (
            <SelectInput
              options={localityOptions}
              value={
                original.localityCode
                  ? {
                      value: original.localityCode,
                      label: original.localityCode,
                    }
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
          customComparator
        ),
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Country",
        accessor: "country",
        Cell: React.memo<React.FC<any>>(
          ({ row: { original } }) => (
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
          customComparator
        ),
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "State/province",
        accessor: "state",
        Cell: React.memo<React.FC<any>>(
          ({ row: { original } }) => (
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
          customComparator
        ),
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Kit",
        accessor: "kit",
        Filter: Multi,
        filter: multiSelectFilter,
      },

      {
        Header: "Locality name",
        accessor: "localityName",
        Cell: React.memo<React.FC<any>>(
          ({ row: { original } }) => (
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
          customComparator
        ),
        Filter: Multi,
        filter: multiSelectFilter,
      },
    ],
    [boxOptions, editItem, localityOptions]
  );

  const tableData = React.useMemo(
    () =>
      extractions.map((ex) => {
        const storageData = storage.find((i) => i.box === ex.box);
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
      autoResetPage: false,
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
  const rowsShow = full ? rows : rows.slice(0, 100);
  return (
    <>
      <div
        className="table-container"
        style={{
          height: `80vh`,
          overflow: "auto", // Make it scroll!
        }}
      >
        <table className="table" {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup, index) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={index}>
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
            {rowsShow.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} key={row.id}>
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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
        {rows.length > 100 && (
          <button onClick={() => setFull(!full)}>
            {full
              ? "show less"
              : `show more -  ${rows.length - 100} items left`}
          </button>
        )}
      </div>
    </>
  );
};

export default DnaExtractions;
