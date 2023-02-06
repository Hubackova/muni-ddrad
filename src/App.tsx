import { getDatabase, onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.scss";
import TopBar from "./components/TopBar";
import routes from "./routes";
import All from "./routes/All";
import DnaExtractions from "./routes/DnaExtractions";
import Error404 from "./routes/Error404";
import HomePage from "./routes/HomePage";
import Locations from "./routes/Locations";
import PcrGenomicLoci from "./routes/PcrGenomicLoci";
import PcrPrograms from "./routes/PcrPrograms";
import Primers from "./routes/Primers";
import Storage from "./routes/Storage";
import { DnaExtractionsType, StorageType } from "./types";

const App: React.FC = () => {
  const [storage, setStorage] = useState<StorageType[]>([]);
  const [extractions, setExtractions] = useState<DnaExtractionsType[]>([]);
  const db = getDatabase();

  useEffect(() => {
    onValue(ref(db, "extractions/"), (snapshot) => {
      const items: DnaExtractionsType[] = [];
      snapshot.forEach((child) => {
        let childItem = child.val();
        childItem.key = child.key;
        items.push(childItem);
      });
      setExtractions(items.reverse());
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

  return (
    <div>
      <TopBar />
      <ToastContainer />
      <div className="app-container">
        <Routes>
          <Route path={routes.home} element={<HomePage />} />
          <Route
            path={routes.dnaExtractions}
            element={
              extractions?.length > 0 && storage?.length > 0 ? (
                <DnaExtractions storage={storage} extractions={extractions} />
              ) : (
                <div> no data</div>
              )
            }
          />
          <Route
            path={routes.pcrGenomicLoci}
            element={
              extractions?.length > 0 && storage?.length > 0 ? (
                <PcrGenomicLoci storage={storage} extractions={extractions} />
              ) : (
                <div> no data</div>
              )
            }
          />
          <Route
            path={routes.locations}
            element={
              extractions?.length > 0 && storage?.length > 0 ? (
                <Locations extractions={extractions} />
              ) : (
                <div> no data</div>
              )
            }
          />
          <Route
            path={routes.storage}
            element={
              extractions?.length > 0 && storage?.length > 0 ? (
                <Storage storage={storage} extractions={extractions} />
              ) : (
                <div> no data</div>
              )
            }
          />
          <Route
            path={routes.all}
            element={
              extractions?.length > 0 && storage?.length > 0 ? (
                <All storage={storage} extractions={extractions} />
              ) : (
                <div> no data</div>
              )
            }
          />
          <Route path={routes.primers} element={<Primers />} />
          <Route path={routes.pcrPrograms} element={<PcrPrograms />} />
          <Route element={<Error404 returnUrl={routes.home} />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
