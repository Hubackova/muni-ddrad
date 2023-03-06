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
import { toast } from "react-toastify";
import {
  customComparator,
  customLocalityComparator,
  DateCell,
  EditableCell,
  SelectCell,
} from "../components/Cell";
import ConfirmModal from "../components/ConfirmModal";
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
  const [last, setLast] = useState(false);

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
              initialValue={parseFloat(value)}
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
        Header: "Locality code",
        accessor: "localityCode",
        Cell: React.memo<React.FC<any>>(
          ({ value: initialValue, row, cell, row: { original } }) => {
            const [showEditModal, setShowEditModal] = useState(null);
            const [value, setValue] = React.useState(
              original.localityCode
                ? {
                    value: original.localityCode,
                    label: original.localityCode,
                  }
                : null
            );
            const onChange = (value: any) => {
              setValue({
                value: value.value,
                label: value.value,
              });
              if (initialValue !== value.value) {
                setShowEditModal({
                  row,
                  newValue: value.value,
                  id: cell.column.id,
                  initialValue,
                  setValue: (value) =>
                    setValue({
                      value: value,
                      label: value,
                    }),
                  callback: () => {
                    editItem(original.key, value.value, "localityCode");
                    editItem(original.key, value.country || "", "country");
                    editItem(original.key, value.state || "", "state");
                    editItem(
                      original.key,
                      value.localityName || "",
                      "localityName"
                    );
                    editItem(original.key, value.latitude || "", "latitude");
                    editItem(original.key, value.longitude || "", "longitude");
                    editItem(original.key, value.altitude || "", "altitude");
                    editItem(original.key, value.habitat || "", "habitat");
                    editItem(
                      original.key,
                      value.dateCollection || "",
                      "dateCollection"
                    );
                    editItem(original.key, value.collector || "", "collector");
                    setLast({
                      rowKey: row.original.key,
                      cellId: cell.column.id,
                      initialValue,
                    });
                  },
                });
              }
            };

            return (
              <>
                <SelectInput
                  options={localityOptions}
                  value={value}
                  onChange={onChange}
                  isSearchable
                  className="narrow"
                />
                {showEditModal?.row.id === cell.row.id &&
                  showEditModal.id === cell.column.id && (
                    <ConfirmModal
                      title={`Do you want to change value from ${
                        showEditModal.initialValue || "<empty>"
                      } to ${showEditModal.newValue} ?`}
                      description="This change cannont be undone using the back button"
                      onConfirm={async () => {
                        await showEditModal.callback();
                        setShowEditModal(null);
                        toast.success("Field was edited successfully");
                      }}
                      onCancel={() => {
                        showEditModal.setValue(showEditModal.initialValue);
                      }}
                      onHide={() => setShowEditModal(null)}
                    />
                  )}
              </>
            );
          },
          customComparator
        ),
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
        Header: "Kit",
        accessor: "kit",
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
    ],
    [boxOptions, editItem, localityOptions]
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

  const tableInstance = useTable(
    {
      columns,
      data: tableData,
      defaultColumn: { Cell: DefaultCell, Filter: () => {} },
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
                  {row.cells.map((cell, index) => {
                    return (
                      <td
                        key={row.id + cell.column.id + index}
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

export default DnaExtractions;
