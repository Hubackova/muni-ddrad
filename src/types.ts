export interface DnaExtractionsType {
  isolateCode: string;
  speciesOrig: string;
  speciesUpdated: string;
  project: string;
  dateIsolation: string;
  ngul: string;
  box: string;
  storageSite: string;
  localityCode: string;
  country: string;
  state: string;
  kit: string;
  localityName: string;
  latitude: string;
  longitude: string;
  altitude: string;
  habitat: string;
  dateCollection: string;
  collector: string;
  isolateCodeGroup: string[] | "";
}

export interface StorageType {
  box: string;
  storageSite: string;
  key: string;
}

export interface LocationType {
  localityCode: string;
  country: string;
  latitude: string;
  longitude: string;
  altitude: string;
  state: string;
  localityName: string;
  habitat: string;
  dateCollection: string;
  collector: string;
  key: string;
}

export interface PrimersType {
  name: string;
  marker: string;
  specificity: string;
  sequence: string;
  author: string;
  anneal: string;
  lengthPCR: string;
  work: string;
  noteOnUse: string;
}

export interface PcrProgramsType {
  name: string;
  initialDenaturation: string;
  denaturation: string;
  annealing: string;
  extension: string;
  numberCycles: string;
  finalExtension: string;
  end: string;
  pcrProductSize: string;
  note: string;
}
