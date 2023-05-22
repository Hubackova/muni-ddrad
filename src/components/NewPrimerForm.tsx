// @ts-nocheck
import { getDatabase, onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import TextInput from "../components/TextInput";
import { backup } from "../content/primers";
import { writePrimersData } from "../firebase/firebase";
import { PrimersType } from "../types";

const FORM_DATA_KEY = "primers";

const NewPrimerForm: React.FC = () => {
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

  const addItem = (data: any) => {
    writePrimersData(data);
    sessionStorage.removeItem(FORM_DATA_KEY);
    toast.success("Primer was added successfully");
  };

  const addItemsBackup = () => {
    backup.forEach((i: any) => writePrimersData(i));
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
      marker: "",
      specificity: "",
      sequence: "",
      author: "",
      anneal: "",
      lengthPCR: "",
      work: "",
      noteOnUse: "",
    };
  }, []);

  const {
    register,
    formState: { errors },
    handleSubmit,
    getValues,
    watch,
  } = useForm<PrimersType>({ defaultValues: getSavedData() });

  const primersNames = primers.map((i) => i.name);

  React.useEffect(() => {
    const subscription = watch((value) =>
      sessionStorage.setItem(FORM_DATA_KEY, JSON.stringify(value))
    );
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <form className="form" onSubmit={handleSubmit(addItem)}>
      <h5>Add new primer:</h5>
      <div className="row">
        <TextInput
          label="Name"
          name="name"
          error={errors.name?.message}
          register={register}
          required="This field is required"
          validate={() =>
            !primersNames.includes(getValues("name")) || "Duplicate name"
          }
        />
        <TextInput
          label="Marker"
          name="marker"
          error={errors.marker?.message}
          register={register}
        />
      </div>
      <div className="row">
        <TextInput
          label="Specificity"
          name="specificity"
          error={errors.specificity?.message}
          register={register}
        />
        <TextInput
          label="Sequence"
          name="sequence"
          error={errors.sequence?.message}
          register={register}
          required="This field is required"
        />
      </div>
      <div className="row">
        <TextInput
          label="Author"
          name="author"
          error={errors.author?.message}
          register={register}
        />
        <TextInput
          label="Anneal T [°C]"
          name="anneal"
          error={errors.anneal?.message}
          register={register}
        />
      </div>
      <div className="row">
        <TextInput
          label="Length of PCR product"
          name="lengthPCR"
          error={errors.lengthPCR?.message}
          register={register}
        />
        <TextInput
          label="Work?"
          name="work"
          error={errors.work?.message}
          register={register}
        />
      </div>
      <div className="row">
        <TextInput
          label="Note on use"
          name="noteOnUse"
          error={errors.noteOnUse?.message}
          register={register}
        />
        <TextInput
          label="Box"
          name="box"
          error={errors.box?.message}
          register={register}
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

export default NewPrimerForm;
