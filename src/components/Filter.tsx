// @ts-nocheck
import moment from "moment";
import React, { useMemo, useState } from "react";
import { useAsyncDebounce } from "react-table";
import { ReactComponent as FilterIcon } from "../images/filter.svg";
import "./Filter.scss";

// Component for Global Filter
export function GlobalFilter({ globalFilter, setGlobalFilter }) {
  const [value, setValue] = useState(globalFilter);

  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <div>
      <input
        value={value || ""}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder="Search Table:"
      />
    </div>
  );
}

export function multiSelectFilter(rows, columnIds, filterValue) {
  return filterValue.length === 0
    ? rows
    : rows.filter((row) =>
        filterValue.includes(String(row.original[columnIds]))
      );
}
const arrayRemove = (arr, value) => {
  return arr.filter((ele) => ele !== value);
};
const arrayRemoveArr = (arr, valueArr) => {
  return arr.filter((el) => !valueArr.includes(el));
};

export function Multi({
  column: { filterValue, setFilter, preFilteredRows, id },
  column,
}) {
  const now = moment().format("YYYY-MM-DD");
  const [opened, setOpened] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [max, setMax] = useState("");
  const [min, setMin] = useState("");
  const [maxDate, setMaxDate] = useState(now);
  const [minDate, setMinDate] = useState(now);
  const [filterBy, setFilterBy] = useState(false);

  const options = useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach((row) => {
      options.add(row.values[id]);
    });
    return [...options.values()];
  }, [id, preFilteredRows]);
  const isValidDate = moment(
    options.find((i) => !!i),
    "YYYY-MM-DD",
    true
  ).isValid();

  const allDate = useMemo(() => {
    if (!isValidDate) return [];
    return options.filter((i) => !!i).map((date) => moment(date));
  }, [isValidDate, options]);

  const [allMin, allMax] = React.useMemo(() => {
    let allMin = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    let allMax = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    preFilteredRows.forEach((row) => {
      allMin = Math.min(row.values[id], allMin);
      allMax = Math.max(row.values[id], allMax);
    });

    setMin(allMin);
    setMax(allMax);
    return [allMin, allMax];
  }, [id, preFilteredRows]);

  const [allMinDate, allMaxDate] = React.useMemo(() => {
    if (!isValidDate) return [];
    let allMinDate = moment.min(allDate).format("YYYY-MM-DD");
    let allMaxDate = moment.max(allDate).format("YYYY-MM-DD");
    setMinDate(allMinDate);
    setMaxDate(allMaxDate);
    return [allMinDate, allMaxDate];
  }, [allDate, isValidDate]);

  const selectOptions = searchValue
    ? options
        .filter((i) => i.includes(searchValue))
        .map((i) => ({ value: i, label: i }))
    : options.map((i) => ({ value: i, label: i }));

  const years = useMemo(() => {
    if (!isValidDate) return [];
    const years = new Set();
    allDate.forEach((row) => {
      if (row.isValid()) years.add(row.format("YYYY"));
    });
    return [...years.values()];
  }, [allDate, isValidDate]);

  const months = useMemo(() => {
    if (!isValidDate) return [];
    const months = new Set();
    allDate.forEach((row) => {
      if (row.isValid()) months.add(row.format("MM"));
    });
    return [...months.values()];
  }, [allDate, isValidDate]);

  // UI for Multi-Select box
  return (
    <div className="filter-wrapper">
      <button onClick={() => setOpened(!opened)} className="filter-btn">
        <FilterIcon />
      </button>
      {opened && (
        <div className="filter-content">
          <div
            {...column.getHeaderProps(column.getSortByToggleProps())}
            className="filter-link"
            style={{ fontWeight: 500 }}
          >
            {column.isSorted
              ? column.isSortedDesc
                ? "Unsort"
                : "Sort Z -> A "
              : "Sort A -> Z"}
          </div>

          {(isValidDate || !Number.isNaN(allMin)) && (
            <div
              onClick={() => setFilterBy(!filterBy)}
              className="filter-link"
              style={{ fontWeight: 500 }}
            >
              Filter by condition
            </div>
          )}
          {filterBy && (
            <>
              {!Number.isNaN(allMin) && (
                <>
                  <div className="normal">By number</div>
                  <input
                    value={min}
                    type="number"
                    placeholder={`Min (${allMin})`}
                    onBlur={(e) => {
                      const val = e.target.value;
                      const onlyNumbers = options.filter(
                        (element) =>
                          typeof parseFloat(element) === "number" &&
                          element >= parseFloat(val) &&
                          element <= parseFloat(max)
                      );

                      setFilter(val ? onlyNumbers : []);
                    }}
                    onChange={(e) => {
                      setMin(e.target.value);
                    }}
                    style={{
                      width: "70px",
                      marginRight: "0.5rem",
                    }}
                  />
                  to
                  <input
                    value={max}
                    type="number"
                    placeholder={`Max (${allMax})`}
                    onBlur={(e) => {
                      const val = e.target.value;
                      const onlyNumbers = options.filter(
                        (element) =>
                          typeof parseFloat(element) === "number" &&
                          element <= parseFloat(val) &&
                          element >= parseFloat(min)
                      );

                      setFilter(val ? onlyNumbers : []);
                    }}
                    onChange={(e) => {
                      setMax(e.target.value);
                    }}
                    style={{
                      width: "80px",
                      marginLeft: "0.5rem",
                    }}
                  />
                </>
              )}
              {isValidDate && (
                <>
                  <div className="normal">By year</div>
                  {years.map((i, index) => {
                    const isChecked =
                      filterValue?.length &&
                      filterValue.some(
                        (val) => moment(val).format("YYYY") === i
                      );
                    const selected = options.filter(
                      (opt) => moment(opt).format("YYYY") === i
                    );
                    return (
                      <div
                        key={index}
                        className="filter-link"
                        onClick={() => {
                          isChecked
                            ? setFilter(arrayRemoveArr(filterValue, selected))
                            : setFilter(
                                filterValue?.length
                                  ? [...filterValue, ...selected]
                                  : selected
                              );
                        }}
                      >
                        <>
                          {isChecked ? "✅" : "⬜"} {i}
                        </>
                      </div>
                    );
                  })}

                  <div className="normal">By month</div>
                  {months.map((i, index) => {
                    const isChecked =
                      filterValue?.length &&
                      filterValue.some((val) => moment(val).format("MM") === i);
                    const selected = options.filter(
                      (opt) => moment(opt).format("MM") === i
                    );
                    return (
                      <div
                        key={index}
                        className="filter-link"
                        onClick={() => {
                          isChecked
                            ? setFilter(arrayRemoveArr(filterValue, selected))
                            : setFilter(
                                filterValue?.length
                                  ? [...filterValue, ...selected]
                                  : selected
                              );
                        }}
                      >
                        <>
                          {isChecked ? "✅" : "⬜"} {i}
                        </>
                      </div>
                    );
                  })}
                  <div className="normal">From</div>
                  <input
                    type="date"
                    value={minDate}
                    onChange={(e) => {
                      setMinDate(e.target.value);
                      const val = e.target.value;
                      let dates = options.filter(
                        (element) =>
                          moment(element).isSameOrAfter(moment(val)) &&
                          moment(element).isSameOrBefore(moment(maxDate))
                      );

                      setFilter(val ? dates : []);
                    }}
                  />
                  <div className="normal">To</div>
                  <input
                    type="date"
                    value={maxDate}
                    onChange={(e) => {
                      setMaxDate(e.target.value);
                      const val = e.target.value;
                      let dates = options.filter(
                        (element) =>
                          moment(element).isSameOrBefore(moment(val)) &&
                          moment(element).isSameOrAfter(moment(minDate))
                      );

                      setFilter(val ? dates : []);
                    }}
                  />
                </>
              )}
            </>
          )}

          <hr />
          <div
            onClick={() => setFilter(selectOptions.map((i) => i.value))}
            className="filter-link"
            style={{ marginBottom: 2 }}
          >
            Select all
          </div>
          <div
            onClick={() => setFilter([])}
            className="filter-link"
            style={{ marginBottom: 2, color: "red" }}
          >
            Unselect all
          </div>
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={`Search records..`}
          />
          {selectOptions.map((i) => {
            const isChecked =
              filterValue?.length && filterValue.includes(i.value);

            return (
              <div
                key={i.value}
                className="filter-link"
                onClick={() => {
                  isChecked
                    ? setFilter(arrayRemove(filterValue, i.value))
                    : setFilter(
                        filterValue?.length
                          ? [...filterValue, i.value]
                          : [i.value]
                      );
                }}
              >
                <>
                  {isChecked ? "✅" : "⬜"} {i.value}
                </>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
