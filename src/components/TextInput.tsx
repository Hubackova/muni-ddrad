import React from "react";
import { UseFormRegister } from "react-hook-form";
import "./TextInput.scss";

type InputProps = {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  type?: string;
  onBlur?: any;
};

const TextInput = ({
  disabled = false,
  label,
  name,
  register,
  required,
  error,
  onBlur,
  type = "text",
}: InputProps) => (
  <div className="container">
    <label className="label">{label}</label>

    <input
      className="input"
      type={type}
      {...register(name, { required, disabled, onBlur })}
    />

    {!!error && <div className="error-message">{error}</div>}
  </div>
);

export default React.memo(TextInput);
