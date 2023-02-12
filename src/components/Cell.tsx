// @ts-nocheck

import { getDatabase, ref, update } from "firebase/database";
import React, { useState } from "react";
import { toast } from "react-toastify";
import ConfirmModal from "./ConfirmModal";
import CreatableSelectInput from "./CreatableSelectInput";
import SelectInput from "./SelectInput";

export const customComparator = (prevProps, nextProps) => {
  return nextProps.value === prevProps.value;
};

export const customLocalityComparator = (prevProps, nextProps) => {
  return (
    nextProps.value === prevProps.value &&
    prevProps.row.original.localityCode === nextProps.row.original.localityCode
  );
};

export const DateCell: React.FC<any> = ({ initialValue, row, cell }) => {
  const db = getDatabase();
  const [showEditModal, setShowEditModal] = useState(null);
  const [value, setValue] = React.useState(initialValue);
  const onChange = (e: any) => {
    setValue(e.target.value);
    if (initialValue !== e.target.value) {
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
      <input value={value} onChange={onChange} type="date" />
    </>
  );
};

export const EditableCell: React.FC<any> = ({
  initialValue,
  row,
  cell,
  disabled = false,
  dbName = "extractions/",
  ...props
}) => {
  const db = getDatabase();
  const [showEditModal, setShowEditModal] = useState(null);
  const [value, setValue] = useState(initialValue);
  const onChange = (e: any) => {
    setValue(e.target.value);
  };
  const onBlur = (e: any) => {
    if (initialValue.toString() !== e.target.value.toString()) {
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
        onBlur={onBlur}
        disabled={disabled}
        {...props}
      />
    </>
  );
};

export const SelectCell: React.FC<any> = ({
  initialValue,
  row,
  cell,
  options,
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
    if (initialValue !== value.value) {
      setShowEditModal({
        row,
        newValue: value.value,
        id: cell.column.id,
        initialValue,
        setValue,
        callback: () => {
          update(ref(db, "extractions/" + row.original.key), {
            [cell.column.id]: value.value,
          });
        },
      });
    }
  };

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
      />
    </>
  );
};

export const CreatableSelectCell: React.FC<any> = ({
  initialValue,
  row,
  cell,
  options,
  dbName = "extractions/",
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
    if (initialValue !== value.value) {
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
        },
      });
    }
  };

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
        options={options}
        value={value}
        onChange={onChange}
        isSearchable
        className="narrow"
      />
    </>
  );
};
