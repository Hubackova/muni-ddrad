// @ts-nocheck
import { CSVLink } from "react-csv";
import { getDatabase, onValue, ref, set, update } from "firebase/database";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useSortBy, useTable, useRowSelect } from "react-table";
import { DnaExtractionsType, LocationType, StorageType } from "../types";
import SelectInput from "../components/SelectInput";
import DropzonePcrGenomic from "../components/DropzonePcrGenomic";
import { ReactComponent as ExportIcon } from "../images/export.svg";
import "./Table.scss";

const IndeterminateCheckbox = React.forwardRef(({ indeterminate, ...rest }, ref) => {
  const defaultRef = React.useRef();
  const resolvedRef = ref || defaultRef;

  React.useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);

  return (
    <>
      <input type="checkbox" ref={resolvedRef} {...rest} />
    </>
  );
});

const PcrGenomicLoci: React.FC = () => {
  const [extractions, setExtractions] = useState<DnaExtractionsType[]>([]);
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [storage, setStorage] = useState<StorageType[]>([]);
  const [newColumn, setNewColumn] = useState("");
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
    onValue(ref(db, "locations/"), (snapshot) => {
      const items: any = [];
      snapshot.forEach((child) => {
        let childItem = child.val();
        childItem.key = child.key;
        items.push(childItem);
      });
      setLocations(items);
    });
  }, [db]);

  const tableData = React.useMemo(
    () =>
      extractions.map((ex) => {
        const { kit, localityCode, speciesUpdated, ...data } = ex;
        const location = locations.find((i) => i.key === ex.localityCode);
        const storageData = storage.find((i) => i.key === ex.box);
        return {
          ...data,
          country: location?.country,
          state: location?.state,
          localityName: location?.localityName,
          box: storageData?.box,
          storageSite: storageData?.storageSite,
        };
      }),
    [extractions, locations, storage]
  );

  const importData = (data) => {
    setExtractions(data);
    data.map((row) => {
      console.log(row);
      return set(ref(db, "extractions/" + row.key), {
        ...row,
      });
    });
  };

  const addColumn = (name) => {
    const obj = tableData?.length ? tableData[0] : null;
    if (!obj) return null;
    update(ref(db, "extractions/" + obj.key), {
      [name]: "",
    });
  };

  const editItem = useCallback(
    (key: string, newValue: string, id: string) => {
      console.log(newValue, id);
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
          <input
            onChange={(e) => (original.isolateCode = e.target.value)}
            onBlur={(e) => editItem(original.key, e.target.value, "isolateCode")}
            defaultValue={[original.isolateCode] || ""}
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
            onBlur={(e) => editItem(original.key, e.target.value, "dateIsolation")}
            defaultValue={[original.dateIsolation] || ""}
          ></input>
        ),
      },
      {
        Header: "ng/ul",
        accessor: "ngul",
        Cell: ({ row: { original } }) => (
          <input
            onChange={(e) => (original.ngul = e.target.value)}
            onBlur={(e) => editItem(original.key, e.target.value, "ngul")}
            defaultValue={[original.ngul] || ""}
          ></input>
        ),
      },
      {
        Header: "Box name",
        accessor: "box",
        Cell: ({ row: { original } }) => (
          <SelectInput
            options={boxOptions}
            value={original.box ? { value: original.box, label: original.box } : null}
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
        Cell: ({ row: { original } }) => <span>{original.country}</span>,
      },
      {
        Header: "State/province",
        accessor: "state",
        Cell: ({ row: { original } }) => <span>{original.state}</span>,
      },
      {
        Header: "Locality name",
        accessor: "localityName",
        Cell: ({ row: { original } }) => <span>{original.localityName}</span>,
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
    [boxOptions, editItem]
  );

  const getColumnsAccessor = useCallback(
    (fbData) => {
      if (!fbData || !fbData.length) return [];
      const customKeys = customColumns.map((i) => i.accessor);
      const fbKeys = Object.keys(fbData[0]);

      return fbKeys
        .map((i) => {
          if (customKeys.includes(i)) return null;
          return {
            Header: i,
            accessor: i,
          };
        })
        .filter((i) => i && i.accessor !== "key");
    },
    [customColumns]
  );

  const columns = React.useMemo(
    () => [...customColumns, ...getColumnsAccessor(tableData)],
    [customColumns, tableData, getColumnsAccessor]
  );
  // Create an editable cell renderer
  const EditableCell: React.FC<any> = ({ value: initialValue, row, cell, column: { id } }) => {
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue);

    const onChange = (e: any) => {
      setValue(e.target.value);
    };

    // We'll only update the external data when the input is blurred
    const onBlur = (e: any) => {
      if (e.target.value) editItem(row.original.key, e.target.value, cell.column.id);
    };

    // If the initialValue is changed external, sync it up with our state
    React.useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    return <input value={value} onChange={onChange} onBlur={onBlur} />;
  };

  // Set our editable cell renderer as the default Cell renderer
  const defaultColumn = {
    Cell: EditableCell,
  };

  const tableInstance = useTable(
    { columns, data: tableData, defaultColumn },
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
  const { getTableProps, getTableBodyProps, headerGroups, rows, selectedFlatRows, prepareRow } =
    tableInstance;

  return (
    <>
      <table className="table" {...getTableProps()}>
        <thead>
          {
            // Loop over the header rows
            headerGroups.map((headerGroup) => (
              // Apply the header row props
              <tr {...headerGroup.getHeaderGroupProps()}>
                {
                  // Loop over the headers in each row
                  headerGroup.headers.map((column) => (
                    // Apply the header cell props

                    <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                      {column.render("Header")}
                      {/* Add a sort direction indicator */}
                      <span>{column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}</span>
                    </th>
                  ))
                }
              </tr>
            ))
          }
        </thead>

        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} key={row.original.key}>
                {row.cells.map((cell) => {
                  return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="add-new">
        <input value={newColumn} onChange={(e) => setNewColumn(e.target.value)} />
        <button onClick={() => addColumn(newColumn)}>Add new column</button>
      </div>
      <div className="download">
        <CSVLink data={selectedFlatRows.map((d) => d.original)}>
          <div className="export">
            <ExportIcon />
            export CSV
          </div>
        </CSVLink>
        <DropzonePcrGenomic importData={importData} />
      </div>
    </>
  );
};

export default PcrGenomicLoci;
