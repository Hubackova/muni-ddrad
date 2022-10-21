import React from "react";
import NewSampleForm from "../components/NewSampleForm";
import "./HomePage.scss";

const HomePage: React.FC = () => {
  return (
    <div className="main-wrapper">
      <h5>Add new sample:</h5>
      <NewSampleForm />
    </div>
  );
};

export default HomePage;
