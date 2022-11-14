import { yupResolver } from "@hookform/resolvers/yup";
import { getDatabase, onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";
import CreatableSelectInput from "../components/CreatableSelectInput";
import { writeExtractionData } from "../firebase/firebase";
import { DnaExtractionsType, StorageType } from "../types";
import "./NewSampleForm.scss";
import SelectInput from "./SelectInput";
import TextInput from "./TextInput";

const schema = yup
  .object({
    isolateCode: yup.string().required(),
    dateIsolation: yup.string().required(),
    box: yup.string().required(),
    project: yup.string().required(),
    speciesOrig: yup.string().required(),
    ngul: yup.string().required(),
    kit: yup.string().required(),
    country: yup.string().required(),
    localityName: yup.string().required(),
    collector: yup.string().required(),
  })
  .required();

const NewSampleForm: React.FC = () => {
  const [storage, setStorage] = useState<StorageType[]>([]);
  const [extractions, setExtractions] = useState<DnaExtractionsType[]>([]);
  const [showModalLoc, setShowModalLoc] = useState(false);
  const [showModalCode, setShowModalCode] = useState(false);
  const db = getDatabase();

  useEffect(() => {
    onValue(ref(db, "extractions/"), (snapshot) => {
      const items: DnaExtractionsType[] = [];
      snapshot.forEach((child) => {
        let childItem = child.val();
        childItem.key = child.key;
        items.push(childItem);
      });
      setExtractions(items);
    });
    onValue(ref(db, "storage/"), (snapshot) => {
      const items: StorageType[] = [];
      snapshot.forEach((child) => {
        let childItem = child.val();
        childItem.key = child.key;
        items.push(childItem);
      });
      setStorage(items);
    });
  }, [db]);

  const addItem = (data: any) => {
    const { storageSite, ...sampleData } = data;
    Object.keys(sampleData).forEach((key) => {
      if (sampleData[key] === undefined) {
        delete sampleData[key];
      }
    });
    writeExtractionData({
      ...sampleData,
    });
    toast.success("Sample was added successfully");
  };

  const {
    register,
    control,
    formState: { errors },
    setValue,
    handleSubmit,
  } = useForm<DnaExtractionsType>({
    resolver: yupResolver(schema),
  });

  const boxOptions = storage.map((i) => ({
    value: i.key,
    label: i.box,
    storageSite: i.storageSite,
  }));

  const localityOpt = Object.values(
    extractions.reduce(
      (acc, cur) => Object.assign(acc, { [cur.localityCode]: cur }),
      {}
    )
  )
    .sort((a: any, b: any) => a.localityCode.localeCompare(b.localityCode))
    .map((i: any) => ({
      value: i.localityCode,
      label: i.localityCode,
      country: i.country,
      state: i.state,
      localityName: i.localityName,
      latitude: i.latitude,
      longitude: i.longitude,
      altitude: i.altitude,
      habitat: i.habitat,
      dateCollection: i.dateCollection,
      collector: i.collector,
    }))
    .filter((i) => !!i.value);

  const localityOptions = [
    ...localityOpt,
    {
      value: "",
      label: "-- empty --",
      country: "",
      state: "",
      localityName: "",
      latitude: "",
      longitude: "",
      altitude: "",
      habitat: "",
      dateCollection: "",
      collector: "",
    },
  ];

  const speciesOptions = Object.values(
    extractions.reduce(
      (acc, cur) => Object.assign(acc, { [cur.speciesOrig]: cur }),
      {}
    )
  ).map((i: any) => ({
    value: i.speciesOrig,
    label: i.speciesOrig,
  }));

  const locItems = localityOptions.map((i: any) => (
    <div
      className="item"
      onClick={() => {
        setValue("localityCode", i.value);
        setValue("country", i.country);
        setValue("state", i.state);
        setValue("localityName", i.localityName);
        setValue("latitude", i.latitude);
        setValue("longitude", i.longitude);
        setValue("altitude", i.altitude);
        setValue("habitat", i.habitat);
        setValue("dateCollection", i.dateCollection);
        setValue("collector", i.collector);
      }}
    >
      {i.value}
    </div>
  ));

  const codeItems = Object.values(
    extractions.reduce(
      (acc, cur) => Object.assign(acc, { [cur.isolateCode]: cur }),
      {}
    )
  )
    .sort((a: any, b: any) => a.isolateCode.localeCompare(b.isolateCode))
    .map((i: any) => (
      <div
        className="item"
        onClick={() => {
          setValue("speciesOrig", i.value);
          setValue("project", i.country);
          setValue("dateIsolation", i.state);
          setValue("ngul", i.localityName);
          setValue("kit", i.latitude);
          setValue("box", i.longitude);
          setValue("storageSite", i.altitude);
          setValue("habitat", i.habitat);
          setValue("dateCollection", i.dateCollection);
          setValue("collector", i.collector);
          setValue("localityCode", i.localityCode);
          setValue("country", i.country);
          setValue("state", i.state);
          setValue("localityName", i.localityName);
          setValue("latitude", i.latitude);
          setValue("longitude", i.longitude);
          setValue("altitude", i.altitude);
          setValue("habitat", i.habitat);
          setValue("dateCollection", i.dateCollection);
          setValue("collector", i.collector);
        }}
      >
        {i.isolateCode}
      </div>
    ));

  return (
    <form className="form" onSubmit={handleSubmit(addItem)}>
      <h5>Add new sample:</h5>
      <div className="row">
        <TextInput
          label="Isolate code"
          name="isolateCode"
          error={errors.isolateCode?.message}
          register={register}
        />
        <div>
          <button type="button" onClick={() => setShowModalCode(true)}>
            Show isolate codes
          </button>
          {showModalCode && (
            <div className="side-panel">
              <div className="body">
                <h5>Isolate codes</h5>
                {codeItems}

                <button
                  className="btn cancel-btn"
                  type="button"
                  onClick={() => setShowModalCode(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
        <Controller
          render={({ field: { onChange, value } }) => (
            <CreatableSelectInput
              options={speciesOptions}
              value={value ? { value, label: value } : null}
              onChange={(e: any) => {
                onChange(e?.value);
              }}
              label="Species (original det.)"
              error={errors.speciesOrig?.message}
              isSearchable
            />
          )}
          control={control}
          name="speciesOrig"
        />
      </div>
      <div className="row">
        <TextInput
          label="Project"
          name="project"
          error={errors.project?.message}
          register={register}
        />
        <TextInput
          label="Date of Isolation"
          name="dateIsolation"
          error={errors.dateIsolation?.message}
          register={register}
          type="date"
        />
      </div>
      <div className="row">
        <TextInput
          label="ng/ul"
          name="ngul"
          error={errors.ngul?.message}
          register={register}
        />
        <TextInput
          label="Kit"
          name="kit"
          error={errors.kit?.message}
          register={register}
        />
      </div>
      <div className="row">
        <Controller
          render={({ field: { onChange, value, name } }) => (
            <SelectInput
              options={boxOptions}
              value={value ? { value, label: name } : null}
              onChange={(e: any) => {
                onChange(e?.value);
                setValue("storageSite", e.storageSite);
              }}
              label="Box"
              error={errors.box?.message}
              isSearchable
            />
          )}
          control={control}
          name="box"
        />

        <TextInput
          label="Storage Site"
          name="storageSite"
          error={errors.storageSite?.message}
          register={register}
          disabled
        />
      </div>
      <div className="row">
        <Controller
          render={({ field: { onChange, value } }) => (
            <CreatableSelectInput
              options={localityOptions}
              value={value ? { value, label: value } : null}
              onChange={(e: any) => {
                onChange(e?.value);
                setValue("country", e.country);
                setValue("state", e.state);
                setValue("localityName", e.localityName);
                setValue("latitude", e.latitude);
                setValue("longitude", e.longitude);
                setValue("altitude", e.altitude);
                setValue("habitat", e.habitat);
                setValue("dateCollection", e.dateCollection);
                setValue("collector", e.collector);
              }}
              label="Locality code"
              error={errors.localityCode?.message}
              isSearchable
            />
          )}
          control={control}
          name="localityCode"
        />
        <div>
          <button type="button" onClick={() => setShowModalLoc(true)}>
            Show localities
          </button>
          {showModalLoc && (
            <div className="side-panel">
              <div className="body">
                <h5>Localities</h5>
                {locItems}

                <button
                  className="btn cancel-btn"
                  type="button"
                  onClick={() => setShowModalLoc(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
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
      <div className="row"></div>
      <button className="submit-btn" type="submit">
        Save
      </button>
    </form>
  );
};

export default NewSampleForm;
