// @ts-nocheck

import { yupResolver } from "@hookform/resolvers/yup";
import { getDatabase, onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";
import TextInput from "../components/TextInput";
import { writePcrProgramsData } from "../firebase/firebase";
import { PcrProgramsType } from "../types";

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

  const addItem = (data: any) => {
    writePcrProgramsData(data);
    toast.success("Pcr-Program was added successfully");
  };

  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm<PcrProgramsType>({
    resolver: yupResolver(schema),
  });
  const names = pcrPrograms.map((i) => i.name);
  return (
    <form className="form" onSubmit={handleSubmit(addItem)}>
      <h5>Add new pcr program:</h5>
      <div className="row">
        <TextInput
          label="Name"
          name="name"
          error={errors.name?.message}
          register={register}
          onBlur={(e: any) => {
            if (names.includes(e.target.value))
              setError("name", {
                type: "custom",
                message: "Duplicate name",
              });
          }}
        />
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
    </form>
  );
};

export default NewPcrProgramsForm;
