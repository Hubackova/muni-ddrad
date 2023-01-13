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
import { GlobalFilter, Multi, multiSelectFilter } from "../components/Filter";
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
        Filter: Multi,
        filter: multiSelectFilter,
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
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Species (original det.)",
        accessor: "speciesOrig",
        Cell: ({ row: { original } }) => <span>{original.speciesOrig}</span>,
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
        Cell: ({ row: { original } }) => <span>{original.storageSite}</span>,
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Country",
        accessor: "country",
        Cell: ({ row, row: { original } }) => {
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
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "16S",
        accessor: "16S",
        Cell: ({ row: { original } }) => (
          <input
            onChange={(e) => (original["16S"] = e.target.value)}
            onBlur={(e) => {
              editItem(original.key, e.target.value, "16S");
              setIsPopoverOpen(false);
            }}
            onFocus={() => setIsPopoverOpen(true)}
            defaultValue={[original["16S"]] || ""}
          ></input>
        ),
        Filter: Multi,
        filter: multiSelectFilter,
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
        Filter: Multi,
        filter: multiSelectFilter,
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
        Filter: Multi,
        filter: multiSelectFilter,
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
        Filter: Multi,
        filter: multiSelectFilter,
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
        Filter: Multi,
        filter: multiSelectFilter,
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
        Filter: Multi,
        filter: multiSelectFilter,
      },
    ],
    [boxOptions, editItem]
  );

  const customColumns2 = React.useMemo(
    () => [
      {
        Header: "note on PCR",
        accessor: "notePCR",
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "note on sequencing",
        accessor: "noteSequencing",
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "General Note",
        accessor: "noteGeneral",
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "STATUS",
        accessor: "status",
        Filter: Multi,
        filter: multiSelectFilter,
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
            Filter: Multi,
            filter: multiSelectFilter,
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
    state,
    rows,
    setGlobalFilter,
    preGlobalFilteredRows,
    selectedFlatRows,
    prepareRow,
  } = tableInstance;

  return (
    <>
      <div class="table-container">
        <table className="table" {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => {
                  return (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                    >
                      {column.render("Header")}{" "}
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? " ⬇️"
                            : " ⬆️"
                          : ""}
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
      </div>

      <div className="controls">
        <div className="add-new">
          <input
            value={newColumn}
            onChange={(e) => setNewColumn(e.target.value)}
          />
          <button onClick={() => addColumn(newColumn)}>Add new column</button>
        </div>
        <GlobalFilter
          preGlobalFilteredRows={preGlobalFilteredRows}
          globalFilter={state.globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
      </div>
      <div className="download">
        <CSVLink
          data={selectedFlatRows.map((i) => i.values)}
          filename="PCR-genomic-loci.csv"
        >
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
