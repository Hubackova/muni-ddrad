import React from "react";
import { Route, Routes } from "react-router-dom";
import "./App.scss";
import TopBar from "./components/TopBar";
import routes from "./routes";
import DnaExtractions from "./routes/DnaExtractions";
import Error404 from "./routes/Error404";
import HomePage from "./routes/HomePage";
import All from "./routes/All";
import PcrGenomicLoci from "./routes/PcrGenomicLoci";
import Storage from "./routes/Storage";
import Primers from "./routes/Primers";
import PcrPrograms from "./routes/PcrPrograms";

const App: React.FC = () => {
  return (
    <div>
      <TopBar />
      <div className="app-container">
        <Routes>
          <Route path={routes.home} element={<HomePage />} />
          <Route path={routes.dnaExtractions} element={<DnaExtractions />} />
          <Route path={routes.pcrGenomicLoci} element={<PcrGenomicLoci />} />
          <Route path={routes.storage} element={<Storage />} />
          <Route path={routes.all} element={<All />} />
          <Route path={routes.primers} element={<Primers />} />
          <Route path={routes.pcrPrograms} element={<PcrPrograms />} />
          <Route element={<Error404 returnUrl={routes.home} />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
