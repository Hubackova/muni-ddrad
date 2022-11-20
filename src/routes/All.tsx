// @ts-nocheck
import { getDatabase, onValue, ref, update } from "firebase/database";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CSVLink } from "react-csv";
import { useRowSelect, useSortBy, useTable } from "react-table";
import IndeterminateCheckbox from "../components/IndeterminateCheckbox";
import SelectInput from "../components/SelectInput";
import { getLocalityOptions } from "../helpers/getLocalityOptions";
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

  const localityOptions = useMemo(
    () => getLocalityOptions(extractions),
    [extractions]
  );

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

  const customColumns: Column<any>[] = useMemo(
    () => [
      {
        Header: "Isolate code",
        accessor: "isolateCode",
        Cell: ({ row: { original } }) => (
          <input defaultValue={[original.isolateCode] || ""} disabled></input>
        ),
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
      },
      {
        Header: "Species (original det.)",
        accessor: "speciesOrig",
        Cell: ({ row: { original } }) => {
          return <span>{original.speciesOrig}</span>;
        },
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
      },
      {
        Header: "Latitude [°N]",
        accessor: "latitude",
        Cell: ({ row: { original } }) => (
          <input
            onChange={(e) => {
              original.latitude = e.target.value;
            }}
            onBlur={(e) => {
              editItem(original.key, e.target.value, "latitude");
              editItem(original.key, "", "localityCode");
            }}
            defaultValue={[original.latitude] || ""}
            disabled={original.localityCode}
          ></input>
        ),
      },
      {
        Header: "Longitude [°E]",
        accessor: "longitude",
        Cell: ({ row: { original } }) => (
          <input
            onChange={(e) => {
              original.longitude = e.target.value;
            }}
            onBlur={(e) => {
              editItem(original.key, e.target.value, "longitude");
              editItem(original.key, "", "localityCode");
            }}
            defaultValue={[original.longitude] || ""}
            disabled={original.localityCode}
          ></input>
        ),
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
      },
      {
        Header: "Habitat",
        accessor: "habitat",
        Cell: ({ row: { original } }) => (
          <input
            onChange={(e) => {
              original.habitat = e.target.value;
            }}
            onBlur={(e) => {
              editItem(original.key, e.target.value, "habitat");
              editItem(original.key, "", "localityCode");
            }}
            defaultValue={[original.habitat] || ""}
            disabled={original.localityCode}
          ></input>
        ),
      },
      {
        Header: "Altitude [m a.s.l.]",
        accessor: "altitude",
        Cell: ({ row: { original } }) => (
          <input
            onChange={(e) => {
              original.altitude = e.target.value;
            }}
            onBlur={(e) => {
              editItem(original.key, e.target.value, "altitude");
              editItem(original.key, "", "localityCode");
            }}
            defaultValue={[original.altitude] || ""}
            disabled={original.localityCode}
          ></input>
        ),
      },
      {
        Header: "Date collection",
        accessor: "dateCollection",
        Cell: ({ row: { original } }) => (
          <input
            onChange={(e) => {
              original.dateCollection = e.target.value;
            }}
            onBlur={(e) => {
              editItem(original.key, e.target.value, "dateCollection");
              editItem(original.key, "", "localityCode");
            }}
            defaultValue={[original.dateCollection] || ""}
            disabled={original.localityCode}
          ></input>
        ),
      },
      {
        Header: "Collector",
        accessor: "collector",
        Cell: ({ row: { original } }) => (
          <input
            onChange={(e) => {
              original.collector = e.target.value;
            }}
            onBlur={(e) => {
              editItem(original.key, e.target.value, "collector");
              editItem(original.key, "", "localityCode");
            }}
            defaultValue={[original.collector] || ""}
            disabled={original.localityCode}
          ></input>
        ),
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
          console.log(original);
          return (
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
          );
        },
      },
      {
        Header: "Storage site",
        accessor: "storageSite",
        Cell: ({ row: { original } }) => {
          return <span>{original?.storageSite}</span>;
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
    [boxOptions, editItem, localityOptions, storage]
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
      data: tableData,
      defaultColumn: { Cell: EditableCell },
    },
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
