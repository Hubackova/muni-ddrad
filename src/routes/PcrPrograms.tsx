// @ts-nocheck

import { getDatabase, onValue, ref, remove, update } from "firebase/database";
import React, { useCallback, useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { useRowSelect, useSortBy, useTable } from "react-table";
import { toast } from "react-toastify";
import ConfirmModal from "../components/ConfirmModal";
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
      },
      {
        Header: "Initial Denaturation",
        accessor: "initialDenaturation",
      },
      {
        Header: "Denaturation",
        accessor: "denaturation",
      },
      {
        Header: "Annealing",
        accessor: "annealing",
      },
      {
        Header: "Extension",
        accessor: "extension",
      },
      {
        Header: "Number of cycles",
        accessor: "numberCycles",
      },
      {
        Header: "Final Extension",
        accessor: "finalExtension",
      },
      {
        Header: "End (forever)",
        accessor: "end",
      },
      {
        Header: "PCR Product Size",
        accessor: "pcrProductSize",
      },
      {
        Header: "Note",
        accessor: "note",
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

  const defaultColumn = {
    Cell: EditableCell,
  };

  const tableInstance = useTable(
    { columns, data: pcrPrograms, defaultColumn },
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
    rows,
    prepareRow,
    selectedFlatRows,
  } = tableInstance;

  return (
    <>
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
      <table className="table" {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              <th>Remove</th>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render("Header")}
                  {/* Add a sort direction indicator */}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? " 🔽"
                        : " 🔼"
                      : ""}
                  </span>
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
                <td role="cell">
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

export default PcrPrograms;
