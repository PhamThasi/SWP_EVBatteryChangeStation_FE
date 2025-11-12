import React, { useState, useEffect, useCallback } from "react";
import vf8 from "@/assets/VinFast-VF8-1.jpg";
import noInfoCar from "@/assets/noInfoCar.jpeg";
import carService from "@/api/carService";

const ProfileCar = () => {
  const [carList, setCarList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cars từ API
  const fetchCars = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cars = await carService.getAllCars();
      
      // Transform API data to UI format
      // API returns: vehicleId, model, batteryType, producer, createDate, images, status
      // UI expects: id, model, batteryType, producer, createDate, batteryLevel, shared, images
      const transformedCars = cars.map((car) => ({
        id: car.vehicleId,
        model: car.model,
        batteryType: car.batteryType,
        producer: car.producer,
        createDate: car.createDate ? car.createDate.split('T')[0] : new Date().toISOString().split("T")[0], // Format date
        batteryLevel: Math.floor(Math.random() * 41) + 30, // Random battery level 30-70 for demo
        status: car.status,
        images: car.images, // Lấy ảnh từ API
        shared: false, // Default value for shared flag
      }));
      
      setCarList(transformedCars);
    } catch (err) {
      console.error("Error fetching cars:", err);
      setError("Không thể tải danh sách xe. Vui lòng thử lại.");
      setCarList([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch cars khi component mount
  useEffect(() => {
    fetchCars();
  }, [fetchCars]);


  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#001f54] to-[#0077b6] flex flex-col items-center py-10 font-[Roboto]">
      <h1 className="text-white text-4xl font-bold mb-8 uppercase">
        Danh sách các xe điện được hỗ trợ đổi pin
      </h1>

      {/* Loading indicator */}
      {loading && carList.length === 0 && (
        <div className="text-white text-xl">Đang tải...</div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-500 text-white px-6 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

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
          <p className="text-gray-600 text-lg">
            Chưa có xe nào được hỗ trợ đổi pin tại thời điểm này.
          </p>
        </div>
      )}

      {/* Nếu có xe */}
      {carList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-[90%]">
          {carList.map((car) => (
            <div 
              key={car.id} 
              className="bg-white rounded-2xl shadow-2xl p-6 hover:shadow-3xl transition-all duration-300 flex flex-col transform hover:-translate-y-2 hover:scale-105 cursor-pointer group"
            >
                <div className="overflow-hidden rounded-xl mb-4 bg-gray-100">
                <img
                  src={car.images || vf8}
                  alt={car.model || "Car"}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    // Nếu ảnh từ API lỗi, fallback về ảnh mặc định
                    if (e.target.src !== vf8) {
                      e.target.src = vf8;
                    } else {
                      // Nếu cả ảnh mặc định cũng lỗi, dùng noInfoCar
                      e.target.src = noInfoCar;
                    }
                  }}
                />
              </div>
              <h2 className="text-2xl font-bold text-[#001f54] mb-2 group-hover:text-[#0077b6] transition-colors duration-300">
                {car.model}
              </h2>
              <p className="text-gray-700 group-hover:text-gray-900 transition-colors duration-300">Loại pin: {car.batteryType}</p>
              <p className="text-gray-700 group-hover:text-gray-900 transition-colors duration-300">Hãng: {car.producer}</p>
              {car.shared && (
                <p className="text-sm text-[#0077b6] italic">
                  🔗 Được chia sẻ bởi {car.sharedBy}
                </p>
              )}
            </div>
          ))}
        </div>
      )}


    </div>
  );
};

export default ProfileCar;