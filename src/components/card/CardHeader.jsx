import React from "react";
import EditingButton from "../Button_Editting/EditingButton";

const CardHeader = ({ title, isEditing, onEdit, onCancel }) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
        <div className="flex gap-2 ">
          {isEditing && (
            <EditingButton variant="secondary" onClick={onCancel}>
              Cancel
            </EditingButton>
          )}
          <EditingButton variant="primary" onClick={onEdit}>
            {isEditing ? "Save" : "Edit"}
          </EditingButton>
        </div>
      </div>
      <hr className="mb-6 border-gray-200" />
    </>
  );
};

export default CardHeader;
