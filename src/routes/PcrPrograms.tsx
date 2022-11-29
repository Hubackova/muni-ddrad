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
import ConfirmModal from "../components/ConfirmModal";
import {
  DefaultFilterForColumn,
  GlobalFilter,
  multiSelectFilter,
  SelectColumnFilter,
} from "../components/Filter";
import IndeterminateCheckbox from "../components/IndeterminateCheckbox";
import { ReactComponent as ExportIcon } from "../images/export.svg";
import { PcrProgramsType } from "../types";
import "./Table.scss";

const PcrPrograms: React.FC = () => {
  const [pcrPrograms, setPcrPrograms] = useState<PcrProgramsType[]>([]);
  const db = getDatabase();
  const [showModal, setShowModal] = useState(null);

  useEffect(() => {
    onValue(ref(db, "pcrPrograms/"), (snapshot) => {
      const items: any = [];
      snapshot.forEach((child) => {
        let childItem = child.val();
        childItem.key = child.key;
        items.push(childItem);
      });
      setPcrPrograms(items);
    });
  }, [db]);

  const removeItem = (id: string) => {
    setShowModal(id);
  };

  const editItem = useCallback(
    (key: string, newValue: string, id: string) => {
      update(ref(db, "pcrPrograms/" + key), {
        [id]: newValue,
      });
    },
    [db]
  );

  const columns = React.useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
        Filter: DefaultFilterForColumn,
      },
      {
        Header: "Initial Denaturation",
        accessor: "initialDenaturation",
        Filter: SelectColumnFilter,
        filter: multiSelectFilter,
      },
      {
        Header: "Denaturation",
        accessor: "denaturation",
        Filter: SelectColumnFilter,
        filter: multiSelectFilter,
      },
      {
        Header: "Annealing",
        accessor: "annealing",
        Filter: SelectColumnFilter,
        filter: multiSelectFilter,
      },
      {
        Header: "Extension",
        accessor: "extension",
        Filter: SelectColumnFilter,
        filter: multiSelectFilter,
      },
      {
        Header: "Number of cycles",
        accessor: "numberCycles",
        Filter: SelectColumnFilter,
        filter: multiSelectFilter,
      },
      {
        Header: "Final Extension",
        accessor: "finalExtension",
        Filter: SelectColumnFilter,
        filter: multiSelectFilter,
      },
      {
        Header: "End (forever)",
        accessor: "end",
        Filter: SelectColumnFilter,
        filter: multiSelectFilter,
      },
      {
        Header: "PCR Product Size",
        accessor: "pcrProductSize",
        Filter: SelectColumnFilter,
        filter: multiSelectFilter,
      },
      {
        Header: "Note",
        accessor: "note",
        Filter: DefaultFilterForColumn,
      },
    ],
    []
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
      data: pcrPrograms,
      defaultColumn: { Cell: EditableCell, Filter: () => {} },
    },
    useGlobalFilter,
    useFilters,
    useSortBy,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        // Let's make a column for selection
        {
          id: "selection",
          // The header can use the table's getToggleAllRowsSelectedProps method
          // to render a checkbox
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <div>
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            </div>
          ),
          // The cell can use the individual row's getToggleRowSelectedProps method
          // to the render a checkbox
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
        {showModal && (
          <ConfirmModal
            title="Do you want to continue?"
            onConfirm={() => {
              setShowModal(null);
              remove(ref(db, "pcrPrograms/" + showModal));
              toast.success("Program was removed successfully");
            }}
            onHide={() => setShowModal(null)}
          />
        )}
        <table className="table pcr" {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                <th></th>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
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
                      <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
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
      </div>
      <div className="download">
        <CSVLink
          data={selectedFlatRows.map((i) => i.values)}
          filename="pcr-programs.csv"
        >
          <div className="export">
            <ExportIcon />
            export CSV
          </div>
        </CSVLink>
      </div>
    </>
  );
};

export default PcrPrograms;
