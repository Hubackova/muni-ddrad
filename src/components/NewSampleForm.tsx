// @ts-nocheck
import { getDatabase, onValue, ref, update } from "firebase/database";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, set, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import CreatableSelectInput from "../components/CreatableSelectInput";
import { EXTRACTIONS } from "../constants";
import { writeExtractionData } from "../firebase/firebase";
import { getLocalityOptions } from "../helpers/getLocalityOptions";
import { DnaExtractionsType, StorageType } from "../types";
import "./NewSampleForm.scss";
import SelectInput from "./SelectInput";
import TextInput from "./TextInput";

const FORM_DATA_KEY = "app_form_local_data";

export const getOptions = (data: any, key: string) => {
  const options = Object.values(
    data.reduce(
      /* @ts-ignore */
      (acc, cur) => Object.assign(acc, { [cur[key]]: cur }),
      {}
    )
  )
    .map((i: any) => ({
      value: i[key],
      label: i[key],
    }))
    .sort(function (a, b) {
      if (a.label < b.label) {
        return -1;
      }
      if (a.label > b.label) {
        return 1;
      }
      return 0;
    });
  return [{ value: "", label: "-- empty --" }, ...options];
};

const NewSampleForm: React.FC = () => {
  const [storage, setStorage] = useState<StorageType[]>([]);
  const [extractions, setExtractions] = useState<DnaExtractionsType[]>([]);
  const [showModalLoc, setShowModalLoc] = useState(false);
  const [showModalCode, setShowModalCode] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [alternative, setAlternative] = useState("full");
  const db = getDatabase();

  useEffect(() => {
    onValue(ref(db, EXTRACTIONS), (snapshot) => {
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

    let isolateGroupItem = sessionStorage.getItem("isolateGroupItem");
    if (isolateGroupItem) {
      try {
        isolateGroupItem = JSON.parse(isolateGroupItem);
      } catch (err) {
        console.log(err);
      }
    }

    let newIsolateCodeGroup = isolateGroupItem
      ? [isolateGroupItem.isolateCode, sampleData.isolateCode]
      : "";

    if (
      !!isolateGroupItem?.isolateCodeGroup?.length &&
      Array.isArray(isolateGroupItem?.isolateCodeGroup)
    ) {
      newIsolateCodeGroup.push(...isolateGroupItem?.isolateCodeGroup);
    }
    if (
      !!sampleData?.isolateCodeGroup?.length &&
      Array.isArray(sampleData?.isolateCodeGroup)
    ) {
      newIsolateCodeGroup.push(...sampleData?.isolateCodeGroup);
    }

    const newIsolateCodeGroupUnique = newIsolateCodeGroup
      ? [...new Set(newIsolateCodeGroup)]
      : "";

    writeExtractionData({
      ...sampleData,
      ngul: sampleData.ngul ? parseFloat(sampleData.ngul) : "",
      isolateCodeGroup: newIsolateCodeGroupUnique,
    });

    const groupKeys = extractions
      .filter((i) => newIsolateCodeGroupUnique.includes(i.isolateCode))
      .map((i) => i.key);

    if (!!newIsolateCodeGroupUnique.length) {
      groupKeys.forEach((i) =>
        update(ref(db, EXTRACTIONS + i), {
          isolateCodeGroup: newIsolateCodeGroupUnique,
        })
      );
    }
    sessionStorage.removeItem(FORM_DATA_KEY);
    toast.success("Sample was added successfully");
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
      isolateCode: "",
      speciesOrig: "",
      organism: "",
      voucher: "",
      project: "",
      ngul: "",
      habitat: "",
      dateCollection: "",
      collector: "",
      localityCode: "",
      country: "",
      state: "",
      localityName: "",
      latitude: "",
      longitude: "",
      altitude: "",
      isolateCodeGroup: "",
      note: "",
      noteLocality: "",
    };
  }, []);

  const handleReset = () => {
    sessionStorage.removeItem(FORM_DATA_KEY);
    setValue("isolateCode", "");
    setValue("speciesOrig", "");
    setValue("organism", "");
    setValue("voucher", "");
    setValue("dateIsolation", "");
    setValue("kit", "");
    setValue("box", "");
    setValue("storageSite", "");
    setValue("project", "");
    setValue("ngul", "");
    setValue("dateCollection", "");
    setValue("localityCode", "");
    setValue("country", "");
    setValue("state", "");
    setValue("localityName", "");
    setValue("latitude", "");
    setValue("longitude", "");
    setValue("altitude", "");
    setValue("habitat", "");
    setValue("collector", "");
    setValue("isolateCodeGroup", "");
    setValue("note", "");
    setValue("noteLocality", "");
  };

  const {
    register,
    control,
    formState: { errors },
    setValue,
    handleSubmit,
    clearErrors,
    watch,
    getValues,
  } = useForm<DnaExtractionsType | any>({
    mode: "all",
    defaultValues: getSavedData(),
  });

  const boxOptions = storage
    .map((i) => {
      return {
        value: i.key,
        label: i.box,
        storageSite: i.storageSite,
      };
    })
    .sort(function (a, b) {
      if (a.label < b.label) {
        return -1;
      }
      if (a.label > b.label) {
        return 1;
      }
      return 0;
    });

  const boxOptionsWithEmpty = useMemo(
    () => [{ value: "", label: "-- empty --", storageSite: "" }, ...boxOptions],
    [boxOptions]
  );

  const localityOptions = getLocalityOptions(extractions).sort(function (a, b) {
    if (a.label < b.label) {
      return -1;
    }
    if (a.label > b.label) {
      return 1;
    }
    return 0;
  });

  const locItems = useMemo(
    () =>
      localityOptions.map((i: any, index) => {
        if (!i.value) return null;
        return (
          <div
            key={index}
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
              setValue("noteLocality", i.noteLocality);
              setValue("note", i.note);
              clearErrors("country");
              clearErrors("localityName");
            }}
          >
            {i.value}
          </div>
        );
      }),
    [clearErrors, localityOptions, setValue]
  );

  const speciesOptions = getOptions(extractions, "speciesOrig");

  const organismOptionsAll = [
    { value: "plant", label: "plant" },
    { value: "snail", label: "snail" },
    { value: "moss", label: "moss" },
    ...getOptions(extractions, "organism"),
  ];

  const organismOptions = Array.from(
    new Map(organismOptionsAll.map((item) => [item.value, item])).values()
  );

  const codeItems = Object.values(
    extractions.reduce(
      (acc, cur) => Object.assign(acc, { [cur.isolateCode]: cur }),
      {}
    )
  )
    .sort((a: any, b: any) => a.isolateCode?.localeCompare(b.isolateCode))
    .map((i: any, index) => (
      <div
        key={index}
        className="item"
        onClick={() => {
          setValue("speciesOrig", i.speciesOrig, {
            shouldValidate: true,
          });
          setValue("organism", i.organism);
          setValue("voucher", i.voucher);
          setValue("project", i.project);
          setValue("dateCollection", i.dateCollection);
          setValue("noteLocality", i.noteLocality);
          setValue("ngul", i.ngul);
          setValue("localityCode", i.localityCode);
          setValue("country", i.country, {
            shouldValidate: true,
          });
          setValue("state", i.state);
          setValue("localityName", i.localityName, {
            shouldValidate: true,
          });
          setValue("latitude", i.latitude);
          setValue("longitude", i.longitude);
          setValue("altitude", i.altitude);
          setValue("habitat", i.habitat);
          setValue("collector", i.collector, {
            shouldValidate: true,
          });
          setValue("isolateCodeGroup", i.isolateCode);
          setValue("note", i.note);
          /* do isolateGroup v sessionstorage nastaví celej zdrojovej vzorek */
          sessionStorage.setItem("isolateGroupItem", JSON.stringify(i));
          clearErrors("country");
          clearErrors("localityName");
          clearErrors("collector");
          clearErrors("project");
          if (i.localityCode) {
            setIsDisabled(true);
          } else setIsDisabled(false);
        }}
      >
        {i.isolateCode}
      </div>
    ));
  const isCodes = extractions.map((i) => i.isolateCode);

  React.useEffect(() => {
    /* uklada kompletni data z formu do sessionstorage */
    const subscription = watch((value) =>
      sessionStorage.setItem(FORM_DATA_KEY, JSON.stringify(value))
    );
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <form className="form" onSubmit={handleSubmit(addItem)}>
      <div className="newformMenu">
        <h5>Add new sample:</h5>
        <button className="resetBtn" onClick={handleReset}>
          reset form
        </button>
      </div>

      <div className="form-grid">
        <div>
          <TextInput
            name="isolateCode"
            label="Isolate code"
            error={errors.isolateCode?.message}
            register={register}
            required="This field is required"
            validate={() =>
              !isCodes.includes(getValues("isolateCode").trim()) ||
              "Duplicate isolateCode"
            }
          />
          <div>
            <button
              type="button"
              onClick={() => setShowModalCode(true)}
              className="form-btn"
            >
              Show isolate codes
            </button>
            {watch("isolateCodeGroup") && (
              <span>{`(${watch("isolateCodeGroup")})`}</span>
            )}
            {showModalCode && (
              <div className="side-panel">
                <div className="body">
                  <h5>Isolate codes</h5>
                  <div className="items">{codeItems}</div>

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
        </div>
        <Controller
          render={({ field: { onChange, value } }) => (
            <CreatableSelectInput
              options={speciesOptions}
              value={value ? { value, label: value } : null}
              onChange={(e: any) => {
                onChange(e?.value);
                setValue("isolateCodeGroup", "");
                sessionStorage.removeItem("isolateGroupItem");
              }}
              label="Species (original det.)"
              error={errors.speciesOrig?.message}
              isSearchable
              required="This field is required"
            />
          )}
          control={control}
          name="speciesOrig"
        />
        <Controller
          render={({ field: { onChange, value } }) => (
            <CreatableSelectInput
              options={organismOptions}
              value={value ? { value, label: value } : null}
              onChange={(e: any) => {
                onChange(e?.value);
              }}
              label="Organism"
              error={errors.organism?.message}
              isSearchable
              required="This field is required"
            />
          )}
          control={control}
          name="organism"
        />
        <TextInput
          label="Voucher"
          name="voucher"
          error={errors.voucher?.message}
          register={register}
        />
        <Controller
          render={({ field: { onChange, value } }) => (
            <CreatableSelectInput
              options={getOptions(extractions, "project")}
              value={value ? { value, label: value } : null}
              onChange={(e: any) => {
                onChange(e?.value);
              }}
              label="Project"
              error={errors.project?.message}
              isSearchable
              required="This field is required"
            />
          )}
          control={control}
          name="project"
        />
        <TextInput
          label="Date of isolation"
          name="dateIsolation"
          error={errors.dateIsolation?.message}
          register={register}
          type="date"
        />

        <TextInput
          label="Pre_ng/ul"
          name="ngul"
          error={errors.ngul?.message}
          register={register}
          type="number"
          step=".00001"
        />
        <Controller
          render={({ field: { onChange, value } }) => (
            <CreatableSelectInput
              options={getOptions(extractions, "kit")}
              value={value ? { value, label: value } : null}
              onChange={(e: any) => {
                onChange(e?.value);
              }}
              label="Kit"
              error={errors.kit?.message}
              isSearchable
              required="This field is required"
            />
          )}
          control={control}
          name="kit"
        />
        <Controller
          render={({ field: { onChange, value } }) => {
            return (
              <SelectInput
                options={boxOptionsWithEmpty}
                value={
                  value
                    ? {
                        value,
                        label: boxOptionsWithEmpty.find(
                          (i) => i.value === value
                        )?.label,
                      }
                    : null
                }
                onChange={(e: any) => {
                  onChange(e.value);
                  setValue("storageSite", e.storageSite);
                }}
                label="Box"
                error={errors.box?.message}
                isSearchable
              />
            );
          }}
          control={control}
          name="box"
        />

        <TextInput
          label="Storage site"
          name="storageSite"
          error={errors.storageSite?.message}
          register={register}
          disabled
        />
        <div>
          <Controller
            render={({ field: { onChange, value } }) => (
              <CreatableSelectInput
                options={localityOptions}
                value={value ? { value, label: value } : null}
                onChange={(e: any) => {
                  onChange(e?.value);

                  if (
                    e?.value &&
                    !!localityOptions.find((i: any) => i.value === e?.value)
                  ) {
                    setValue("country", e.country);
                    setValue("state", e.state);
                    setValue("localityName", e.localityName);
                    setValue("latitude", e.latitude);
                    setValue("longitude", e.longitude);
                    setValue("altitude", e.altitude);
                    setValue("habitat", e.habitat);
                    setValue("noteLocality", e.noteLocality);
                    setValue("isolateCodeGroup", "");
                    sessionStorage.removeItem("isolateGroupItem");
                    clearErrors("country");
                    clearErrors("localityName");
                    setIsDisabled(true);
                  } else {
                    setIsDisabled(false);
                  }
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
            <button
              type="button"
              onClick={() => setShowModalLoc(true)}
              className="form-btn"
            >
              Show localities
            </button>
            {showModalLoc && (
              <div className="side-panel">
                <div className="body">
                  <h5>Localities</h5>
                  <div className="items">{locItems}</div>
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
        </div>
        <Controller
          render={({ field: { onChange, value } }) => (
            <CreatableSelectInput
              options={getOptions(extractions, "country")}
              value={value ? { value, label: value } : null}
              onChange={(e: any) => {
                if (e?.value !== getValues("country")) {
                  onChange(e?.value);
                  setValue("isolateCodeGroup", "");
                  sessionStorage.removeItem("isolateGroupItem");
                }
              }}
              label="Country"
              error={errors.country?.message}
              isSearchable
              required="This field is required"
              isDisabled={isDisabled}
            />
          )}
          control={control}
          name="country"
        />

        <TextInput
          label="Latitude [°N]"
          name="latitude"
          error={errors.latitude?.message}
          register={register}
          onBlur={(e: any) => {
            if (e.target.value !== getValues("latitude")) {
              setValue("isolateCodeGroup", "");
              sessionStorage.removeItem("isolateGroupItem");
            }
          }}
          validate={(value) =>
            /^-?\d*\.?\d{0,5}$/.test(value) ||
            value === "na" ||
            "Only numbers or dots or na + max 5 decimal places"
          }
          disabled={isDisabled}
        />
        <TextInput
          label="Longitude [°E]"
          name="longitude"
          error={errors.longitude?.message}
          register={register}
          onBlur={(e: any) => {
            if (e.target.value !== getValues("longitude")) {
              setValue("isolateCodeGroup", "");
              sessionStorage.removeItem("isolateGroupItem");
            }
          }}
          validate={(value) =>
            /^-?\d*\.?\d{0,5}$/.test(value) ||
            value === "na" ||
            "Only numbers or dots or na + max 5 decimal places"
          }
          disabled={isDisabled}
        />

        <TextInput
          label="Altitude [m a.s.l.]"
          name="altitude"
          error={errors.altitude?.message}
          register={register}
          onBlur={(e: any) => {
            if (e.target.value !== getValues("altitude")) {
              setValue("isolateCodeGroup", "");
              sessionStorage.removeItem("isolateGroupItem");
            }
          }}
          validate={(value) =>
            /^-?\d*\.?\d{0,5}$/.test(value) ||
            value === "na" ||
            "Only numbers or dots or na + max 5 decimal places"
          }
          disabled={isDisabled}
        />
        <TextInput
          label="State/province"
          name="state"
          error={errors.state?.message}
          register={register}
          onBlur={(e: any) => {
            if (e.target.value !== getValues("state")) {
              setValue("isolateCodeGroup", "");
              sessionStorage.removeItem("isolateGroupItem");
            }
          }}
          disabled={isDisabled}
        />

        <TextInput
          label="Locality name"
          name="localityName"
          error={errors.localityName?.message}
          disabled={isDisabled}
          register={register}
          required="This field is required"
          onBlur={(e: any) => {
            if (e.target.value !== getValues("localityName")) {
              setValue("isolateCodeGroup", "");
              sessionStorage.removeItem("isolateGroupItem");
            }
          }}
        />
        <TextInput
          label="Habitat"
          name="habitat"
          error={errors.habitat?.message}
          register={register}
          onBlur={(e: any) => {
            if (e.target.value !== getValues("habitat")) {
              setValue("isolateCodeGroup", "");
              sessionStorage.removeItem("isolateGroupItem");
            }
          }}
          disabled={isDisabled}
        />

        <div>
          <div className="date-switcher">
            <div
              className="date-btn-switch"
              onClick={() => {
                clearErrors("dateCollection");
                setValue("dateCollection", "");
                return setAlternative("full");
              }}
            >
              YYYY-MM-DD
            </div>
            <div
              className="date-btn-switch"
              onClick={() => {
                clearErrors("dateCollection");
                setValue("dateCollection", "");
                return setAlternative("month");
              }}
            >
              YYYY-MM
            </div>
            <div
              className="date-btn-switch"
              onClick={() => {
                clearErrors("dateCollection");
                setValue("dateCollection", "");
                return setAlternative("year");
              }}
            >
              YYYY
            </div>
          </div>
          {alternative === "full" && (
            <TextInput
              label="Date collection"
              name="dateCollection"
              error={errors.dateCollection?.message}
              register={register}
              required="This field is required"
              type="date"
            />
          )}
          {alternative === "month" && (
            <TextInput
              label="Date collection"
              name="dateCollection"
              error={errors.dateCollection?.message}
              register={register}
              type="month"
              placeholder="YYYY-MM or na"
              required="This field is required"
              validate={(value) =>
                /^(\d{4}-\d{2}|na)$/i.test(value) ||
                "Date should be in YYYY-MM format (or na)"
              }
            />
          )}
          {alternative === "year" && (
            <TextInput
              label="Date collection"
              name="dateCollection"
              error={errors.dateCollection?.message}
              register={register}
              required="This field is required"
              placeholder="YYYY or na"
              validate={(value) =>
                /^(\d{4}|na)$/i.test(value) ||
                "Date should be in YYYY format (or na)"
              }
              onBlur={(e: any) => {
                if (e.target.value !== getValues("dateCollection")) {
                  setValue("isolateCodeGroup", "");
                  sessionStorage.removeItem("isolateGroupItem");
                }
              }}
            />
          )}
        </div>
        <Controller
          render={({ field: { onChange, value } }) => (
            <CreatableSelectInput
              options={getOptions(extractions, "collector")}
              value={value ? { value, label: value } : null}
              onChange={(e: any) => {
                if (e?.value !== getValues("collector")) {
                  onChange(e?.value);
                  setValue("isolateCodeGroup", "");
                  sessionStorage.removeItem("isolateGroupItem");
                }
              }}
              label="Collector"
              error={errors.collector?.message}
              isSearchable
              required="This field is required"
            />
          )}
          control={control}
          name="collector"
        />
        <TextInput
          label="Note - locality"
          name="noteLocality"
          error={errors.noteLocality?.message}
          register={register}
          style={{ minWidth: "100%" }}
        />
        <TextInput
          label="Note - sample"
          name="note"
          error={errors.note?.message}
          register={register}
          style={{ minWidth: "100%" }}
        />
      </div>
      <button className="submit-btn" type="submit">
        Save
      </button>
      {/* 
      <button
        className="submit-btn"
        type="button"
        onClick={() => addItemsBackup()}
      >
        Backup
      </button> */}
    </form>
  );
};

export default NewSampleForm;
