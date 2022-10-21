// @ts-nocheck

import { getDatabase, onValue, ref, remove, update } from "firebase/database";
import React, { useCallback, useEffect, useState } from "react";
import { useSortBy, useTable } from "react-table";
import { PrimersType } from "../types";
import TextInput from "../components/TextInput";
import { writePrimersData } from "../firebase/firebase";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import "./Table.scss";

const Primers: React.FC = () => {
  const [primers, setPrimers] = useState<PrimersType[]>([]);
  const db = getDatabase();

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
  }, [db]);

  const removeItem = (id: string) => {
    remove(ref(db, "primers/" + id));
  };

  const editItem = useCallback(
    (key: string, newValue: string, id: string) => {
      console.log(newValue, id);
      update(ref(db, "primers/" + key), {
        [id]: newValue,
      });
    },
    [db]
  );

  const schema = yup
    .object({
      name: yup.string().required(),
      sequence: yup.string().required(),
    })
    .required();

  const customColumns = React.useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Marker",
        accessor: "marker",
      },
      {
        Header: "Specificity",
        accessor: "specificity",
      },
      {
        Header: "Sequence",
        accessor: "sequence",
      },

      {
        Header: "Author",
        accessor: "author",
      },
      {
        Header: "Anneal T [°C]",
        accessor: "anneal",
      },
      {
        Header: "Length of PCR product",
        accessor: "lengthPCR",
      },
      {
        Header: "Work?",
        accessor: "work",
      },
      {
        Header: "Note on use",
        accessor: "noteOnUse",
      },
    ],
    []
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
    () => [...customColumns, ...getColumnsAccessor(primers)],
    [customColumns, primers, getColumnsAccessor]
  );

  const EditableCell: React.FC<any> = ({ value: initialValue, row, cell, column: { id } }) => {
    const [value, setValue] = React.useState(initialValue);
    const onChange = (e: any) => {
      setValue(e.target.value);
    };
    const onBlur = (e: any) => {
      if (e.target.value) editItem(row.original.key, e.target.value, cell.column.id);
    };
    React.useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);
    return <input value={value} onChange={onChange} onBlur={onBlur} />;
  };

  const defaultColumn = {
    Cell: EditableCell,
  };

  const tableInstance = useTable({ columns, data: primers, defaultColumn }, useSortBy);
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  const addItem = (data: any) => {
    writePrimersData(data);
  };

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<PrimersType>({
    resolver: yupResolver(schema),
  });

  return (
    <>
      <table className="table" {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              <th>Remove</th>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render("Header")}
                  {/* Add a sort direction indicator */}
                  <span>{column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}</span>
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

      <form className="form" onSubmit={handleSubmit(addItem)}>
        <div className="row">
          <TextInput label="Name" name="name" error={errors.name?.message} register={register} />
          <TextInput
            label="Country"
            name="country"
            error={errors.country?.message}
            register={register}
          />
        </div>
        <div className="row">
          <TextInput
            label="Marker"
            name="marker"
            error={errors.marker?.message}
            register={register}
          />
          <TextInput
            label="Specificity"
            name="specificity"
            error={errors.specificity?.message}
            register={register}
          />
        </div>
        <div className="row">
          <TextInput
            label="Sequence"
            name="sequence"
            error={errors.sequence?.message}
            register={register}
          />
          <TextInput
            label="Author"
            name="author"
            error={errors.author?.message}
            register={register}
          />
        </div>
        <div className="row">
          <TextInput
            label="Anneal T [°C]"
            name="anneal"
            error={errors.anneal?.message}
            register={register}
          />
          <TextInput
            label="Length of PCR product"
            name="lengthPCR"
            error={errors.lengthPCR?.message}
            register={register}
          />
        </div>
        <div className="row">
          <TextInput label="Work?" name="work" error={errors.work?.message} register={register} />
          <TextInput
            label="Note on use"
            name="noteOnUse"
            error={errors.noteOnUse?.message}
            register={register}
          />
        </div>
        <button className="submit-btn" type="submit">
          Save
        </button>
      </form>
    </>
  );
};

export default Primers;
