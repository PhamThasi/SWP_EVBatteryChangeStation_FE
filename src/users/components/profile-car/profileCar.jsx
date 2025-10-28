import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import ModalForm from "@/components/modalForm/ModalForm";
import vf8 from "@/assets/VinFast-VF8-1.jpg";
import noInfoCar from "@/assets/noInfoCar.jpeg";

const ProfileCar = () => {
  const [carList, setCarList] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  // Schema validate cho form tạo xe
  const carSchema = Yup.object().shape({
    model: Yup.string().required("Không được để trống"),
    batteryType: Yup.string().required("Phải nhập loại pin"),
    producer: Yup.string().required("Phải nhập hãng sản xuất"),
    batteryLevel: Yup.number()
      .min(0, "Pin phải >= 0")
      .max(100, "Pin không quá 100")
      .required("Phải nhập mức pin"),
  });

  const carFields = [
    { name: "model", label: "Model", placeholder: "Nhập model xe" },
    { name: "batteryType", label: "Loại pin", placeholder: "Nhập loại pin" },
    { name: "producer", label: "Hãng sản xuất", placeholder: "Nhập hãng sản xuất" },
    { name: "batteryLevel", label: "Mức pin (%)", type: "number", placeholder: "Nhập mức pin (0-100)" },
  ];

  // Fake data ban đầu
  useEffect(() => {
    setCarList([
      {
        id: 1,
        model: "VinFast VF8",
        batteryType: "Lithium-ion",
        producer: "VinFast",
        batteryLevel: 76,
        createDate: "2024-12-20",
        shared: false,
      },
      {
        id: 2,
        model: "BYD Atto 3",
        batteryType: "LFP",
        producer: "BYD",
        batteryLevel: 50,
        createDate: "2025-01-02",
        shared: true,
        sharedBy: "Nguyen Van B",
      },
    ]);
  }, []);

  // Initial values cho form tạo xe
  const initialCarValues = {
    model: "",
    batteryType: "",
    producer: "",
    batteryLevel: "",
  };

  // Thêm xe mới
  const handleCreateCar = (values) => {
    console.log("Creating car with values:", values);
    const newCar = {
      id: Date.now(),
      ...values,
      batteryLevel: Number(values.batteryLevel), // Convert to number
      createDate: new Date().toISOString().split("T")[0],
      shared: false,
    };
    setCarList([...carList, newCar]);
    setShowCreateForm(false);
    alert("✅ Thêm xe mới thành công!");
  };

  // Đặt lịch đổi pin
  const handleBooking = (car) => {
    setSelectedCar(car);
    setShowBooking(true);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#001f54] to-[#0077b6] flex flex-col items-center py-10 font-[Roboto]">
      <h1 className="text-white text-4xl font-bold mb-8 uppercase">
        Xe của tôi
      </h1>

      {/* Nếu chưa có xe */}
      {carList.length === 0 && (
        <div className="flex flex-col items-center justify-center bg-white rounded-3xl p-10 shadow-2xl w-[90%] h-[65rem] text-center">
          <h1 className="text-2xl font-bold text-[#001f54] mb-3 mt-3 uppercase">
            Chưa có thông tin xe
          </h1>
          <img src={noInfoCar} alt="No car info" className="w-[75rem] rounded-2xl opacity-70 mb-6" />
          <p className="text-gray-600 text-xxl mb-3">
            Vui lòng thêm xe của bạn để bắt đầu sử dụng dịch vụ đổi pin.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className=" bg-[#0077b6] text-white px-6 py-3 rounded-xl hover:bg-[#0096c7] transition"
          >
            + Thêm xe mới
          </button>
        </div>
      )}

      {/* Nếu có xe */}
      {carList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-[90%]">
          {carList.map((car) => (
            <div key={car.id} className="bg-white rounded-2xl shadow-2xl p-6 hover:shadow-3xl transition flex flex-col">
              <img
                src={vf8}
                alt="Car"
                className="rounded-xl w-full h-48 object-cover mb-4"
              />
              <h2 className="text-2xl font-bold text-[#001f54] mb-2">
                {car.model}
              </h2>
              <p className="text-gray-700">Loại pin: {car.batteryType}</p>
              <p className="text-gray-700">Hãng: {car.producer}</p>
              <p className="text-gray-700">Ngày tạo: {car.createDate}</p>
              {car.shared && (
                <p className="text-sm text-[#0077b6] italic">
                  🔗 Được chia sẻ bởi {car.sharedBy}
                </p>
              )}

              {/* Battery bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
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
                <p className="text-right text-sm text-[#0077b6] mt-1">
                  {car.batteryLevel}%
                </p>
              </div>

              {/* Buttons */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => handleBooking(car)}
                  className="bg-[#00b894] text-white px-4 py-2 rounded-xl hover:bg-[#009874] transition"
                >
                  Đặt lịch đổi pin
                </button>
                <button
                  onClick={() => alert("Cập nhật xe đang phát triển")}
                  className="text-[#0077b6] font-semibold"
                >
                  Sửa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nút thêm xe */}
      {carList.length > 0 && (
        <button
          onClick={() => setShowCreateForm(true)}
          className="mt-10 bg-white text-[#0077b6] font-bold px-6 py-3 rounded-2xl hover:bg-[#e0f7ff] transition"
        >
          + Thêm xe mới
        </button>
      )}

      {/* Modal Form thêm xe */}
      {showCreateForm && (
        <ModalForm
          title="Thêm xe mới"
          initialValues={initialCarValues}
          fields={carFields}
          validationSchema={carSchema}
          onSubmit={handleCreateCar}
          onClose={() => setShowCreateForm(false)}
        />
      )}

      {/* Modal Booking */}
      {showBooking && selectedCar && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white rounded-3xl p-8 shadow-2xl w-[35rem]">
            <h2 className="text-2xl font-bold text-[#001f54] mb-4">
              Đặt lịch cho {selectedCar.model}
            </h2>
            <p className="text-gray-700 mb-2">Hãng: {selectedCar.producer}</p>
            <p className="text-gray-700 mb-4">Loại pin: {selectedCar.batteryType}</p>
            <label className="block text-sm font-medium mb-1 text-[#001f54]">
              Chọn ngày đổi pin
            </label>
            <input type="date" className="border p-2 rounded-lg w-full mb-3" />
            <label className="block text-sm font-medium mb-1 text-[#001f54]">
              Chọn trạm đổi pin
            </label>
            <select className="border p-2 rounded-lg w-full mb-4">
              <option>Station A</option>
              <option>Station B</option>
              <option>Station C</option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBooking(false)}
                className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  alert(`Đã đặt lịch đổi pin cho ${selectedCar.model}`);
                  setShowBooking(false);
                }}
                className="px-4 py-2 bg-[#00b894] text-white rounded-xl hover:bg-[#009874]"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCar;