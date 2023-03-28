// @ts-nocheck
import { getDatabase, ref, update } from "firebase/database";
import React, { useCallback, useMemo, useState } from "react";
import { CSVLink } from "react-csv";
import {
  useFilters,
  useGlobalFilter,
  useRowSelect,
  useSortBy,
  useTable,
} from "react-table";
import { toast } from "react-toastify";
import {
  customComparator,
  customLocalityComparator,
  DateCell,
  EditableCell,
  EditableNoConfirmCell,
  SelectCell,
} from "../components/Cell";
import { GlobalFilter, Multi, multiSelectFilter } from "../components/Filter";
import IndeterminateCheckbox from "../components/IndeterminateCheckbox";
import { legend } from "../constants";
import { ReactComponent as ExportIcon } from "../images/export.svg";
import { ReactComponent as InfoIcon } from "../images/info.svg";
import { DnaExtractionsType, StorageType } from "../types";

interface DnaExtractionsProps {
  storage: StorageType[];
  extractions: DnaExtractionsType[];
}

const PcrGenomicLoci: React.FC<DnaExtractionsProps> = ({
  storage,
  extractions,
}) => {
  const [newColumn, setNewColumn] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState("");
  const [full, setFull] = useState(false);
  const [last, setLast] = useState(false);
  const db = getDatabase();

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

  const DefaultCell = React.memo<React.FC<any>>(
    ({ value, row, cell }) => (
      <EditableCell
        initialValue={value}
        row={row}
        cell={cell}
        saveLast={setLast}
      />
    ),
    customComparator
  );

  const handleRevert = () => {
    update(ref(db, "extractions/" + last.rowKey), {
      [last.cellId]: last.initialValue,
    });
    last.setValue &&
      last.setValue({ value: last.initialValue, label: last.initialValue });
    setLast(false);
  };

  const LocalityCell = React.memo<React.FC<any>>(
    ({ value, row, cell }) => (
      <EditableCell
        initialValue={value}
        row={row}
        cell={cell}
        disabled={row.original.localityCode}
        saveLast={setLast}
      />
    ),
    customLocalityComparator
  );

  const NoConfirmCell = React.memo<React.FC<any>>(
    ({ value, row, cell }) => (
      <EditableNoConfirmCell
        initialValue={value}
        row={row}
        cell={cell}
        saveLast={setLast}
      />
    ),
    customComparator
  );

  const customColumns = React.useMemo(
    () => [
      {
        Header: "Isolate code",
        accessor: "isolateCode",
        Cell: React.memo<React.FC<any>>(
          ({ row: { original } }) => (
            <input
              defaultValue={[original.isolateCode] || ""}
              className={"narrow"}
              disabled
            ></input>
          ),
          customComparator
        ),
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Species (original det.)",
        accessor: "speciesOrig",
        Cell: React.memo<React.FC<any>>(
          ({ row: { original } }) => <span>{original.speciesOrig}</span>,
          customComparator
        ),
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
          ({ value: initialValue, row, cell }) => (
            <DateCell
              initialValue={initialValue}
              row={row}
              cell={cell}
              saveLast={setLast}
            />
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
          ({ value, row, cell }) => (
            <EditableCell
              initialValue={value}
              row={row}
              cell={cell}
              type="number"
              step=".00001"
              saveLast={setLast}
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
        Cell: ({ value, row, cell }) => {
          const storageData = storage.find((i) => i.box === value);
          return (
            <SelectCell
              initialValue={value}
              initialKey={storageData?.key}
              row={row}
              cell={cell}
              options={boxOptions}
              saveLast={setLast}
            />
          );
        },

        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Storage site",
        accessor: "storageSite",
        Cell: ({ row: { original } }) => {
          return <span>{original?.storageSite}</span>;
        },
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Country",
        accessor: "country",
        Cell: LocalityCell,
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "State/province",
        accessor: "state",
        Cell: LocalityCell,
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Locality name",
        accessor: "localityName",
        Cell: LocalityCell,
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Isolate group",
        accessor: "isolateCodeGroup",
        Cell: React.memo<React.FC<any>>(
          ({ row: { original } }) => (
            <input
              defaultValue={[original.isolateCodeGroup] || ""}
              disabled
              className={"narrow"}
            ></input>
          ),
          customComparator
        ),
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "cytB",
        accessor: "cytB",
        Cell: NoConfirmCell,
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "16S",
        accessor: "16S",
        Cell: NoConfirmCell,
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "COI",
        accessor: "COI",
        Cell: NoConfirmCell,
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "COII",
        accessor: "COII",
        Cell: NoConfirmCell,
        Filter: Multi,
        filter: multiSelectFilter,
      },

      {
        Header: "ITS1",
        accessor: "ITS1",
        Cell: NoConfirmCell,
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "ITS2",
        accessor: "ITS2",
        Cell: NoConfirmCell,
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "ELAV",
        accessor: "ELAV",
        Cell: NoConfirmCell,
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

  const tableInstance = useTable(
    {
      columns,
      data: tableData,
      initialState: { hiddenColumns: ["localityCode"] },
      defaultColumn: { Cell: DefaultCell, Filter: () => {} },
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
  const rowsShow = full ? rows : rows.slice(0, 100);
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
        {isPopoverOpen && (
          <div className="popover">
            <div className="close" onClick={() => setIsPopoverOpen(false)}>
              x
            </div>
            {legend.map((i) => (
              <div key={i}>{i}</div>
            ))}
          </div>
        )}
      </div>
      <div className="controls">
        <div className="add-new">
          <input
            value={newColumn}
            onChange={(e) => setNewColumn(e.target.value)}
            placeholder="New column name"
          />
          <button onClick={() => addColumn(newColumn)}>Add</button>
        </div>
        <GlobalFilter
          preGlobalFilteredRows={preGlobalFilteredRows}
          globalFilter={state.globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
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
        {last?.rowKey && last.cellId !== "localityCode" && (
          <button className="revert" onClick={handleRevert}>
            Back
          </button>
        )}
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

export default PcrGenomicLoci;
