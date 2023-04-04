// @ts-nocheck

import { getDatabase, ref, update } from "firebase/database";
import React, { useState } from "react";
import { toast } from "react-toastify";
import ConfirmModal from "./ConfirmModal";
import CreatableSelectInput from "./CreatableSelectInput";
import SelectInput from "./SelectInput";

export const useIsOverflow = (ref, callback) => {
  const [isOverflow, setIsOverflow] = React.useState(undefined);

  React.useLayoutEffect(() => {
    const { current } = ref;

    const trigger = () => {
      const hasOverflow = current.scrollWidth > current.clientWidth;

      setIsOverflow(hasOverflow);

      if (callback) callback(hasOverflow);
    };

    if (current) {
      trigger();
    }
  }, [callback, ref]);

  return isOverflow;
};

export const customComparator = (prevProps, nextProps) => {
  return nextProps.value === prevProps.value;
};

export const customLocalityComparator = (prevProps, nextProps) => {
  return (
    nextProps.value === prevProps.value &&
    prevProps.row.original.localityCode === nextProps.row.original.localityCode
  );
};

export const DateCell: React.FC<any> = ({
  initialValue = "",
  row,
  cell,
  saveLast = () => {},
  maxChars = 22,
}) => {
  const db = getDatabase();
  const [showEditModal, setShowEditModal] = useState(null);
  const [value, setValue] = React.useState(initialValue);

  const onChange = (e: any) => {
    setValue(e.target.value);
    if (
      (initialValue?.toString() || "") !== (e.target.value?.toString() || "")
    ) {
      setShowEditModal({
        row,
        newValue: e.target.value,
        id: cell.column.id,
        initialValue,
        setValue,
        callback: () => {
          update(ref(db, "extractions/" + row.original.key), {
            [cell.column.id]: e.target.value,
          });
          saveLast({
            rowKey: row.original.key,
            cellId: cell.column.id,
            initialValue,
          });
        },
      });
    }
  };
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <>
      {showEditModal?.row.id === cell.row.id &&
        showEditModal.id === cell.column.id && (
          <ConfirmModal
            title={`Do you want to change value from ${
              showEditModal.initialValue || "<empty>"
            } to ${showEditModal.newValue} ?`}
            onConfirm={async () => {
              await showEditModal.callback();
              setShowEditModal(null);
              toast.success("Field was edited successfully");
            }}
            onCancel={() => {
              showEditModal.setValue(showEditModal.initialValue);
            }}
            onHide={() => setShowEditModal(null)}
          />
        )}
      <input
        value={value}
        onChange={onChange}
        type="date"
        title={value.length > maxChars ? value : ""}
      />
    </>
  );
};

export const EditableCell: React.FC<any> = ({
  initialValue = "",
  row,
  cell,
  disabled = false,
  maxChars = 22,
  dbName = "extractions/",
  saveLast = () => {},
  ...props
}) => {
  const db = getDatabase();
  const [showEditModal, setShowEditModal] = useState(null);
  const [value, setValue] = useState(initialValue);
  const onChange = (e: any) => {
    setValue(e.target.value);
  };
  const onBlur = (e: any) => {
    if (
      (initialValue?.toString() || "") !== (e.target.value?.toString() || "")
    ) {
      setShowEditModal({
        row,
        newValue: e.target.value,
        id: cell.column.id,
        initialValue,
        setValue,
        callback: () => {
          update(ref(db, dbName + row.original.key), {
            [cell.column.id]: e.target.value,
          });
          saveLast({
            rowKey: row.original.key,
            cellId: cell.column.id,
            initialValue,
          });
        },
      });
    }
  };
  const inputRef = React.useRef();
  const isOverflow = useIsOverflow(inputRef);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);
  if (!cell) return;

  const isNarrow = [
    "isolateCodeGroup",
    "ngul",
    "isolateCode",
    "kit",
    "status",
    "marker",
    "anneal",
    "annealing",
    "extension",
    "latitude",
    /*     "cytB",
    "16S",
    "COI",
    "COII",
    "ITS1",
    "ITS2",
    "ELAV", */
  ].includes(cell.column.id);
  const isWide = ["localityName", "note"].includes(cell.column.id);
  const isSemiWide = ["sequence"].includes(cell.column.id);
  const isSemiNarrow = [
    "initialDenaturation",
    "finalExtension",
    "numberCycles",
    "end",
  ].includes(cell.column.id);
  return (
    <>
      {showEditModal?.row.id === cell.row.id &&
        showEditModal.id === cell.column.id && (
          <ConfirmModal
            title={`Do you want to change value from ${
              showEditModal.initialValue || "<empty>"
            } to ${showEditModal.newValue} ?`}
            onConfirm={async () => {
              await showEditModal.callback();
              setShowEditModal(null);
              toast.success("Field was edited successfully");
            }}
            onCancel={() => {
              showEditModal.setValue(showEditModal.initialValue);
            }}
            onHide={() => setShowEditModal(null)}
          />
        )}
      <input
        value={value}
        ref={inputRef}
        title={isOverflow ? value : ""}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={
          isNarrow
            ? "narrow"
            : isWide
            ? "wide"
            : isSemiWide
            ? "semi-wide"
            : isSemiNarrow
            ? "semi-narrow"
            : ""
        }
        {...props}
      />
    </>
  );
};

