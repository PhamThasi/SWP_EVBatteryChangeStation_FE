// src/pages/User/ProfileCar/ProfileCar.jsx
import React, { useState } from "react";
import * as Yup from "yup";
import ModalForm from "./../../../components/modalForm/ModalForm";
import noInfoCar from "./../../../assets/noInfoCar.jpeg";
import vf8 from "./../../../assets/VinFast-VF8-1.jpg";

const ProfileCar = () => {
  const [car, setCar] = useState({
    vehicleID: 1,
    model: "VinFast VF8",
    batteryType: "Lithium Iron Phosphate",
    producer: "VinFast",
    createDate: "2024-12-20",
    batteryLevel: 76,
  });

  const [isEditing, setIsEditing] = useState(false);

  // Cấu hình các field cho ModalForm
  const carFields = [
    { name: "model", label: "Model" },
    { name: "batteryType", label: "Loại pin" },
    { name: "producer", label: "Hãng sản xuất" },
    { name: "batteryLevel", label: "Mức pin (%)", type: "number" },
  ];

  // Schema validate cho form
  const carSchema = Yup.object().shape({
    model: Yup.string().required("Không được để trống"),
    batteryType: Yup.string().required("Phải nhập loại pin"),
    producer: Yup.string().required("Phải nhập hãng sản xuất"),
    batteryLevel: Yup.number()
      .min(0, "Pin phải >= 0")
      .max(100, "Pin không quá 100")
      .required("Phải nhập mức pin"),
  });

  const handleUpdate = (values) => {
    setCar(values);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#001f54] to-[#0077b6] flex items-center justify-center p-10 font-[Inter]">
      {car ? (
        /* --- Nếu đã có xe --- */
        <div className="bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row items-center p-10 w-[100rem] h-[60rem]">
          {/* Ảnh xe */}
          <div className="flex-1 flex justify-center">
            <img
              src={vf8}
              alt="Car"
              className="rounded-2xl w-[45rem] h-[30rem] object-cover shadow-lg"
            />
          </div>

          {/* Thông tin xe */}
          <div className="flex-1 text-gray-800 mt-8 md:mt-0 md:ml-10 text-3xl">
            <h2 className="text-5xl font-bold text-[#001f54] mb-4">
              {car.model}
            </h2>

            <div className="space-y-3 text-4xl">
              <p>
                <span className="font-semibold text-[#0077b6]">🚗 Model:</span>{" "}
                {car.model}
              </p>
              <p>
                <span className="font-semibold text-[#0077b6]">Loại pin:</span>{" "}
                {car.batteryType}
              </p>
              <p>
                <span className="font-semibold text-[#0077b6]">
                  Hãng sản xuất:
                </span>{" "}
                {car.producer}
              </p>
              <p>
                <span className="font-semibold text-[#0077b6]">Ngày tạo:</span>{" "}
                {car.createDate}
              </p>
            </div>

            {/* Thanh pin */}
            <div className="mt-6">
              <p className="font-semibold mb-2 text-[#001f54]">
                Tình trạng pin hiện tại
              </p>
              <div className="w-full bg-gray-200 h-6 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    car.batteryLevel > 60
                      ? "bg-green-500"
                      : car.batteryLevel > 30
                      ? "bg-yellow-400"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${car.batteryLevel}%` }}
                ></div>
              </div>
              <p className="text-right mt-1 text-xl font-medium text-[#0077b6]">
                {car.batteryLevel}%
              </p>
            </div>

            {/* Nút thao tác */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-[#0077b6] text-white px-5 py-2 rounded-xl hover:bg-[#0096c7] transition"
              >
                Cập nhật thông tin
              </button>
              <button className="bg-gray-200 text-gray-800 px-5 py-2 rounded-xl hover:bg-gray-300 transition">
                Xem lịch sử
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* --- Nếu chưa có xe --- */
        <div className="flex flex-col items-center bg-white rounded-3xl p-10 shadow-2xl w-[90rem] h-[65rem] text-center justify-center">
          <h1 className="text-2xl font-bold text-[#001f54] mb-3 mt-3 uppercase">
            Chưa có thông tin xe
          </h1>
          <img
            src={noInfoCar}
            alt="No car info"
            className="w-[75rem] rounded-2xl opacity-70 mb-6"
          />
          <p className="text-gray-600 text-xxl mb-3">
            Vui lòng thêm xe của bạn để bắt đầu sử dụng dịch vụ đổi pin.
          </p>
          <button className=" bg-[#0077b6] text-white px-6 py-3 rounded-xl hover:bg-[#0096c7] transition">
            + Thêm xe mới
          </button>
        </div>
      )}

      {/* Modal Form cập nhật */}
      {isEditing && (
        <ModalForm
          title="Cập nhật thông tin xe"
          initialValues={car}
          validationSchema={carSchema}
          fields={carFields}
          onSubmit={handleUpdate}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};

export default ProfileCar;
