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
};

const TextInput = ({
  disabled = false,
  label,
  name,
  register,
  required,
  error,
  type = "text",
}: InputProps) => (
  <div className="container">
    <label className="label">{label}</label>

    <input
      className="input"
      type={type}
      {...register(name, { required, disabled })}
    />

    {!!error && <div className="error-message">{error}</div>}
  </div>
);

export default React.memo(TextInput);
