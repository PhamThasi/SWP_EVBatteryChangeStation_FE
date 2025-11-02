// src/components/modalForm/ModalForm.jsx
import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";

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
      <div className="bg-white p-8 rounded-2xl shadow-lg w-[50rem] max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        <h3 className="text-3xl font-bold mb-6 text-[#001f54]">{title}</h3>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, actions) => {
            try {
              await onSubmit(values);
            } catch (error) {
              console.error("Form submission error:", error);
            } finally {
              actions.setSubmitting(false);
            }
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
                  {f.as === "select" ? (
                    <Field
                      name={f.name}
                      as="select"
                      className="border w-full p-3 rounded-xl focus:ring-2 focus:ring-[#0077b6] focus:outline-none"
                    >
                      {f.options?.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </Field>
                  ) : f.type === "radio" ? (
                    <div className="space-y-2">
                      {f.options?.map((option, index) => (
                        <label key={index} className="flex items-center">
                          <Field
                            name={f.name}
                            type="radio"
                            value={option.value}
                            className="mr-2"
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  ) : f.as === "textarea" ? (
                    <Field
                      name={f.name}
                      as="textarea"
                      rows={f.rows || 4}
                      className="border w-full p-3 rounded-xl focus:ring-2 focus:ring-[#0077b6] focus:outline-none resize-none"
                      placeholder={f.placeholder || ""}
                    />
                  ) : (
                    <Field
                      name={f.name}
                      type={f.type || "text"}
                      className="border w-full p-3 rounded-xl focus:ring-2 focus:ring-[#0077b6] focus:outline-none"
                      placeholder={f.placeholder || ""}
                    />
                  )}
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
                  disabled={isSubmitting}
                  className="bg-gray-300 text-black px-4 py-2 rounded-xl hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#0077b6] text-white px-4 py-2 rounded-xl hover:bg-[#0096c7] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu"}
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