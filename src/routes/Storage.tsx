import { getDatabase, onValue, ref, remove, update } from "firebase/database";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTable, Column } from "react-table";
import * as yup from "yup";
import CreatableSelectInput from "../components/CreatableSelectInput";
import TextInput from "../components/TextInput";
import { writeStorageData } from "../firebase/firebase";
import { DnaExtractionsType, StorageType } from "../types";
import "./Table.scss";
import { yupResolver } from "@hookform/resolvers/yup";

const schema = yup
  .object({
    box: yup.string().required(),
    storageSite: yup.string().required(),
  })
  .required();

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
        storage.reduce((acc, cur) => Object.assign(acc, { [cur.storageSite]: cur }), {})
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
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  const addItem = (data: any) => {
    writeStorageData(data);
  };

  const {
    register,
    formState: { errors },
    handleSubmit,

    control,
  } = useForm<StorageType>({
    resolver: yupResolver(schema),
  });

  return (
    <>
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
                <th>List of samples in the box</th>
              </tr>
            ))
          }
        </thead>

        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            const samples = extractions.filter((i) => {
              console.log(i, row.original);
              return i.box === row.original.key;
            });
            console.log("samples", samples);
            return (
              /* @ts-ignore */
              <tr {...row.getRowProps()} key={row.original.key}>
                <td role="cell">
                  <button
                    onClick={
                      /* @ts-ignore */
                      () => removeItem(row.original.key)
                    }
                  >
                    X
                  </button>
                </td>
                {row.cells.map((cell) => {
                  return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
                })}
                <td>
                  {samples.map((sample) => (
                    <span className="sample">{sample.isolateCode}</span>
                  ))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <form className="form" onSubmit={handleSubmit(addItem)}>
        <div className="row">
          <TextInput label="Box name" name="box" error={errors.box?.message} register={register} />
          <Controller
            render={({ field: { onChange, value } }) => (
              <CreatableSelectInput
                options={storageOptions}
                value={value ? { value, label: value } : null}
                onChange={(e: any) => {
                  console.log(e);
                  onChange(e?.value);
                }}
                label="Storage site"
                error={errors.storageSite?.message}
                isSearchable
              />
            )}
            control={control}
            name="storageSite"
          />
        </div>
        <button className="submit-btn" type="submit">
          Save
        </button>
      </form>
    </>
  );
};

export default Storage;
