import { getDatabase, onValue, ref, remove, update } from "firebase/database";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useTable, Column } from "react-table";
import { DnaExtractionsType, LocationType, StorageType } from "../types";
import SelectInput from "../components/SelectInput";
import "./Table.scss";

const DnaExtractions: React.FC = () => {
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [storage, setStorage] = useState<StorageType[]>([]);
  const [extractions, setExtractions] = useState<DnaExtractionsType[]>([]);
  const db = getDatabase();

  useEffect(() => {
    onValue(ref(db, "extractions/"), (snapshot) => {
      const items: DnaExtractionsType[] = [];
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

  const removeItem = (id: string) => {
    remove(ref(db, "extractions/" + id));
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

  const localityOptions = useMemo(
    () =>
      locations.map((i) => ({
        value: i.key,
        label: i.localityCode,
        country: i.country,
        state: i.state,
        localityName: i.localityName,
      })),
    [locations]
  );
  const columns: Column<any>[] = useMemo(
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
      },
      {
        Header: "Species, updated name",
        accessor: "speciesUpdated",
        Cell: ({ row: { original } }) => (
          <input
            onChange={(e) => (original.speciesUpdated = e.target.value)}
            onBlur={(e) => editItem(original.key, e.target.value, "speciesUpdated")}
            defaultValue={[original.speciesUpdated] || ""}
          ></input>
        ),
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
      },
      {
        Header: "Locality code",
        accessor: "localityCode",
        Cell: ({ row: { original } }) => (
          <SelectInput
            options={localityOptions}
            value={
              original.localityCode
                ? { value: original.localityCode, label: original.localityCode }
                : null
            }
            onChange={(value: any) => {
              editItem(original.key, value.value, "localityCode");
            }}
            isSearchable
            className="narrow"
          />
        ),
      },
      {
        Header: "Country",
        accessor: "country",
      },
      {
        Header: "State/province",
        accessor: "state",
      },
      {
        Header: "Kit",
        accessor: "kit",
        Cell: ({ row: { original } }) => (
          <input
            onChange={(e) => (original.kit = e.target.value)}
            onBlur={(e) => editItem(original.key, e.target.value, "kit")}
            defaultValue={[original.kit] || ""}
          ></input>
        ),
      },

      {
        Header: "Locality name",
        accessor: "localityName",
      },
    ],
    [boxOptions, editItem, localityOptions]
  );

  const tableData = extractions.map((ex) => {
    const location = locations.find((i) => i.key === ex.localityCode);
    const storageData = storage.find((i) => i.key === ex.box);
    return {
      ...ex,
      localityCode: location?.localityCode,
      country: location?.country,
      state: location?.state,
      localityName: location?.localityName,
      box: storageData?.box,
      storageSite: storageData?.storageSite,
    };
  });

  const defaultColumn = {
    Cell: ({ value: initialValue }: any) => {
      return <span>{initialValue}</span>;
    },
  };

  const tableInstance = useTable({ columns, data: tableData, defaultColumn });
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;
  return (
    <table className="table" {...getTableProps()}>
      <thead>
        {
          // Loop over the header rows
          headerGroups.map((headerGroup) => (
            // Apply the header row props
            <tr {...headerGroup.getHeaderGroupProps()}>
              <th>Remove</th>
              {
                // Loop over the headers in each row
                headerGroup.headers.map((column) => (
                  // Apply the header cell props
                  <th {...column.getHeaderProps()}>
                    {
                      // Render the header
                      column.render("Header")
                    }
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
              <td role="cell">
                <button onClick={() => removeItem(row.original.key)}>X</button>
              </td>
              {row.cells.map((cell) => {
                return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default DnaExtractions;
