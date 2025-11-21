import React, { useEffect, useState } from "react";
import carService from "@/api/carService";
import { notifySuccess, notifyError } from "@/components/notification/notification";
import { Car, Plus, Search, Edit, Trash2, X } from "lucide-react";

const AdminCarManagement = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    vehicleId: "",
    model: "",
    batteryType: "",
    producer: "",
    images: "",
    createDate: "",
    status: "Available",
  });

  const extractMessage = (error, fallback) =>
    error?.response?.data?.message || error?.message || fallback;

  const resolveMessage = (result, fallback) =>
    result?.message || result?.data?.message || fallback;

  // Fetch all cars
  const fetchCars = async () => {
    try {
      setLoading(true);
      const data = await carService.getAllCars();
      setCars(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching cars:", error);
      notifyError(extractMessage(error, "Không thể tải danh sách xe!"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  // Reset form
  const resetForm = () => {
    setForm({
      vehicleId: "",
      model: "",
      batteryType: "",
      producer: "",
      images: "",
      createDate: "",
      status: "Available",
    });
  };

  // Open modal for create
  const handleCreate = () => {
    resetForm();
    setIsEditing(false);
    setShowModal(true);
  };

  // Open modal for edit
  const handleEdit = (car) => {
    setForm({
      vehicleId: car.vehicleId || "",
      model: car.model || "",
      batteryType: car.batteryType || "",
      producer: car.producer || "",
      images: car.images || "",
      createDate: car.createDate
        ? car.createDate.split("T")[0] + "T" + car.createDate.split("T")[1]?.substring(0, 5)
        : "",
      status: car.status || "Available",
    });
    setIsEditing(true);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    resetForm();
    setIsEditing(false);
  };

  // Handle form submit (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditing) {
        const updateData = {
          model: form.model,
          batteryType: form.batteryType,
          producer: form.producer,
          images: form.images || null,
          createDate: form.createDate
            ? new Date(form.createDate).toISOString()
            : new Date().toISOString(),
          status: form.status,
        };
        const result = await carService.updateCar(form.vehicleId, updateData);
        notifySuccess(resolveMessage(result, "Cập nhật thông tin xe thành công!"));
      } else {
        const createData = {
          model: form.model,
          batteryType: form.batteryType,
          producer: form.producer,
          images: form.images || null,
          createDate: form.createDate
            ? new Date(form.createDate).toISOString()
            : new Date().toISOString(),
          status: form.status,
        };
        const result = await carService.createCar(createData);
        notifySuccess(resolveMessage(result, "Tạo xe mới thành công!"));
      }

      await fetchCars();
      closeModal();
    } catch (error) {
      console.error("Error saving car:", error);
      notifyError(
        extractMessage(
          error,
          isEditing ? "Cập nhật thất bại!" : "Tạo xe thất bại!"
        )
      );
    }
  };

  // Handle delete
  const handleDelete = async (vehicleId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa xe này?")) return;

    try {
      const result = await carService.deleteCar(vehicleId);
      notifySuccess(resolveMessage(result, "Xóa xe thành công!"));
      await fetchCars();
    } catch (error) {
      console.error("Error deleting car:", error);
      notifyError(extractMessage(error, "Xóa xe thất bại!"));
    }
  };

  // Filter cars by search
  const filteredCars = cars.filter(
    (car) =>
      car.model?.toLowerCase().includes(search.toLowerCase()) ||
      car.producer?.toLowerCase().includes(search.toLowerCase()) ||
      car.batteryType?.toLowerCase().includes(search.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    const normalized = (status || "").toLowerCase();
    if (normalized.includes("available") || normalized.includes("sẵn sàng")) {
      return "bg-green-100 text-green-800 border-green-200";
    }
    if (normalized.includes("unavailable") || normalized.includes("không")) {
      return "bg-red-100 text-red-800 border-red-200";
    }
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Car className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Quản lý xe điện</h1>
        </div>
        <p className="text-gray-600 text-lg ml-14">Quản lý thông tin các dòng xe điện trong hệ thống</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo model, hãng sản xuất, loại pin..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Thêm xe mới
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          {/* Cars Grid - ĐÃ TĂNG KÍCH THƯỚC + TEXT LỚN HƠN */}
          {filteredCars.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                {search ? "Không tìm thấy xe nào phù hợp" : "Chưa có xe nào trong hệ thống"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
              {filteredCars.map((car) => (
                <div
                  key={car.vehicleId}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden group transform hover:-translate-y-1"
                  style={{ minHeight: "440px" }} // Tăng thêm 20px để chứa text lớn
                >
                  {/* Car Image */}
                  <div className="relative h-56 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
                    {car.images ? (
                      <img
                        src={car.images}
                        alt={car.model}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={`${car.images ? "hidden" : "flex"} items-center justify-center w-full h-full`}
                    >
                      <Car className="w-24 h-24 text-blue-400" />
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-bold border-2 shadow-sm ${getStatusBadgeClass(
                          car.status
                        )}`}
                      >
                        {car.status || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Car Info - TEXT LỚN HƠN */}
                  <div className="p-6">
                    {/* TÊN MODEL: text-4xl */}
                    <h3 className="text-4xl font-bold text-gray-900 mb-4 line-clamp-1">
                      {car.model || "N/A"}
                    </h3>

                    {/* THÔNG TIN: text-2xl */}
                    <div className="space-y-4 text-2xl text-gray-700 mb-6">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900">Hãng:</span>
                        <span className="truncate font-medium">{car.producer || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900">Pin:</span>
                        <span className="font-medium">{car.batteryType || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900">Tạo:</span>
                        <span className="font-medium">{formatDate(car.createDate)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleEdit(car)}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 px-5 py-3 rounded-xl font-semibold transition-all shadow-sm hover:shadow text-lg"
                      >
                        <Edit className="w-5 h-5" />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(car.vehicleId)}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-600 px-5 py-3 rounded-xl font-semibold transition-all shadow-sm hover:shadow text-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal - Giữ nguyên */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {isEditing ? "Chỉnh sửa thông tin xe" : "Thêm xe mới"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    placeholder="VD: VinFast VF8"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Hãng sản xuất <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.producer}
                    onChange={(e) => setForm({ ...form, producer: e.target.value })}
                    placeholder="VD: VinFast"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Loại pin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.batteryType}
                    onChange={(e) => setForm({ ...form, batteryType: e.target.value })}
                    placeholder="VD: Lithium-ion"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Trạng thái <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    URL hình ảnh
                  </label>
                  <input
                    type="url"
                    value={form.images}
                    onChange={(e) => setForm({ ...form, images: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Ngày tạo
                  </label>
                  <input
                    type="datetime-local"
                    value={form.createDate}
                    onChange={(e) => setForm({ ...form, createDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  {isEditing ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCarManagement;