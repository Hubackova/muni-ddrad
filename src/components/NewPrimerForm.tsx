// @ts-nocheck

import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import TextInput from "../components/TextInput";
import { writePrimersData } from "../firebase/firebase";
import { PrimersType } from "../types";

const NewPrimerForm: React.FC = () => {
  const schema = yup
    .object({
      name: yup.string().required(),
      sequence: yup.string().required(),
    })
    .required();

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
    <form className="form" onSubmit={handleSubmit(addItem)}>
      <h5>Add new primer:</h5>
      <div className="row">
        <TextInput
          label="Name"
          name="name"
          error={errors.name?.message}
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
        <TextInput
          label="Work?"
          name="work"
          error={errors.work?.message}
          register={register}
        />
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
  );
};

export default NewPrimerForm;
