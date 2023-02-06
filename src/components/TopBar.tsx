// @ts-nocheck

import { getDatabase, onValue, ref } from "firebase/database";
import React from "react";
import { NavLink } from "react-router-dom";
import routes from "../routes";
import "./TopBar.scss";

const TopBar: React.FC = () => {
  const db = getDatabase();

  const handleDownload = () => {
    onValue(ref(db, "/"), (snapshot) => {
      let dataStr = JSON.stringify(snapshot);
      let dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      let link = document.createElement("a");
      link.download = "db-mollusca-backup.json";
      link.href = dataUri;
      link.click();
    });
  };

  return (
    <div className="topbar">
      <NavLink
        to={routes.home}
        className={({ isActive }) =>
          isActive ? "topbar-item active" : "topbar-item"
        }
      >
        Add new
      </NavLink>
      <NavLink
        to={routes.dnaExtractions}
        className={({ isActive }) =>
          isActive ? "topbar-item active" : "topbar-item"
        }
      >
        DNA extractions
      </NavLink>
      <NavLink
        to={routes.pcrGenomicLoci}
        className={({ isActive }) =>
          isActive ? "topbar-item active" : "topbar-item"
        }
      >
        PCR Genomic Loci
      </NavLink>
      <NavLink
        to={routes.storage}
        className={({ isActive }) =>
          isActive ? "topbar-item active" : "topbar-item"
        }
      >
        Storage
      </NavLink>
      <NavLink
        to={routes.all}
        className={({ isActive }) =>
          isActive ? "topbar-item active" : "topbar-item"
        }
      >
        All
      </NavLink>
      <NavLink
        to={routes.primers}
        className={({ isActive }) =>
          isActive ? "topbar-item active" : "topbar-item"
        }
      >
        Primers
      </NavLink>
      <NavLink
        to={routes.pcrPrograms}
        className={({ isActive }) =>
          isActive ? "topbar-item active" : "topbar-item"
        }
      >
        PCR programs
      </NavLink>
      <NavLink
        to={routes.locations}
        className={({ isActive }) =>
          isActive ? "topbar-item active" : "topbar-item"
        }
      >
        Locations
      </NavLink>
      <button className="export" onClick={() => handleDownload()}>
        Export all
      </button>
    </div>
  );
};

export default TopBar;
