import React from "react";
import { NavLink } from "react-router-dom";
import routes from "../routes";
import "./TopBar.scss";

const TopBar: React.FC = () => {
  return (
    <div className="topbar">
      <NavLink
        to={routes.home}
        className={({ isActive }) => (isActive ? "topbar-item active" : "topbar-item")}
      >
        Add new sample
      </NavLink>
      <NavLink
        to={routes.dnaExtractions}
        className={({ isActive }) => (isActive ? "topbar-item active" : "topbar-item")}
      >
        DNA extractions
      </NavLink>
      <NavLink
        to={routes.pcrGenomicLoci}
        className={({ isActive }) => (isActive ? "topbar-item active" : "topbar-item")}
      >
        PCR Genomic Loci
      </NavLink>
      <NavLink
        to={routes.storage}
        className={({ isActive }) => (isActive ? "topbar-item active" : "topbar-item")}
      >
        Storage
      </NavLink>
      <NavLink
        to={routes.locations}
        className={({ isActive }) => (isActive ? "topbar-item active" : "topbar-item")}
      >
        Locations
      </NavLink>
      <NavLink
        to={routes.primers}
        className={({ isActive }) => (isActive ? "topbar-item active" : "topbar-item")}
      >
        Primers
      </NavLink>
      <NavLink
        to={routes.pcrPrograms}
        className={({ isActive }) => (isActive ? "topbar-item active" : "topbar-item")}
      >
        PCR programs
      </NavLink>
    </div>
  );
};

export default TopBar;
