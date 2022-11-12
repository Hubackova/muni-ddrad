import { getDatabase, onValue, ref, remove, update } from "firebase/database";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Column, useTable } from "react-table";
import CreatableSelectInput from "../components/CreatableSelectInput";
import { DnaExtractionsType, StorageType } from "../types";
import "./Table.scss";

const Storage: React.FC = () => {
  const [storage, setStorage] = useState<StorageType[]>([]);
  const [extractions, setExtractions] = useState<DnaExtractionsType[]>([]);
  const db = getDatabase();

  useEffect(() => {
    onValue(ref(db, "storage/"), (snapshot) => {
      const items: any = [];
      snapshot.forEach((child) => {
        let childItem = child.val();
        childItem.key = child.key;
        items.push(childItem);
      });
      setStorage(items);
    });

    onValue(ref(db, "extractions/"), (snapshot) => {
      const items: DnaExtractionsType[] = [];
      snapshot.forEach((child) => {
        let childItem = child.val();
        childItem.key = child.key;
        items.push(childItem);
      });
      setExtractions(items);
    });
  }, [db]);

  const removeItem = (id: string) => {
    remove(ref(db, "storage/" + id));
  };

  const editItem = useCallback(
    (key: string, newValue: string, id: string) => {
      console.log(newValue, id);
      update(ref(db, "storage/" + key), {
        [id]: newValue,
      });
    },
    [db]
  );
  const storageOptions = useMemo(
    () =>
      Object.values(
        storage.reduce(
          (acc, cur) => Object.assign(acc, { [cur.storageSite]: cur }),
          {}
        )
      ).map((i: any) => ({
        value: i.storageSite,
        label: i.storageSite,
      })),
    [storage]
  );

  const columns: Column<any>[] = useMemo(
    () => [
      {
        Header: "Box name",
        accessor: "box",
        Cell: ({ row: { original } }) => (
          <input
            onChange={(e) => (original.box = e.target.value)}
            onBlur={(e) => editItem(original.key, e.target.value, "box")}
            defaultValue={[original.box] || ""}
          ></input>
        ),
      },
      {
        Header: "Storage site",
        accessor: "storageSite",
        Cell: ({ row: { original } }) => (
          <CreatableSelectInput
            options={storageOptions}
            value={
              original.storageSite
                ? { value: original.storageSite, label: original.storageSite }
                : null
            }
            onChange={(value: any) => {
              editItem(original.key, value.value, "storageSite");
            }}
            isSearchable
            className="narrow"
          />
        ),
      },
    ],
    [editItem, storageOptions]
  );

  const tableInstance = useTable({ columns, data: storage });
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  return (
    <table className="table" {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()}>{column.render("Header")}</th>
            ))}
            <th>List of samples in the box</th>
          </tr>
        ))}
      </thead>

      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          const samples = extractions.filter((i) => {
            return i.box === row.original.key;
          });
          return (
            <tr {...row.getRowProps()} key={row.original.key}>
              {row.cells.map((cell) => {
                return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
              })}
              <td className="sample-list">
                {samples.map((sample) => (
                  <span className="sample">{sample.isolateCode}</span>
                ))}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default Storage;
