// src/components/common/ModalForm.jsx
import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const ModalForm = ({
  title,
  initialValues,
  validationSchema,
  onSubmit,
  onClose,
  fields,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-[50rem]">
        <h3 className="text-3xl font-bold mb-6 text-[#001f54]">{title}</h3>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values, actions) => {
            onSubmit(values);
            actions.setSubmitting(false);
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-5 text-2xl">
              {fields.map((f) => (
                <div key={f.name}>
                  <label
                    htmlFor={f.name}
                    className="block font-semibold mb-2 text-[#0077b6]"
                  >
                    {f.label}
                  </label>
                  <Field
                    name={f.name}
                    type={f.type || "text"}
                    as={f.as || "input"}
                    className="border w-full p-3 rounded-xl focus:ring-2 focus:ring-[#0077b6] focus:outline-none"
                    placeholder={f.placeholder || ""}
                  />
                  <ErrorMessage
                    name={f.name}
                    component="div"
                    className="text-red-500 text-base mt-1"
                  />
                </div>
              ))}

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-300 text-black px-4 py-2 rounded-xl hover:bg-gray-400 transition"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#0077b6] text-white px-4 py-2 rounded-xl hover:bg-[#0096c7] transition disabled:opacity-50"
                >
                  {isSubmitting ? "Đang lưu" : "Lưu"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ModalForm;
