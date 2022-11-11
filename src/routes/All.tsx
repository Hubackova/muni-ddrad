import { yupResolver } from "@hookform/resolvers/yup";
import { getDatabase, onValue, ref, remove, set } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTable } from "react-table";
import * as yup from "yup";
import TextInput from "../components/TextInput";
import { writeLocationData } from "../firebase/firebase";
import { LocationType } from "../types";
import "./Table.scss";

interface Column {
  Header: any;
  accessor: any;
}
const schema = yup
  .object({
    localityCode: yup.string().required(),
    country: yup.string().required(),
    localityName: yup.string().required(),
    dateCollection: yup.string().required(),
    collector: yup.string().required(),
  })
  .required();

const columns: Column[] = [
  {
    Header: "Isolate code",
    accessor: "isolateCode",
  },
  {
    Header: "Locality code",
    accessor: "localityCode",
  },
  {
    Header: "Country",
    accessor: "country",
  },
  {
    Header: "Latitude [°N]",
    accessor: "latitude",
  },
  {
    Header: "Longitude [°E]",
    accessor: "longitude",
  },
  {
    Header: "Altitude [m a.s.l.]",
    accessor: "altitude",
  },
  {
    Header: "State/province",
    accessor: "state",
  },
  {
    Header: "Locality name",
    accessor: "localityName",
  },
  {
    Header: "Habitat",
    accessor: "habitat",
  },
  {
    Header: "Date collection",
    accessor: "dateCollection",
  },
  {
    Header: "Collector",
    accessor: "collector",
  },
  {
    Header: "Species (original det.)",
    accessor: "speciesOrig",
  },
  {
    Header: "Project",
    accessor: "project",
  },
  {
    Header: "Isolation date",
    accessor: "dateIsolation",
  },
  {
    Header: "ng/ul",
    accessor: "ngul",
  },
  {
    Header: "Box name",
    accessor: "box",
  },
  {
    Header: "Storage site",
    accessor: "storageSite",
  },
];

const Storage: React.FC = () => {
  const [extractions, setExtractions] = useState<LocationType[]>([]);
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
  }, [db]);

  const removeItem = (id: string) => {
    remove(ref(db, "extractions/" + id));
  };

  const editItem = (key: string, rowValues: any, newValue: string, cell: any) => {
    set(ref(db, "extractions/" + key), {
      ...rowValues,
      [cell.column.id]: newValue,
    });
  };

  const defaultColumn = {
    Cell: ({ value: initialValue }: any) => {
      return <span>{initialValue}</span>;
    },
  };

  const tableInstance = useTable({ columns, data: extractions, defaultColumn });
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  return (
    <table className="table" {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            <th>Remove</th>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()}>{column.render("Header")}</th>
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
                return (
                  <td {...cell.getCellProps()} onClick={() => console.log(cell)}>
                    {cell.render("Cell")}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default Storage;
