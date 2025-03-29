// @ts-nocheck
import { getDatabase, ref, update, remove } from "firebase/database";
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
import {
  DateCell,
  EditableCell,
  EditableNoConfirmCell,
  SelectCell,
  customComparator,
  customLocalityComparator,
} from "../components/Cell";
import ConfirmModal from "../components/ConfirmModal";
import CreatableSelectInput from "../components/CreatableSelectInput";
import { GlobalFilter, Multi, multiSelectFilter } from "../components/Filter";
import IndeterminateCheckbox from "../components/IndeterminateCheckbox";
import { EXTRACTIONS } from "../constants";
import { getLocalityOptions } from "../helpers/getLocalityOptions";
import { ReactComponent as ExportIcon } from "../images/export.svg";
import { getOptions } from "../components/NewSampleForm";
import { toast } from "react-toastify";

interface DnaExtractionsProps {
  storage: StorageType[];
  extractions: DnaExtractionsType[];
}

const All: React.FC<DnaExtractionsProps> = ({ storage, extractions }) => {
  const db = getDatabase();
  const localityOptions = useMemo(() => getLocalityOptions(extractions), []);
  const [full, setFull] = useState(false);
  const [last, setLast] = useState(false);
  const [showModal, setShowModal] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(null);
  const [selectedItem, setSelectedItem] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(null);

  const editItem = useCallback(
    (key: string, newValue: string, id: string) => {
      update(ref(db, EXTRACTIONS + key), {
        [id]: newValue,
      });
    },
    [db]
  );
  const boxOptions = useMemo(
    () =>
      storage
        .map((i) => ({
          value: i.key,
          label: i.box,
          storageSite: i.storageSite,
        }))
        .sort(function (a, b) {
          if (a.label < b.label) {
            return -1;
          }
          if (a.label > b.label) {
            return 1;
          }
          return 0;
        }),
    [storage]
  );

  const boxOptionsWithEmpty = useMemo(
    () => [{ value: "", label: "-- empty --", storageSite: "" }, ...boxOptions],
    [boxOptions]
  );

  const organismOptionsAll = [
    { value: "plant", label: "plant" },
    { value: "snail", label: "snail" },
    { value: "moss", label: "moss" },
    { value: "", label: "-- empty --" },
    ...getOptions(extractions, "organism"),
  ];

  const organismOptions = Array.from(
    new Map(organismOptionsAll.map((item) => [item.value, item])).values()
  );

  const handleRevert = () => {
    update(ref(db, EXTRACTIONS + last.rowKey), {
      [last.cellId]: last.initialValue,
    });
    last.setValue &&
      last.setValue({ value: last.initialValue, label: last.initialValue });
    setLast(false);
  };

  const removeItem = useCallback((id: string) => {
    setShowModal(id);
  }, []);

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

  const customColumns: Column<any>[] = useMemo(
    () => [
      {
        Header: "Isolate code",
        accessor: "isolateCode",
        Cell: React.memo<React.FC<any>>(
          ({ row: { original } }) => (
            <input
              defaultValue={[original.isolateCode] || ""}
              disabled
              className="narrow"
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
        Header: "Organism",
        accessor: "organism",
        Cell: ({ value, row, cell }) => {
          const organismData = organismOptions.find((i) => i.box === value);
          return (
            <SelectCell
              initialValue={value}
              initialKey={organismData?.key}
              row={row}
              cell={cell}
              options={organismOptions}
              saveLast={setLast}
            />
          );
        },
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Voucher",
        accessor: "voucher",
        Cell: NoConfirmCell,
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
        Header: "Pre_ng/ul DNA",
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
        Header: "Quib_ng/ul DNA",
        accessor: "quibngul",
        Cell: NoConfirmCell,
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Gel",
        accessor: "gel",
        Cell: NoConfirmCell,
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Purification",
        accessor: "purification",
        Cell: NoConfirmCell,
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Post_ng/ul DNA",
        accessor: "postngul",
        Cell: NoConfirmCell,
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "P1",
        accessor: "p1",
        Cell: NoConfirmCell,
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "P2",
        accessor: "p2",
        Cell: NoConfirmCell,
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "RAD_library",
        accessor: "radlibrary",
        Cell: NoConfirmCell,
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Reads_no",
        accessor: "readsno",
        Cell: NoConfirmCell,
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "ddRAD_note",
        accessor: "ddradNote",
        Cell: NoConfirmCell,
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
              options={boxOptionsWithEmpty}
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
        Header: "Kit",
        accessor: "kit",
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
                <CreatableSelectInput
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
        Header: "Latitude [°N]",
        accessor: "latitude",
        Cell: LocalityCell,
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Longitude [°E]",
        accessor: "longitude",
        Cell: LocalityCell,
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Altitude [m a.s.l.]",
        accessor: "altitude",
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
        Header: "Habitat",
        accessor: "habitat",
        Cell: LocalityCell,
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Date collection",
        accessor: "dateCollection",
        Cell: LocalityCell,
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Collector",
        accessor: "collector",
        Cell: LocalityCell,
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Note_sample",
        accessor: "note",
        Filter: Multi,
        filter: multiSelectFilter,
      },
    ],
    [boxOptions, editItem, localityOptions]
  );

  const customColumns2: Column<any>[] = useMemo(
    () => [
      {
        Header: "Note_isolate",
        accessor: "noteIsolate",
        Cell: NoConfirmCell,
        Filter: Multi,
        filter: multiSelectFilter,
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: NoConfirmCell,
        Filter: Multi,
        filter: multiSelectFilter,
      },
    ],
    []
  );

  const removeIsolateFromGroup = (isolateCode) => {
    const group = extractions.filter(
      (i) => i.isolateCodeGroup && i.isolateCodeGroup.includes(isolateCode)
    );

    const removedItem = extractions.find((i) => i.isolateCode === isolateCode);

    group.forEach((groupItem) =>
      update(ref(db, EXTRACTIONS + groupItem.key), {
        isolateCodeGroup: groupItem.isolateCodeGroup.filter(
          (i) => i !== isolateCode
        ),
      })
    );

    update(ref(db, EXTRACTIONS + removedItem.key), {
      isolateCodeGroup: "",
    });
  };

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

  const columns = React.useMemo(
    () => [...customColumns, ...customColumns2],
    [customColumns, customColumns2]
  );

  const tableInstance = useTable(
    {
      columns,
      data: tableData,
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

  const handleIsolateClick = (selectedItemAttr) => {
    setSelectedItem(selectedItemAttr);
  };

  const handleIsolateCodeClick = (selectedItem, isolateCodeItem) => {
    let newIsolateCodeGroup = [
      selectedItem.isolateCode,
      isolateCodeItem.isolateCode,
    ];
    if (!!isolateCodeItem?.isolateCodeGroup?.length) {
      newIsolateCodeGroup.push(...isolateCodeItem?.isolateCodeGroup);
    }
    if (!!selectedItem?.isolateCodeGroup?.length) {
      newIsolateCodeGroup.push(...selectedItem?.isolateCodeGroup);
    }

    const newIsolateCodeGroupUnique = newIsolateCodeGroup
      ? [...new Set(newIsolateCodeGroup)]
      : "";

    const groupKeys = extractions
      .filter((i) => newIsolateCodeGroupUnique.includes(i.isolateCode))
      .map((i) => i.key);

    groupKeys.forEach((groupKey) =>
      update(ref(db, EXTRACTIONS + groupKey), {
        isolateCodeGroup: newIsolateCodeGroupUnique,
      })
    );
    setSelectedItem(false);
  };

  const codeItems = !selectedItem
    ? []
    : Object.values(
        /* todo, razeni az nakonec */
        extractions.reduce(
          (acc, cur) => Object.assign(acc, { [cur.isolateCode]: cur }),
          {}
        )
      )
        .sort((a: any, b: any) => a.isolateCode?.localeCompare(b.isolateCode))
        .map((extractionItem: any, index) => {
          /* todo:not neccessary */
          const currentItem = extractions.find(
            (extraction) => extraction.key === selectedItem.key
          );
          if (
            (currentItem?.isolateCodeGroup &&
              currentItem?.isolateCodeGroup.includes(
                extractionItem.isolateCode
              )) ||
            currentItem?.isolateCode === extractionItem.isolateCode ||
            currentItem?.country !== extractionItem.country ||
            currentItem?.latitude !== extractionItem.latitude ||
            currentItem?.longitude !== extractionItem.longitude ||
            currentItem?.state !== extractionItem.state ||
            currentItem?.localityName !== extractionItem.localityName ||
            currentItem?.dateCollection !== extractionItem.dateCollection ||
            currentItem?.collector !== extractionItem.collector ||
            currentItem?.habitat !== extractionItem.habitat ||
            currentItem?.speciesOrig !== extractionItem.speciesOrig ||
            currentItem?.altitude !== extractionItem.altitude
          )
            return null;

          return (
            <div
              key={index}
              className="item"
              onClick={() => setShowGroupModal({ currentItem, extractionItem })}
            >
              {extractionItem.isolateCode}
            </div>
          );
        });

  return (
    <>
      {selectedItem && (
        <div className="side-panel">
          <div className="body">
            <h5>Isolate codes</h5>
            <div className="items">{codeItems}</div>

            <button
              className="btn cancel-btn"
              type="button"
              onClick={() => setSelectedItem(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div
        className="table-container"
        style={{
          height: `80vh`,
          overflow: "auto",
        }}
      >
        {showRemoveModal && (
          <ConfirmModal
            title={`Do you want to continue? ${showRemoveModal} will be removed from group`}
            onConfirm={() => {
              removeIsolateFromGroup(showRemoveModal);
              toast.success("Remove was successful");
              setShowRemoveModal(null);
            }}
            onHide={() => setShowRemoveModal(null)}
          />
        )}
        {showGroupModal && (
          <ConfirmModal
            title="Do you want to continue?"
            description={`Do you want to add ${showGroupModal.extractionItem.isolateCode} to ${showGroupModal.currentItem.isolateCode}?`}
            onConfirm={() => {
              handleIsolateCodeClick(
                showGroupModal.currentItem,
                showGroupModal.extractionItem
              );
              setShowGroupModal(null);
              toast.success("Group was modified successfully");
            }}
            onHide={() => setShowGroupModal(null)}
          />
        )}
        {showModal && (
          <ConfirmModal
            title="Do you really want to delete the sample?"
            onConfirm={() => {
              setShowModal(null);
              remove(ref(db, EXTRACTIONS + showModal));
              const currentItem = extractions.find((i) => i.key === showModal);
              const group = extractions.filter(
                (i) =>
                  i.isolateCodeGroup &&
                  i.isolateCodeGroup.includes(i.isolateCode) &&
                  i.key !== showModal
              );

              group.forEach((group) =>
                update(ref(db, EXTRACTIONS + group.key), {
                  isolateCodeGroup: group.isolateCodeGroup.filter(
                    (i) => i !== currentItem.isolateCode
                  ),
                })
              );
              toast.success("Sample was removed successfully");
            }}
            onHide={() => setShowModal(null)}
          />
        )}
        <table className="table ddrad" {...getTableProps()}>
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

                    {column.canFilter ? column.render("Filter") : null}
                  </th>
                ))}
                <th>Isolate group</th>
              </tr>
            ))}
          </thead>

          <tbody {...getTableBodyProps()}>
            {rowsShow.map((row) => {
              prepareRow(row);

              const isolateCodeGroup = row.original.isolateCodeGroup
                ? row.original.isolateCodeGroup.map((i) => i)
                : [];

              return (
                <tr {...row.getRowProps()} key={row.original.key}>
                  <td role="cell" className="remove">
                    <button onClick={() => removeItem(row.original.key)}>
                      X
                    </button>
                  </td>
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
                  <td className="sample-list">
                    {isolateCodeGroup.length > 1 &&
                      isolateCodeGroup.map((isolateCode) => (
                        <span key={isolateCode} className="sample">
                          {isolateCode}

                          <button
                            onClick={() => setShowRemoveModal(isolateCode)}
                          >
                            X
                          </button>
                        </span>
                      ))}
                    <span
                      className="sample add"
                      onClick={() => handleIsolateClick(row.original)}
                    >
                      + Add
                    </span>
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
            filename="db-mollusca-all.csv"
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

export default All;
