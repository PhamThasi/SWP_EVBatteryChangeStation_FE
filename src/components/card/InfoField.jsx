import React from "react";

const InfoField = ({
  label,
  value,
  isEditing,
  onChange,
  type = "text",
  name,
  placeholder,
  error,
  ...props
}) => {
  const displayValue = value || ""; // Fallback to empty string if value is null/undefined
  
  return (
    <div>
      <h2 className="text-gray-400 text-sm font-medium mb-2">{label}</h2>
      {isEditing && onChange ? (
        <div>
          <input
            type={type}
            value={displayValue}
            onChange={(event) => onChange(name, event.target.value)}
            placeholder={placeholder}
            className={`font-semibold text-gray-800 border-b ${
              error 
                ? "border-red-500 focus:border-red-600" 
                : "border-gray-300 focus:border-gray-500"
            } focus:outline-none w-full`}
            {...props}
          />
          {error && (
            <p className="text-red-500 text-xl mt-1">* {error}</p>
          )}
        </div>
      ) : (
        <p className="font-semibold text-gray-800 break-all">{displayValue || "Chưa cập nhật"}</p>
      )}
    </div>
  );
};

export default InfoField;
