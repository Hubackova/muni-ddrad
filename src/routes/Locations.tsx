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
    Header: "Locality code",
    accessor: "localityCode", // accessor is the "key" in the data
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
];

const Storage: React.FC = () => {
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [showForm, setShowForm] = useState(false);

  const db = getDatabase();

  useEffect(() => {
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
    remove(ref(db, "locations/" + id));
  };

  const editItem = (key: string, rowValues: any, newValue: string, cell: any) => {
    set(ref(db, "locations/" + key), {
      ...rowValues,
      [cell.column.id]: newValue,
    });
  };

  const tableInstance = useTable({ columns, data: locations });
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  const addItem = (data: any) => {
    writeLocationData(data);
  };

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<LocationType>({
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
                      <input
                        onChange={(e) => (cell.value = e.target.value)}
                        onBlur={(e) => editItem(row.original.key, row.values, e.target.value, cell)}
                        defaultValue={[cell.value] || ""}
                      ></input>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      <h5 className="show-form" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Hide form" : "Add new locality"}
      </h5>
      {showForm && (
        <form className="form" onSubmit={handleSubmit(addItem)}>
          <div className="row">
            <TextInput
              label="Locality code"
              name="localityCode"
              error={errors.localityCode?.message}
              register={register}
            />
            <TextInput
              label="Country"
              name="country"
              error={errors.country?.message}
              register={register}
            />
          </div>
          <div className="row">
            <TextInput
              label="Latitude [°N]"
              name="latitude"
              error={errors.latitude?.message}
              register={register}
            />
            <TextInput
              label="Longitude [°E]"
              name="longitude"
              error={errors.longitude?.message}
              register={register}
            />
          </div>
          <div className="row">
            <TextInput
              label="Altitude [m a.s.l.]"
              name="altitude"
              error={errors.altitude?.message}
              register={register}
            />
            <TextInput
              label="State/province"
              name="state"
              error={errors.state?.message}
              register={register}
            />
          </div>
          <div className="row">
            <TextInput
              label="Locality name"
              name="localityName"
              error={errors.localityName?.message}
              register={register}
            />
            <TextInput
              label="Habitat"
              name="habitat"
              error={errors.habitat?.message}
              register={register}
            />
          </div>
          <div className="row">
            <TextInput
              label="Date collection"
              name="dateCollection"
              error={errors.dateCollection?.message}
              register={register}
              type="date"
            />
            <TextInput
              label="Collector"
              name="collector"
              error={errors.collector?.message}
              register={register}
            />
          </div>
          <button className="submit-btn" type="submit">
            Save
          </button>
        </form>
      )}
    </>
  );
};

export default Storage;
