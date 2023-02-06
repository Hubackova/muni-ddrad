import { DnaExtractionsType } from "../types";

export const getLocalityOptions = (extractions: DnaExtractionsType[]) => {
  const localityOpt = !extractions.length
    ? []
    : Object.values(
        extractions.reduce(
          (acc, cur) => Object.assign(acc, { [cur.localityCode]: cur }),
          {}
        )
      )
        .sort(
          (a: any, b: any) =>
            a.localityCode &&
            a.localityCode.toString()?.localeCompare(b.localityCode.toString())
        )
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

  return [
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
    ...localityOpt,
  ];
};
