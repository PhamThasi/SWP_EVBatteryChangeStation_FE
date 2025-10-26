import React from "react";

const InfoField = ({
  label,
  value,
  isEditing,
  onChange,
  type = "text",
  name,
}) => {
  const displayValue = value || ""; // Fallback to empty string if value is null/undefined
  
  return (
    <div>
      <h2 className="text-gray-400 text-sm font-medium mb-2">{label}</h2>
      {isEditing && onChange ? (
        <input
          type={type}
          value={displayValue}
          onChange={(event) => onChange(name, event.target.value)}
          className="font-semibold text-gray-800 border-b border-gray-300 focus:outline-none focus:border-gray-500 w-full"
        />
      ) : (
        <p className="font-semibold text-gray-800 break-all">{displayValue || "Chưa cập nhật"}</p>
      )}
    </div>
  );
};

export default InfoField;
