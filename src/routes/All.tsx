// @ts-nocheck

import { getDatabase, onValue, ref } from "firebase/database";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CSVLink } from "react-csv";
import { useRowSelect, useSortBy, useTable } from "react-table";
import IndeterminateCheckbox from "../components/IndeterminateCheckbox";
import { ReactComponent as ExportIcon } from "../images/export.svg";
import { LocationType } from "../types";
import "./Table.scss";

interface Column {
  Header: any;
  accessor: any;
}

const All: React.FC = () => {
  const [extractions, setExtractions] = useState<LocationType[]>([]);
  const [storage, setStorage] = useState<StorageType[]>([]);
  const db = getDatabase();

  useEffect(() => {
    onValue(ref(db, "extractions/"), (snapshot) => {
      const items: any = [];
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

  const customColumns: Column<any>[] = useMemo(
    () => [
      {
        Header: "Isolate code",
        accessor: "isolateCode",
      },
      {
        Header: "Locality code",
        accessor: "localityCode",
      },
      {
        Header: "Country",
        accessor: "country",
      },
      {
        Header: "Latitude [°N]",
        accessor: "latitude",
      },
      {
        Header: "Longitude [°E]",
        accessor: "longitude",
      },
      {
        Header: "Altitude [m a.s.l.]",
        accessor: "altitude",
      },
      {
        Header: "State/province",
        accessor: "state",
      },
      {
        Header: "Locality name",
        accessor: "localityName",
      },
      {
        Header: "Habitat",
        accessor: "habitat",
      },
      {
        Header: "Date collection",
        accessor: "dateCollection",
      },
      {
        Header: "Collector",
        accessor: "collector",
      },
      {
        Header: "Species (original det.)",
        accessor: "speciesOrig",
      },
      {
        Header: "Project",
        accessor: "project",
      },
      {
        Header: "Isolation date",
        accessor: "dateIsolation",
      },
      {
        Header: "ng/ul",
        accessor: "ngul",
      },
      {
        Header: "Box name",
        accessor: "box",
        Cell: ({ row: { original } }) => {
          const box = storage.find((i) => i.key === original.box);
          return <span>{box.box}</span>;
        },
      },
      {
        Header: "Storage site",
        accessor: "storageSite",
        Cell: ({ row: { original } }) => {
          const box = storage.find((i) => i.key === original.box);

          return <span>{box.storageSite}</span>;
        },
      },
      {
        Header: "cytB",
        accessor: "cytB",
      },
      {
        Header: "16C",
        accessor: "16C",
      },
      {
        Header: "COI",
        accessor: "COI",
      },
      {
        Header: "COII",
        accessor: "COII",
      },

      {
        Header: "ITS1",
        accessor: "ITS1",
      },
      {
        Header: "ITS2",
        accessor: "ITS2",
      },
      {
        Header: "ELAV",
        accessor: "ELAV",
      },
    ],
    [storage]
  );

  const customColumns2: Column<any>[] = useMemo(
    () => [
      {
        Header: "note on PCR",
        accessor: "notePCR",
      },
      {
        Header: "note on sequencing",
        accessor: "noteSequencing",
      },
      {
        Header: "General Note",
        accessor: "noteGeneral",
      },
      {
        Header: "STATUS",
        accessor: "status",
      },
    ],
    []
  );

  /*   const editItem = (
    key: string,
    rowValues: any,
    newValue: string,
    cell: any
  ) => {
    set(ref(db, "extractions/" + key), {
      ...rowValues,
      [cell.column.id]: newValue,
    });
  };
*/

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

  const getColumnsAccessor = useCallback(
    (tableData) => {
      if (!tableData || !tableData.length) return [];
      const customKeys = [...customColumns, ...customColumns2].map(
        (i) => i.accessor
      );
      const tableDataKeys = Object.keys(tableData[0]);

      return tableDataKeys
        .map((i) => {
          if (customKeys.includes(i)) return null;
          return {
            Header: i,
            accessor: i,
          };
        })
        .filter((i) => i && i.accessor !== "key");
    },
    [customColumns, customColumns2]
  );

  const columns = React.useMemo(
    () => [
      ...customColumns,
      ...getColumnsAccessor(tableData),
      ...customColumns2,
    ],
    [customColumns, customColumns2, getColumnsAccessor, tableData]
  );

  const tableInstance = useTable(
    { columns, data: extractions, defaultColumn },
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
              <th>IsolateCode Group</th>
            </tr>
          ))}
        </thead>

        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);

            const groupItems = extractions.filter((i) => {
              return i.isolateCodeGroup === row.original.isolateCode;
            });

            return (
              <tr {...row.getRowProps()} key={row.original.key}>
                {row.cells.map((cell) => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  );
                })}
                <td className="sample-list">
                  {groupItems.map((i) => (
                    <span className="sample">{i.isolateCode}</span>
                  ))}
                </td>
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

export default All;
