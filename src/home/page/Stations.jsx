import VietMapPlaces from "@/components/MapAPI/VietMapPlaces";
import React, { useState } from "react";

const Stations = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm);
  };

  return (
    <div className="w-full min-h-screen bg-white px-6 py-10">
      {/* 🔍 Search box */}
      <div className="flex justify-center mb-20 mt-36">
        <form
          onSubmit={handleSearchSubmit}
          className="flex w-full max-w-5xl border border-gray-300 rounded-full overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-400"
        >
          <input
            type="text"
            placeholder="Tìm kiếm trạm đổi pin, ví dụ: Cần Thơ, Vĩnh Long..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="flex-grow px-6 py-3 outline-none text-gray-700"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-medium transition"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* 🗺️ Bản đồ trạm */}
      <div className="w-full flex justify-center">
        <div className="w-[120rem] max-w-full">
          <VietMapPlaces searchTerm={searchTerm} />
        </div>
      </div>
    </div>
  );
};

export default Stations;
