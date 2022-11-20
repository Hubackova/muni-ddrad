// @ts-nocheck
import { getDatabase, onValue, ref, update } from "firebase/database";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CSVLink } from "react-csv";
import {
  useFilters,
  useGlobalFilter,
  useRowSelect,
  useSortBy,
  useTable,
} from "react-table";
import { toast } from "react-toastify";
import { DefaultFilterForColumn, GlobalFilter } from "../components/Filter";
import IndeterminateCheckbox from "../components/IndeterminateCheckbox";
import SelectInput from "../components/SelectInput";
import { legend } from "../constants";
import { ReactComponent as ExportIcon } from "../images/export.svg";
import { ReactComponent as InfoIcon } from "../images/info.svg";
import { DnaExtractionsType, StorageType } from "../types";
import "./Table.scss";

const PcrGenomicLoci: React.FC = () => {
  const [extractions, setExtractions] = useState<DnaExtractionsType[]>([]);
  const [storage, setStorage] = useState<StorageType[]>([]);
  const [newColumn, setNewColumn] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState("");
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

  const tableData = React.useMemo(
    () =>
      extractions.map((ex) => {
        const {
          kit,
          speciesUpdated,
          altitude,
          collector,
          dateCollection,
          habitat,
          latitude,
          longitude,
          ...data
        } = ex;
        const storageData = storage.find((i) => i.key === ex.box);
        return {
          ...data,
          box: storageData?.box,
          storageSite: storageData?.storageSite,
        };
      }),
    [extractions, storage]
  );

  const addColumn = (name) => {
    const obj = tableData?.length ? tableData[0] : null;
    if (!obj) return null;
    update(ref(db, "extractions/" + obj.key), {
      [name]: "",
    });
    toast.success("Column was added successfully");
  };

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

  const customColumns = React.useMemo(
    () => [
      {
        Header: "Isolate code",
        accessor: "isolateCode",

        Cell: ({ row: { original } }) => (
          <input defaultValue={[original.isolateCode] || ""} disabled></input>
        ),
      },
      {
        Header: "Isolate code group",
        accessor: "isolateCodeGroup",

        Cell: ({ row: { original } }) => (
          <input
            defaultValue={[original.isolateCodeGroup] || ""}
            disabled
          ></input>
        ),
      },
      {
        Header: "Species (original det.)",
        accessor: "speciesOrig",
        Cell: ({ row: { original } }) => <span>{original.speciesOrig}</span>,
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
        Cell: ({ row: { original } }) => <span>{original.storageSite}</span>,
      },
      {
        Header: "Country",
        accessor: "country",
        Cell: ({ row, row: { original } }) => {
          console.log(row);
          return (
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
          );
        },
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
        Header: "cytB",
        accessor: "cytB",
        Cell: ({ row: { original } }) => (
          <input
            onChange={(e) => (original.cytB = e.target.value)}
            onBlur={(e) => {
              editItem(original.key, e.target.value, "cytB");
              setIsPopoverOpen(false);
            }}
            onFocus={() => setIsPopoverOpen(true)}
            defaultValue={[original.cytB] || ""}
          ></input>
        ),
      },
      {
        Header: "16C",
        accessor: "16C",
        Cell: ({ row: { original } }) => (
          <input
            onChange={(e) => (original["16C"] = e.target.value)}
            onBlur={(e) => {
              editItem(original.key, e.target.value, "16C");
              setIsPopoverOpen(false);
            }}
            onFocus={() => setIsPopoverOpen(true)}
            defaultValue={[original["16C"]] || ""}
          ></input>
        ),
      },
      {
        Header: "COI",
        accessor: "COI",
        Cell: ({ row: { original } }) => (
          <input
            onChange={(e) => (original.COI = e.target.value)}
            onBlur={(e) => {
              editItem(original.key, e.target.value, "COI");
              setIsPopoverOpen(false);
            }}
            onFocus={() => setIsPopoverOpen(true)}
            defaultValue={[original.COI] || ""}
          ></input>
        ),
      },
      {
        Header: "COII",
        accessor: "COII",
        Cell: ({ row: { original } }) => (
          <input
            onChange={(e) => (original.COII = e.target.value)}
            onBlur={(e) => {
              editItem(original.key, e.target.value, "COII");
              setIsPopoverOpen(false);
            }}
            onFocus={() => setIsPopoverOpen(true)}
            defaultValue={[original.COII] || ""}
          ></input>
        ),
      },

      {
        Header: "ITS1",
        accessor: "ITS1",
        Cell: ({ row: { original } }) => (
          <input
            onChange={(e) => (original.ITS1 = e.target.value)}
            onBlur={(e) => {
              editItem(original.key, e.target.value, "ITS1");
              setIsPopoverOpen(false);
            }}
            onFocus={() => setIsPopoverOpen(true)}
            defaultValue={[original.ITS1] || ""}
          ></input>
        ),
      },
      {
        Header: "ITS2",
        accessor: "ITS2",
        Cell: ({ row: { original } }) => (
          <input
            onChange={(e) => (original.ITS2 = e.target.value)}
            onBlur={(e) => {
              editItem(original.key, e.target.value, "ITS2");
              setIsPopoverOpen(false);
            }}
            onFocus={() => setIsPopoverOpen(true)}
            defaultValue={[original.ITS2] || ""}
          ></input>
        ),
      },
      {
        Header: "ELAV",
        accessor: "ELAV",
        Cell: ({ row: { original } }) => (
          <input
            onChange={(e) => (original.ELAV = e.target.value)}
            onBlur={(e) => {
              editItem(original.key, e.target.value, "ELAV");
              setIsPopoverOpen(false);
            }}
            onFocus={() => setIsPopoverOpen(true)}
            defaultValue={[original.ELAV] || ""}
          ></input>
        ),
      },
    ],
    [boxOptions, editItem]
  );

  const customColumns2 = React.useMemo(
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
    [customColumns, customColumns2, tableData, getColumnsAccessor]
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

  const tableInstance = useTable(
    {
      columns,
      data: tableData,
      initialState: { hiddenColumns: ["localityCode"] },
      defaultColumn: { Cell: EditableCell, Filter: DefaultFilterForColumn },
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
    visibleColumns,
    state,
    rows,
    setGlobalFilter,
    preGlobalFilteredRows,
    selectedFlatRows,
    prepareRow,
  } = tableInstance;

  return (
    <>
      <table className="table" {...getTableProps()}>
        <thead>
          <tr>
            <th
              colSpan={visibleColumns.length}
              style={{
                textAlign: "left",
              }}
            >
              {/* Rendering Global Filter */}
              <GlobalFilter
                preGlobalFilteredRows={preGlobalFilteredRows}
                globalFilter={state.globalFilter}
                setGlobalFilter={setGlobalFilter}
              />
            </th>
          </tr>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => {
                return (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                  >
                    {column.render("Header")}
                    <div>
                      {column.canFilter ? column.render("Filter") : null}
                    </div>
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? " 🔽"
                          : " 🔼"
                        : ""}
                    </span>
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
      {isPopoverOpen && (
        <div className="popover">
          <div className="close" onClick={() => setIsPopoverOpen(false)}>
            x
          </div>
          {legend.map((i) => (
            <div>{i}</div>
          ))}
        </div>
      )}
      <div className="add-new">
        <input
          value={newColumn}
          onChange={(e) => setNewColumn(e.target.value)}
        />
        <button onClick={() => addColumn(newColumn)}>Add new column</button>
      </div>

      <div className="download">
        <CSVLink data={selectedFlatRows.map((i) => i.values)}>
          <div className="export">
            <ExportIcon />
            export CSV
          </div>
        </CSVLink>
        <div
          className="legend"
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
        >
          <InfoIcon />
          {isPopoverOpen ? "hide legend" : "show legend"}
        </div>
      </div>
    </>
  );
};

export default PcrGenomicLoci;
