// @ts-nocheck

import { getDatabase, onValue, ref, update } from "firebase/database";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CSVLink } from "react-csv";
import { Column, useRowSelect, useSortBy, useTable } from "react-table";
import IndeterminateCheckbox from "../components/IndeterminateCheckbox";
import SelectInput from "../components/SelectInput";
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

  // const localityOptions = useMemo(
  //   () =>
  //     locations.map((i) => ({
  //       value: i.key,
  //       label: i.localityCode,
  //       country: i.country,
  //       state: i.state,
  //       localityName: i.localityName,
  //     })),
  //   [locations]
  // );
  const columns: Column<any>[] = useMemo(
    () => [
      {
        Header: "Isolate code",
        accessor: "isolateCode",
        // Cell: ({ row: { original } }) => (
        //   <input
        //     onChange={(e) => (original.isolateCode = e.target.value)}
        //     onBlur={(e) => editItem(original.key, e.target.value, "isolateCode")}
        //     defaultValue={[original.isolateCode] || ""}
        //   ></input>
        // ),
      },
      {
        Header: "Species (original det.)",
        accessor: "speciesOrig",
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
      },
      {
        Header: "ng/ul",
        accessor: "ngul",
        // Cell: ({ row: { original } }) => (
        //   <input
        //     onChange={(e) => (original.ngul = e.target.value)}
        //     onBlur={(e) => editItem(original.key, e.target.value, "ngul")}
        //     defaultValue={[original.ngul] || ""}
        //   ></input>
        // ),
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
      },
      {
        Header: "Storage site",
        accessor: "storageSite",
      },
      {
        Header: "Locality code",
        accessor: "localityCode",
        // Cell: ({ row: { original } }) => (
        //   <SelectInput
        //     options={[]}
        //     value={
        //       original.localityCode
        //         ? { value: original.localityCode, label: original.localityCode }
        //         : null
        //     }
        //     onChange={(value: any) => {
        //       editItem(original.key, value.value, "localityCode");
        //     }}
        //     isSearchable
        //     className="narrow"
        //   />
        // ),
      },
      {
        Header: "Country",
        accessor: "country",
        // Cell: ({ row: { original } }) => (
        //   <input
        //     onChange={(e) => {
        //       original.country = e.target.value;
        //     }}
        //     onBlur={(e) => {
        //       editItem(original.key, e.target.value, "country");
        //       editItem(original.key, "", "localityCode");
        //     }}
        //     defaultValue={[original.country] || ""}
        //   ></input>
        // ),
      },
      {
        Header: "State/province",
        accessor: "state",
        // Cell: ({ row: { original } }) => (
        //   <input
        //     onChange={(e) => {
        //       original.state = e.target.value;
        //     }}
        //     onBlur={(e) => {
        //       editItem(original.key, e.target.value, "state");
        //       editItem(original.key, "", "localityCode");
        //     }}
        //     defaultValue={[original.state] || ""}
        //   ></input>
        // ),
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
      },

      {
        Header: "Locality name",
        accessor: "localityName",
        // Cell: ({ row: { original } }) => (
        //   <input
        //     onChange={(e) => {
        //       original.localityName = e.target.value;
        //     }}
        //     onBlur={(e) => {
        //       editItem(original.key, e.target.value, "localityName");
        //       editItem(original.key, "", "localityCode");
        //     }}
        //     defaultValue={[original.localityName] || ""}
        //   ></input>
        // ),
      },
    ],
    [boxOptions, editItem]
  );

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

  const defaultColumn = {
    Cell: ({ value: initialValue }: any) => {
      return <span>{initialValue}</span>;
    },
  };

  const tableInstance = useTable(
    { columns, data: tableData, defaultColumn },
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
    prepareRow,
    selectedFlatRows,
  } = tableInstance;
  return (
    <>
      <table className="table" {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()}>{column.render("Header")}</th>
              ))}
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
      <div className="download">
        <CSVLink data={selectedFlatRows.map((i) => i.values)}>
          <div className="export">
            <ExportIcon />
            export CSV
          </div>
        </CSVLink>
      </div>
    </>
  );
};

export default DnaExtractions;
