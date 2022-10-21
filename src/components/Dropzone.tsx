import React from "react";
import { useDropzone } from "react-dropzone";
import cx from "classnames";
import { ReactComponent as ImportIcon } from "../images/import.svg";
import "./Dropzone.scss";

interface DropzoneProps {
  onDropSuccess: any;
  label: string;
}

const Dropzone: React.FC<DropzoneProps> = ({ onDropSuccess, label = "import csv" }) => {
  const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
    onDrop: async (acceptedFiles: any) => {
      if (!acceptedFiles || !acceptedFiles.length) {
        console.error("wrong format");
      } else {
        onDropSuccess(acceptedFiles);
      }
    },
  });
  return (
    <div
      {...getRootProps({
        className: cx("dropzone", {
          accepted: isDragAccept,
          rejected: isDragReject,
        }),
      })}
    >
      <input {...getInputProps()} />
      <ImportIcon />
      <div className="dropzone-text">{label}</div>
    </div>
  );
};

export default Dropzone;
