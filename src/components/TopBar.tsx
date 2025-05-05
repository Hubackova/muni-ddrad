// @ts-nocheck

import { getDatabase, onValue, ref } from "firebase/database";
import React from "react";
import { NavLink } from "react-router-dom";
import routes from "../routes";
import "./TopBar.scss";
import SignInButton from "./SignInButton";

const TopBar: React.FC = () => {
  const db = getDatabase();

  const handleDownload = () => {
    onValue(ref(db, "/"), (snapshot) => {
      const data = JSON.stringify(snapshot);
      const link = document.createElement("a");

      link.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(data)
      );
      link.setAttribute("download", "db-mollusca-backup.json");
      link.style.display = "none";

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
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
        ddRAD isolates
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
      <SignInButton />
    </div>
  );
};

export default TopBar;
