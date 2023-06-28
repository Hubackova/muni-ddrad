import React from "react";
// import { UseFormRegister } from "react-hook-form";
import "./TextInput.scss";

type InputProps = {
  label: string;
  name: string;
  register: any; // UseFormRegister<any>;
  required?: string;
  disabled?: boolean;
  error?: string;
  type?: string;
  onBlur?: any;
  className?: string;
  validate?: any;
  maxLength?: any;
  step?: any;
};

const TextInput = ({
  disabled = false,
  label,
  name,
  register,
  validate,
  required,
  error,
  onBlur,
  maxLength,
  type = "text",
  step,
}: InputProps) => (
  <div className="input-container">
    <label className="label">{label}</label>

    <input
      className="input"
      type={type}
      step={step}
      disabled={disabled}
      {...register(name, {
        required,
        maxLength,
        onBlur,
        validate,
      })}
    />

    {!!error && <div className="error-message">{error}</div>}
  </div>
);

export default React.memo(TextInput);
