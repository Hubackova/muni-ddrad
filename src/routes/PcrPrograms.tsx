// @ts-nocheck

import { getDatabase, onValue, ref, remove, update } from "firebase/database";
import React, { useCallback, useEffect, useState } from "react";
import { useSortBy, useTable } from "react-table";
import { PcrProgramsType } from "../types";
import TextInput from "../components/TextInput";
import { writePcrProgramsData } from "../firebase/firebase";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import "./Table.scss";

const PcrPrograms: React.FC = () => {
  const [pcrPrograms, setPcrPrograms] = useState<PcrProgramsType[]>([]);
  const db = getDatabase();

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
    remove(ref(db, "pcrPrograms/" + id));
  };

  const editItem = useCallback(
    (key: string, newValue: string, id: string) => {
      console.log(newValue, id);
      update(ref(db, "pcrPrograms/" + key), {
        [id]: newValue,
      });
    },
    [db]
  );

  const schema = yup
    .object({
      name: yup.string().required(),
      initialDenaturation: yup.string().required(),
      denaturation: yup.string().required(),
      annealing: yup.string().required(),
      extension: yup.string().required(),
      numberCycles: yup.string().required(),
      finalExtension: yup.string().required(),
      end: yup.string().required(),
    })
    .required();

  const customColumns = React.useMemo(
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
    () => [...customColumns, ...getColumnsAccessor(pcrPrograms)],
    [customColumns, pcrPrograms, getColumnsAccessor]
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

  const tableInstance = useTable({ columns, data: pcrPrograms, defaultColumn }, useSortBy);
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  const addItem = (data: any) => {
    writePcrProgramsData(data);
  };

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<PcrProgramsType>({
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
            label="Initial Denaturation"
            name="initialDenaturation"
            error={errors.initialDenaturation?.message}
            register={register}
          />
        </div>
        <div className="row">
          <TextInput
            label="Denaturation"
            name="denaturation"
            error={errors.denaturation?.message}
            register={register}
          />
          <TextInput
            label="Annealing"
            name="annealing"
            error={errors.annealing?.message}
            register={register}
          />
        </div>
        <div className="row">
          <TextInput
            label="Extension"
            name="extension"
            error={errors.extension?.message}
            register={register}
          />
          <TextInput
            label="Number of cycles"
            name="numberCycles"
            error={errors.numberCycles?.message}
            register={register}
          />
        </div>
        <div className="row">
          <TextInput
            label="Final Extension"
            name="finalExtension"
            error={errors.finalExtension?.message}
            register={register}
          />
          <TextInput
            label="End (forever)"
            name="end"
            error={errors.end?.message}
            register={register}
          />
        </div>
        <div className="row">
          <TextInput
            label="PCR Product Size"
            name="pcrProductSize"
            error={errors.pcrProductSize?.message}
            register={register}
          />
          <TextInput label="Note" name="note" error={errors.note?.message} register={register} />
        </div>
        <button className="submit-btn" type="submit">
          Save
        </button>
      </form>
    </>
  );
};

export default PcrPrograms;
