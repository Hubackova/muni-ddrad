import React from "react";
import { Link } from "react-router-dom";
import routes from "../routes";
import "./TopBar.scss";

const TopBar: React.FC = () => {
  return (
    <div className="topbar">
      <Link to={routes.home} className="topbar-item">
        Add new sample
      </Link>
      <Link to={routes.dnaExtractions} className="topbar-item">
        DNA extractions
      </Link>
      <Link to={routes.pcrGenomicLoci} className="topbar-item">
        PCR Genomic Loci
      </Link>
      <Link to={routes.storage} className="topbar-item">
        Storage
      </Link>
      <Link to={routes.locations} className="topbar-item">
        Locations
      </Link>
      <Link to={routes.primers} className="topbar-item">
        Primers
      </Link>
      <Link to={routes.pcrPrograms} className="topbar-item">
        PCR programs
      </Link>
    </div>
  );
};

export default TopBar;
