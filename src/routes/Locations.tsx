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
import ConfirmModal from "../components/ConfirmModal";
import { GlobalFilter, Multi, multiSelectFilter } from "../components/Filter";
import IndeterminateCheckbox from "../components/IndeterminateCheckbox";
import { EXTRACTIONS } from "../constants";
import { getLocalityOptions } from "../helpers/getLocalityOptions";
import { ReactComponent as ExportIcon } from "../images/export.svg";

interface LocationsProps {
  extractions: DnaExtractionsType[];
}

const Locations: React.FC<LocationsProps> = ({ extractions }) => {
  const db = getDatabase();
  const localityOptions = useMemo(() => getLocalityOptions(extractions), []);
  const [full, setFull] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  console.log(extractions);
  const editItem = useCallback(
    (key: string, newValue: string, id: string) => {
      const groupItems = extractions.filter((i) => {
        return i.localityCode === key;
      });

      groupItems.forEach((i) =>
        update(ref(db, EXTRACTIONS + i.key), {
          [id]: newValue,
        })
      );
    },
    [db, extractions]
  );

  const customComparator = (prevProps, nextProps) => {
    return nextProps.value === prevProps.value;
  };

  const EditableCell = React.memo<React.FC<any>>(
    ({ value: initialValue, row, cell }) => {
      const [value, setValue] = React.useState(initialValue);
      const onChange = (e: any) => {
        setValue(e.target.value);
      };
      const onBlur = (e: any) => {
        if (initialValue != e.target.value) {
          setShowEditModal({
            row,
            newValue: e.target.value,
            id: cell.column.id,
            initialValue,
            setValue,
          });
        }
      };
      React.useEffect(() => {
        setValue(initialValue);
      }, [initialValue]);
      return <input value={value} onChange={onChange} onBlur={onBlur} />;
    },
    customComparator
  );

  const columns: Column<any>[] = useMemo(
    () => [
      {
        Header: "Locality code",
        accessor: "localityCode",
        Cell: React.memo<React.FC<any>>(
          ({ value: initialValue, row, cell }) => {
            const [value, setValue] = React.useState(initialValue);
            const onChange = (e: any) => {
              setValue(e.target.value);
            };
            return (
              <input
                onBlur={(e) => {
                  if (initialValue != e.target.value) {
                    const localityCodes = localityOptions.map((i) =>
                      i.value.toLowerCase()
                    );
                    if (localityCodes.includes(e.target.value.toLowerCase()))
                      return toast.error("Locality code already exists");
                    setShowEditModal({
                      row,
                      newValue: e.target.value,
                      id: cell.column.id,
                      initialValue,
                      setValue,
                    });
                  }
                }}
                onChange={onChange}
                value={value}
                className="semi-narrow"
              ></input>
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
        Cell: React.memo<React.FC<any>>(
          ({ value: initialValue, row, cell }) => {
            const [value, setValue] = React.useState(initialValue);
            const onChange = (e: any) => {
              setValue(e.target.value);
            };
            return (
              <input
                onBlur={(e) => {
                  if (initialValue != e.target.value) {
                    setShowEditModal({
                      row,
                      newValue: e.target.value,
                      id: cell.column.id,
                      initialValue,
                      setValue,
                    });
                  }
                }}
                onChange={onChange}
                value={value}
                className="semi-narrow"
              ></input>
            );
          },
          customComparator
        ),
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "State/province",
        accessor: "state",
        Cell: React.memo<React.FC<any>>(
          ({ value: initialValue, row, cell }) => {
            const [value, setValue] = React.useState(initialValue);
            const onChange = (e: any) => {
              setValue(e.target.value);
            };
            return (
              <input
                onBlur={(e) => {
                  if (initialValue != e.target.value) {
                    setShowEditModal({
                      row,
                      newValue: e.target.value,
                      id: cell.column.id,
                      initialValue,
                      setValue,
                    });
                  }
                }}
                onChange={onChange}
                value={value}
                className="semi-narrow"
              ></input>
            );
          },
          customComparator
        ),
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Latitude [°N]",
        accessor: "latitude",
        Cell: React.memo<React.FC<any>>(
          ({ value: initialValue, row, cell }) => {
            const [value, setValue] = React.useState(initialValue);
            const onChange = (e: any) => {
              setValue(e.target.value);
            };
            return (
              <input
                onBlur={(e) => {
                  if (initialValue != e.target.value) {
                    if (!/^-?\d*\.?\d{0,5}$/.test(value) && value !== "na") {
                      setValue(initialValue);
                      return toast.error("Invalid value");
                    }
                    setShowEditModal({
                      row,
                      newValue: e.target.value,
                      id: cell.column.id,
                      initialValue,
                      setValue,
                    });
                  }
                }}
                onChange={onChange}
                value={value}
                className="semi-narrow"
              ></input>
            );
          },
          customComparator
        ),
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Longitude [°E]",
        accessor: "longitude",
        Cell: React.memo<React.FC<any>>(
          ({ value: initialValue, row, cell }) => {
            const [value, setValue] = React.useState(initialValue);
            const onChange = (e: any) => {
              setValue(e.target.value);
            };
            return (
              <input
                onBlur={(e) => {
                  if (initialValue != e.target.value) {
                    if (!/^-?\d*\.?\d{0,5}$/.test(value) && value !== "na") {
                      setValue(initialValue);
                      return toast.error("Invalid value");
                    }
                    setShowEditModal({
                      row,
                      newValue: e.target.value,
                      id: cell.column.id,
                      initialValue,
                      setValue,
                    });
                  }
                }}
                onChange={onChange}
                value={value}
                className="semi-narrow"
              ></input>
            );
          },
          customComparator
        ),
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Altitude [m a.s.l.]",
        accessor: "altitude",
        Cell: React.memo<React.FC<any>>(
          ({ value: initialValue, row, cell }) => {
            const [value, setValue] = React.useState(initialValue);
            const onChange = (e: any) => {
              setValue(e.target.value);
            };
            return (
              <input
                onBlur={(e) => {
                  if (initialValue != e.target.value) {
                    if (!/^-?\d*\.?\d{0,5}$/.test(value) && value !== "na") {
                      setValue(initialValue);
                      return toast.error("Invalid value");
                    }
                    setShowEditModal({
                      row,
                      newValue: e.target.value,
                      id: cell.column.id,
                      initialValue,
                      setValue,
                    });
                  }
                }}
                onChange={onChange}
                value={value}
              ></input>
            );
          },
          customComparator
        ),
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Locality name",
        accessor: "localityName",
        Cell: React.memo<React.FC<any>>(
          ({ value: initialValue, row, cell }) => {
            const [value, setValue] = React.useState(initialValue);
            const onChange = (e: any) => {
              setValue(e.target.value);
            };
            return (
              <input
                onBlur={(e) => {
                  if (initialValue != e.target.value) {
                    setShowEditModal({
                      row,
                      newValue: e.target.value,
                      id: cell.column.id,
                      initialValue,
                      setValue,
                    });
                  }
                }}
                onChange={onChange}
                value={value}
                className="wide"
              ></input>
            );
          },
          customComparator
        ),
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Habitat",
        accessor: "habitat",
        Cell: React.memo<React.FC<any>>(
          ({ value: initialValue, row, cell }) => {
            const [value, setValue] = React.useState(initialValue);
            const onChange = (e: any) => {
              setValue(e.target.value);
            };
            return (
              <input
                onBlur={(e) => {
                  if (initialValue != e.target.value) {
                    setShowEditModal({
                      row,
                      newValue: e.target.value,
                      id: cell.column.id,
                      initialValue,
                      setValue,
                    });
                  }
                }}
                onChange={onChange}
                value={value}
              ></input>
            );
          },
          customComparator
        ),
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Note - Locality",
        accessor: "noteLocality",
        Filter: Multi,
        filter: multiSelectFilter,
      },
    ],
    [localityOptions]
  );

  const tableData = React.useMemo(
    () =>
      extractions
        .filter((ex) => !!ex.localityCode)
        .map((ex) => {
          return {
            localityCode: ex.localityCode,
            country: ex.country,
            latitude: ex.latitude,
            longitude: ex.longitude,
            state: ex.state,
            localityName: ex.localityName,
            habitat: ex.habitat,
            altitude: ex.altitude,
            noteLocality: ex.noteLocality,
            key: ex.key,
          };
        }),
    [extractions]
  );

  const reducedData = React.useMemo(
    () =>
      Object.values(
        tableData.reduce(
          (acc, cur) => Object.assign(acc, { [cur.localityCode]: cur }),
          {}
        )
      ),
    [tableData]
  );

  const tableInstance = useTable(
    {
      columns,
      data: reducedData,
      defaultColumn: { Cell: EditableCell, Filter: () => {} },
      autoResetFilters: false,
      initialState: {
        sortBy: [
          {
            id: "localityCode",
            desc: false,
          },
        ],
      },
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
          overflow: "auto",
        }}
      >
        <table className="table" {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup, index) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={index}>
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

                    {column.canFilter ? column.render("Filter") : null}
                  </th>
                ))}
                <th>IsolateCode with Loc.</th>
              </tr>
            ))}
          </thead>

          <tbody {...getTableBodyProps()}>
            {rowsShow.map((row) => {
              prepareRow(row);

              const groupItems = extractions.filter((i) => {
                return i.localityCode === row.original.localityCode;
              });

              return (
                <tr {...row.getRowProps()} key={row.id}>
                  {row.cells.map((cell) => {
                    return (
                      <React.Fragment key={cell.column.id + cell.row.id}>
                        {showEditModal?.row.id === cell.row.id &&
                          showEditModal.id === cell.column.id && (
                            <ConfirmModal
                              title={`Do you want to change value from ${
                                showEditModal.initialValue || "<empty>"
                              } to ${showEditModal.newValue} ?`}
                              description="The change will be made in all samples with the given locality code and cannot be undone using the back button"
                              onConfirm={() => {
                                setShowEditModal(null);
                                editItem(
                                  showEditModal.row.original.localityCode,
                                  showEditModal.newValue,
                                  showEditModal.id
                                );
                                toast.success("Field was edited successfully");
                              }}
                              onCancel={() => {
                                showEditModal.setValue(
                                  showEditModal.initialValue || ""
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
                      </React.Fragment>
                    );
                  })}
                  <td className="sample-list">
                    {groupItems.map((i) => (
                      <span key={i.isolateCode} className="sample">
                        {i.isolateCode}
                      </span>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="controls">
        <div className="download">
          <CSVLink
            data={selectedFlatRows.map((i) => i.values)}
            filename="db-ddrad.csv"
          >
            <div className="export">
              <ExportIcon />
              export CSV
            </div>
          </CSVLink>
        </div>
        <GlobalFilter
          preGlobalFilteredRows={preGlobalFilteredRows}
          globalFilter={state.globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
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

export default Locations;
