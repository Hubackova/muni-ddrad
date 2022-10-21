import cx from "classnames";
import React from "react";
import CreatableSelect from "react-select/creatable";
import "./SelectInput.scss";

export interface DefaultOptionType {
  label: string;
  value: string;
}

function CreatableSelectInput(
  { label, error, isTransparent = false, isSearchable = false, ...props }: any,
  ref: React.Ref<any>
) {
  return (
    <div className="select">
      {label && <label className="label">{label}</label>}
      <CreatableSelect
        {...props}
        ref={ref}
        isSearchable={isSearchable}
        className={cx("select-input", props.className, {
          error: !!error,
          searchable: isSearchable,
        })}
        classNamePrefix="select"
        menuPlacement="auto"
      />
      {!!error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default React.forwardRef(CreatableSelectInput);
