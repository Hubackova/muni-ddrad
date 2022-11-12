import React from "react";
import NewPcrProgramsForm from "../components/NewPcrProgramsForm";
import NewPrimerForm from "../components/NewPrimerForm";
import NewSampleForm from "../components/NewSampleForm";
import NewStorageForm from "../components/NewStorageForm";
import "./HomePage.scss";

const HomePage: React.FC = () => {
  return (
    <div className="main-wrapper">
      <div className="form-grid">
        <div className="form-wrapper">
          <NewSampleForm />
        </div>
        <div className="form-column">
          <div className="form-wrapper">
            <NewPcrProgramsForm />
          </div>
          <div className="form-wrapper">
            <NewStorageForm />
          </div>
        </div>
        <div className="form-wrapper">
          <NewPrimerForm />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