export const EditableNoConfirmCell: React.FC<any> = ({
  initialValue = "",
  row,
  cell,
  disabled = false,
  dbName = "extractions/",
  saveLast = () => {},
  maxChars = 22,
  ...props
}) => {
  const db = getDatabase();
  const [value, setValue] = useState(initialValue);
  const onChange = (e: any) => {
    setValue(e.target.value);
  };
  const onBlur = (e: any) => {
    if (
      (initialValue?.toString() || "") !== (e.target.value?.toString() || "")
    ) {
      update(ref(db, dbName + row.original.key), {
        [cell.column.id]: e.target.value,
      });
      saveLast({
        rowKey: row.original.key,
        cellId: cell.column.id,
        initialValue,
      });
    }
  };
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const inputRef = React.useRef();
  const isOverflow = useIsOverflow(inputRef);
  const isNarrow = [
    "cytB",
    "16S",
    "COI",
    "COII",
    "ITS1",
    "ITS2",
    "ELAV",
  ].includes(cell.column.id);
  return (
    <input
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      {...props}
      ref={inputRef}
      title={isOverflow ? value : ""}
      className={isNarrow ? "narrow" : ""}
    />
  );
};

export const SelectCell: React.FC<any> = ({
  initialValue = "",
  row,
  cell,
  options,
  saveLast = () => {},
  initialKey,
  maxChars = 22,
}) => {
  const db = getDatabase();
  const { original } = row;
  const [showEditModal, setShowEditModal] = useState(null);
  const [value, setValue] = React.useState(
    original[cell.column.id]
      ? { value: initialValue, label: initialValue }
      : null
  );
  const onChange = (value: any) => {
    setValue({ value: value.value, label: value.label });
    if ((initialValue?.toString() || "") !== (value.value?.toString() || "")) {
      setShowEditModal({
        row,
        newValue: value.value,
        id: cell.column.id,
        initialValue,
        setValue,
        callback: () => {
          console.log(value);
          update(ref(db, "extractions/" + row.original.key), {
            [cell.column.id]: value.value,
          });
          saveLast({
            rowKey: row.original.key,
            cellId: cell.column.id,
            initialValue: initialKey || initialValue,
            setValue: () =>
              setValue({ value: initialValue, label: initialValue }),
          });
        },
      });
    }
  };

  const inputRef = React.useRef();
  const isOverflow = useIsOverflow(inputRef);

  return (
    <>
      {showEditModal?.row.id === cell.row.id &&
        showEditModal.id === cell.column.id && (
          <ConfirmModal
            title={`Do you want to change value from ${
              initialValue || "<empty>"
            } to ${value.label} ?`}
            onConfirm={async () => {
              await showEditModal.callback();
              setShowEditModal(null);
              toast.success("Field was edited successfully");
            }}
            onCancel={() => {
              showEditModal.setValue({
                value: initialValue,
                label: initialValue,
              });
            }}
            onHide={() => setShowEditModal(null)}
          />
        )}
      <SelectInput
        options={options}
        value={value}
        onChange={onChange}
        isSearchable
        className="narrow"
        title={isOverflow ? value : ""}
        ref={inputRef}
      />
    </>
  );
};

export const CreatableSelectCell: React.FC<any> = ({
  initialValue = "",
  row,
  cell,
  options,
  dbName = "extractions/",
  saveLast = () => {},
  maxChars = 22,
}) => {
  const db = getDatabase();
  const { original } = row;
  const [showEditModal, setShowEditModal] = useState(null);
  const [value, setValue] = React.useState(
    original[cell.column.id]
      ? { value: initialValue, label: initialValue }
      : null
  );
  const onChange = (value: any) => {
    setValue({ value: value.value, label: value.label });
    if ((initialValue?.toString() || "") !== (value.value?.toString() || "")) {
      setShowEditModal({
        row,
        newValue: value.value,
        id: cell.column.id,
        initialValue,
        setValue,
        callback: () => {
          update(ref(db, dbName + row.original.key), {
            [cell.column.id]: value.value,
          });
          saveLast({
            rowKey: row.original.key,
            cellId: cell.column.id,
            initialValue,
          });
        },
      });
    }
  };
  const inputRef = React.useRef();
  const isOverflow = useIsOverflow(inputRef);
  return (
    <>
      {showEditModal?.row.id === cell.row.id &&
        showEditModal.id === cell.column.id && (
          <ConfirmModal
            title={`Do you want to change value from ${
              initialValue || "<empty>"
            } to ${value.label} ?`}
            onConfirm={async () => {
              await showEditModal.callback();
              setShowEditModal(null);
              toast.success("Field was edited successfully");
            }}
            onCancel={() => {
              showEditModal.setValue({
                value: initialValue,
                label: initialValue,
              });
            }}
            onHide={() => setShowEditModal(null)}
          />
        )}

      <CreatableSelectInput
        ref={inputRef}
        options={options}
        value={value}
        onChange={onChange}
        isSearchable
        className="narrow"
        title={isOverflow ? value : ""}
      />
    </>
  );
};
