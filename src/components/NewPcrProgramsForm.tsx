// @ts-nocheck

import { getDatabase, onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import TextInput from "../components/TextInput";
import { backup } from "../content/pcrprograms";
import { writePcrProgramsData } from "../firebase/firebase";
import { PcrProgramsType } from "../types";

const FORM_DATA_KEY = "pcrPrograms";

const NewPcrProgramsForm: React.FC = () => {
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

  const addItem = (data: any) => {
    writePcrProgramsData(data);
    sessionStorage.removeItem(FORM_DATA_KEY);
    toast.success("Pcr-Program was added successfully");
  };

  const addItemsBackup = () => {
    backup.forEach((i: any) => writePcrProgramsData(i));
    toast.success("ok");
  };

  const getSavedData = React.useCallback(() => {
    let data = sessionStorage.getItem(FORM_DATA_KEY);
    if (data) {
      // Parse it to a javaScript object
      try {
        data = JSON.parse(data);
      } catch (err) {
        console.log(err);
      }
      return data;
    }
    return {
      name: "",
      initialDenaturation: "",
      denaturation: "",
      annealing: "",
      extension: "",
      numberCycles: "",
      finalExtension: "",
      end: "",
      pcrProductSize: "",
      note: "",
    };
  }, []);

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<PcrProgramsType>({
    mode: "all",
    defaultValues: getSavedData(),
  });
  const names = pcrPrograms.map((i) => i.name);

  React.useEffect(() => {
    const subscription = watch((value) =>
      sessionStorage.setItem(FORM_DATA_KEY, JSON.stringify(value))
    );
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <form className="form" onSubmit={handleSubmit(addItem)}>
      <h5>Add new pcr program:</h5>
      <div className="row">
        <TextInput
          label="Name"
          name="name"
          error={errors.name?.message}
          register={register}
          validate={(e: any) => {
            return !names.includes(e) || "Duplicate name";
          }}
          required="This field is required"
        />
        <TextInput
          label="Initial Denaturation"
          name="initialDenaturation"
          error={errors.initialDenaturation?.message}
          register={register}
          required="This field is required"
        />
      </div>
      <div className="row">
        <TextInput
          label="Denaturation"
          name="denaturation"
          error={errors.denaturation?.message}
          register={register}
          required="This field is required"
        />
        <TextInput
          label="Annealing"
          name="annealing"
          error={errors.annealing?.message}
          register={register}
          required="This field is required"
        />
      </div>
      <div className="row">
        <TextInput
          label="Extension"
          name="extension"
          error={errors.extension?.message}
          register={register}
          required="This field is required"
        />
        <TextInput
          label="Number of cycles"
          name="numberCycles"
          error={errors.numberCycles?.message}
          register={register}
          required="This field is required"
        />
      </div>
      <div className="row">
        <TextInput
          label="Final Extension"
          name="finalExtension"
          error={errors.finalExtension?.message}
          register={register}
          required="This field is required"
        />
        <TextInput
          label="End (forever)"
          name="end"
          error={errors.end?.message}
          register={register}
          required="This field is required"
        />
      </div>
      <div className="row">
        <TextInput
          label="PCR Product Size"
          name="pcrProductSize"
          error={errors.pcrProductSize?.message}
          register={register}
        />
        <TextInput
          label="Note"
          name="note"
          error={errors.note?.message}
          register={register}
        />
      </div>
      <button className="submit-btn" type="submit">
        Save
      </button>
      <button
        className="submit-btn"
        type="button"
        onClick={() => addItemsBackup()}
      >
        Backup
      </button>
    </form>
  );
};

export default NewPcrProgramsForm;
