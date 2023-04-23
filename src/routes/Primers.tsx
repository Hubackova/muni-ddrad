// @ts-nocheck

import { getDatabase, onValue, ref, remove, update } from "firebase/database";
import React, { useCallback, useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import {
  useFilters,
  useGlobalFilter,
  useRowSelect,
  useSortBy,
  useTable,
} from "react-table";
import { toast } from "react-toastify";
import { EditableCell } from "../components/Cell";
import ConfirmModal from "../components/ConfirmModal";
import { GlobalFilter, Multi, multiSelectFilter } from "../components/Filter";
import IndeterminateCheckbox from "../components/IndeterminateCheckbox";
import { ReactComponent as ExportIcon } from "../images/export.svg";
import { PrimersType } from "../types";

const Primers: React.FC = () => {
  const [primers, setPrimers] = useState<PrimersType[]>([]);
  const [showModal, setShowModal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  const db = getDatabase();
  const [last, setLast] = useState(false);
  useEffect(() => {
    onValue(ref(db, "primers/"), (snapshot) => {
      const items: any = [];
      snapshot.forEach((child) => {
        let childItem = child.val();
        childItem.key = child.key;
        items.push(childItem);
      });
      setPrimers(items);
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setShowModal(id);
  }, []);

  const customComparator = (prevProps, nextProps) => {
    return nextProps.value === prevProps.value;
  };

  const handleRevert = () => {
    update(ref(db, "primers/" + last.rowKey), {
      [last.cellId]: last.initialValue,
    });
    last.setValue &&
      last.setValue({ value: last.initialValue, label: last.initialValue });
    setLast(false);
  };

  const DefaultCell = React.memo<React.FC<any>>(
    ({ value, row, cell }) => (
      <EditableCell
        initialValue={value}
        row={row}
        cell={cell}
        dbName="primers/"
        saveLast={setLast}
      />
    ),
    customComparator
  );

  const columns = React.useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Marker",
        accessor: "marker",
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Specificity",
        accessor: "specificity",
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Sequence",
        accessor: "sequence",
        Filter: Multi,
        filter: multiSelectFilter,
      },

      {
        Header: "Author",
        accessor: "author",
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Anneal T [°C]",
        accessor: "anneal",
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Length of PCR product",
        accessor: "lengthPCR",
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Work?",
        accessor: "work",
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Note on use",
        accessor: "noteOnUse",
        Filter: Multi,
        filter: multiSelectFilter,
      },
    ],
    []
  );

  const tableInstance = useTable(
    {
      columns,
      data: primers,
      defaultColumn: { Cell: DefaultCell, Filter: () => {} },
      autoResetFilters: false,
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
          Cell: React.memo<React.FC<any>>(
            ({ row }) => (
              <div>
                <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
              </div>
            ),
            customComparator
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
      <div
        className="table-container"
        style={{
          height: `80vh`,
          overflow: "auto",
        }}
      >
        {showModal && (
          <ConfirmModal
            title="Do you want to continue?"
            onConfirm={() => {
              setShowModal(null);
              remove(ref(db, "primers/" + showModal));
              toast.success("Primer was removed successfully");
            }}
            onHide={() => setShowModal(null)}
          />
        )}
        <table className="table pcr" {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup, index) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={index}>
                <th></th>
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
              </tr>
            ))}
          </thead>

          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} key={row.original.key}>
                  <td role="cell" className="remove">
                    <button onClick={() => removeItem(row.original.key)}>
                      X
                    </button>
                  </td>
                  {row.cells.map((cell) => {
                    return (
                      <>
                        {showEditModal?.row.id === cell.row.id &&
                          showEditModal.id === cell.column.id && (
                            <ConfirmModal
                              title={`Do you want to change value from ${
                                showEditModal.initialValue || "<empty>"
                              } to ${showEditModal.newValue} ?`}
                              onConfirm={() => {
                                setShowEditModal(null);
                                update(
                                  ref(
                                    db,
                                    "primers/" + showEditModal.row.original.key
                                  ),
                                  {
                                    [showEditModal.id]: showEditModal.newValue,
                                  }
                                );
                                showEditModal.setValue(showEditModal.newValue);
                                toast.success("Field was edited successfully");
                              }}
                              onCancel={() => {
                                showEditModal.setValue(
                                  showEditModal.initialValue
                                );
                              }}
                              onHide={() => setShowEditModal(null)}
                            />
                          )}
                        <td
                          key={row.id + cell.column.id}
                          {...cell.getCellProps()}
                        >
                          {cell.render("Cell")}
                        </td>
                      </>
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
            filename="primers.csv"
          >
            <div className="export">
              <ExportIcon />
              export CSV
            </div>
          </CSVLink>
        </div>
        {last?.rowKey && last.cellId !== "localityCode" && (
          <button className="revert" onClick={handleRevert}>
            Back
          </button>
        )}
      </div>
    </>
  );
};

export default Primers;
