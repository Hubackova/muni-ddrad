// @ts-nocheck

import { getDatabase, onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.scss";
import TopBar from "./components/TopBar";
import { EXTRACTIONS } from "./constants";
import routes from "./routes";
import DdRadIsolates from "./routes/DdRadIsolates";
import Error404 from "./routes/Error404";
import HomePage from "./routes/HomePage";
import Locations from "./routes/Locations";
import Storage from "./routes/Storage";
import { DnaExtractionsType, StorageType } from "./types";
import { AuthProvider } from "./AuthContext";

const App: React.FC = () => {
  const [storage, setStorage] = useState<StorageType[]>([]);
  const [extractions, setExtractions] = useState<DnaExtractionsType[]>([]);
  const db = getDatabase();

  useEffect(() => {
    onValue(ref(db, EXTRACTIONS), (snapshot) => {
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

  const sortedExtractions = extractions;

  return (
    <AuthProvider>
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
                  <DdRadIsolates
                    storage={storage}
                    extractions={sortedExtractions}
                  />
                ) : (
                  <div> loading (or no data)</div>
                )
              }
            />
            <Route
              path={routes.locations}
              element={
                extractions?.length > 0 && storage?.length > 0 ? (
                  <Locations extractions={extractions} />
                ) : (
                  <div> loading (or no data)</div>
                )
              }
            />
            <Route
              path={routes.storage}
              element={
                extractions?.length > 0 && storage?.length > 0 ? (
                  <Storage storage={storage} extractions={extractions} />
                ) : (
                  <div> loading (or no data)</div>
                )
              }
            />
            <Route element={<Error404 returnUrl={routes.home} />} />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  );
};

export default App;
