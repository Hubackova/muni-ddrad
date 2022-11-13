import { yupResolver } from "@hookform/resolvers/yup";
import { getDatabase, onValue, ref } from "firebase/database";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";
import CreatableSelectInput from "../components/CreatableSelectInput";
import TextInput from "../components/TextInput";
import { writeStorageData } from "../firebase/firebase";
import { StorageType } from "../types";

const schema = yup
  .object({
    box: yup.string().required(),
    storageSite: yup.string().required(),
  })
  .required();

const NewStorageForm: React.FC = () => {
  const [storage, setStorage] = useState<StorageType[]>([]);
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
  }, [db]);

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

  const addItem = (data: any) => {
    writeStorageData(data);
    toast.success("Box was added successfully");
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
    <form className="form" onSubmit={handleSubmit(addItem)}>
      <h5>Add new box:</h5>
      <div className="row">
        <TextInput
          label="Box name"
          name="box"
          error={errors.box?.message}
          register={register}
        />
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
  );
};

export default NewStorageForm;
