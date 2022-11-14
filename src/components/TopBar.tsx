// @ts-nocheck

import { getDatabase, onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { NavLink } from "react-router-dom";
import routes from "../routes";
import "./TopBar.scss";

const TopBar: React.FC = () => {
  const [pcrPrograms, setPcrPrograms] = useState<PcrProgramsType[]>([]);
  const [extractions, setExtractions] = useState<DnaExtractionsType[]>([]);

  const db = getDatabase();

  useEffect(() => {
    onValue(ref(db, "pcrPrograms/"), (snapshot) => {
      const items: any = [];
      snapshot.forEach((child) => {
        let childItem = child.val();
        childItem.key = child.key;
        items.push(childItem);
      });
      setPcrPrograms(items);
    });
    onValue(ref(db, "extractions/"), (snapshot) => {
      const items: any = [];
      snapshot.forEach((child) => {
        let childItem = child.val();
        childItem.key = child.key;
        items.push(childItem);
      });
      setExtractions(items);
    });
  }, [db]);
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

      <CSVLink data={extractions} className="topbar-item">
        <div>Export all (todo)</div>
      </CSVLink>
    </div>
  );
};

export default TopBar;
