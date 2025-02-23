import React from "react";
import NewSampleForm from "../components/NewSampleForm";
import NewStorageForm from "../components/NewStorageForm";
import "./HomePage.scss";
import "./Table.scss";

const HomePage: React.FC = () => {
  return (
    <div className="main-wrapper">
      <div className="form-grid">
        <div className="form-wrapper">
          <NewSampleForm />
        </div>
      </div>
      <div className="form-grid">
        <div className="form-wrapper">
          <NewStorageForm />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
