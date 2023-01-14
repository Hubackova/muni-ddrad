import { getDatabase, onValue, ref } from "firebase/database";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import CreatableSelectInput from "../components/CreatableSelectInput";
import TextInput from "../components/TextInput";
import { backup } from "../content/storage";
import { writeStorageData } from "../firebase/firebase";
import { StorageType } from "../types";

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

  const addItemsBackup = () => {
    backup.forEach((i: any) => writeStorageData(i));
    toast.success("ok");
  };

  const {
    register,
    formState: { errors },
    handleSubmit,
    control,
  } = useForm<StorageType>({
    mode: "all",
  });
  const boxes = storage.map((i) => i.box);
  return (
    <form className="form" onSubmit={handleSubmit(addItem)}>
      <h5>Add new box:</h5>
      <div className="row">
        <TextInput
          label="Box name"
          name="box"
          error={errors.box?.message}
          register={register}
          validate={(e: any) => {
            return !boxes.includes(e) || "Duplicate box";
          }}
          required="This field is required"
        />
        <Controller
          render={({ field: { onChange, value } }) => (
            <CreatableSelectInput
              options={storageOptions}
              value={value ? { value, label: value } : null}
              onChange={(e: any) => {
                onChange(e?.value);
              }}
              label="Storage site"
              error={errors.storageSite?.message}
              isSearchable
              required="This field is required"
            />
          )}
          control={control}
          name="storageSite"
        />
      </div>
      <button className="submit-btn" type="submit">
        Save
      </button>
      {/*       <button
        className="submit-btn"
        type="button"
        onClick={() => addItemsBackup()}
      >
        Backup
      </button> */}
    </form>
  );
};

export default NewStorageForm;
