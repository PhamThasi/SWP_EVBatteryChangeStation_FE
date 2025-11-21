import Card from "@/components/card/Card";
import CardHeader from "@/components/card/CardHeader";
import InfoField from "@/components/card/InfoField";
import { useMemo, useState, useEffect } from "react";
import { Info } from "lucide-react";

const PersonalInfoCard = ({
  profile,
  tempProfile,
  isEditing,
  onEdit,
  onCancel,
  onChange,
}) => {
  const { gender, dateOfBirth, email, phoneNumber, role, } =
    isEditing ? tempProfile : profile;

  const [errors, setErrors] = useState({});

  // Reset errors when editing mode changes
  useEffect(() => {
    if (!isEditing) {
      setErrors({});
    }
  }, [isEditing]);

  console.log(
    "PersonalInfoCard - profile data:",
    isEditing ? tempProfile : profile
  );

  const displayFullName = useMemo(() => {
    return (isEditing ? tempProfile.fullName : profile.fullName) || "";
  }, [isEditing, tempProfile.fullName, profile.fullName]);

  // Format date to YYYY-MM-DD for date input
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };

  // Format date from input to YYYY-MM-DD
  const formatDateFromInput = (dateString) => {
    if (!dateString) return "";
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    // Try to parse various formats
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return dateString;
    }
  };

  // Validate phone number (exactly 10 digits)
  const validatePhoneNumber = (phone) => {
    if (!phone || phone.trim() === "") return "";
    const cleaned = phone.replace(/\D/g, ""); // Remove non-digits
    if (cleaned.length > 0 && cleaned.length !== 10) {
      return "Số điện thoại phải có đúng 10 chữ số (ví dụ: 0912345678)";
    }
    return "";
  };

  // Validate date of birth
  const validateDateOfBirth = (date) => {
    if (!date || date.trim() === "") return "";
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return "Ngày sinh không hợp lệ. Vui lòng nhập theo định dạng YYYY-MM-DD hoặc chọn từ lịch";
      }
      const now = new Date();
      if (dateObj > now) {
        return "Ngày sinh không thể lớn hơn ngày hiện tại";
      }
      return "";
    } catch {
      return "Ngày sinh không hợp lệ";
    }
  };

  const handleDateChange = (value) => {
    const formatted = formatDateFromInput(value);
    onChange("dateOfBirth", formatted);
    // Only validate if user has entered something
    if (value) {
      const error = validateDateOfBirth(formatted);
      setErrors((prev) => ({ ...prev, dateOfBirth: error }));
    } else {
      setErrors((prev) => ({ ...prev, dateOfBirth: "" }));
    }
  };

  const handlePhoneChange = (value) => {
    // Only allow digits
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 10) {
      onChange("phoneNumber", cleaned);
      // Only validate if user has entered something
      if (cleaned.length > 0) {
        const error = validatePhoneNumber(cleaned);
        setErrors((prev) => ({ ...prev, phoneNumber: error }));
      } else {
        setErrors((prev) => ({ ...prev, phoneNumber: "" }));
      }
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader
        title="Personal Information"
        isEditing={isEditing}
        onEdit={onEdit}
        onCancel={onCancel}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoField
          label="Full Name"
          value={displayFullName}
          isEditing={isEditing}
          onChange={onChange}
          name="fullName"
          placeholder="Nhập họ và tên đầy đủ"
          error={errors.fullName}
        />

        <InfoField
          label="Gender"
          value={gender}
          isEditing={isEditing}
          onChange={onChange}
          name="gender"
          placeholder="Nhập giới tính (Nam/Nữ/Khác)"
          error={errors.gender}
        />

        <div>
          <h2 className="text-gray-400 text-sm font-medium mb-2">Date of Birth</h2>
          {isEditing ? (
            <div>
              <input
                type="date"
                value={formatDateForInput(dateOfBirth)}
                onChange={(e) => handleDateChange(e.target.value)}
                className={`font-semibold text-gray-800 border-b ${
                  errors.dateOfBirth 
                    ? "border-red-500 focus:border-red-600" 
                    : "border-gray-300 focus:border-gray-500"
                } focus:outline-none w-full`}
              />
              <p className="text-red-500 text-sm font-medium mt-1 flex items-center gap-1">
                <Info className="w-4 h-4" />
                Gợi ý: Nhập theo định dạng YYYY-MM-DD (ví dụ: 1990-01-15) hoặc chọn từ lịch
              </p>
              {errors.dateOfBirth && (
                <p className="text-red-500 text-xl mt-1">* {errors.dateOfBirth}</p>
              )}
            </div>
          ) : (
            <p className="font-semibold text-gray-800 break-all">
              {dateOfBirth || "Chưa cập nhật"}
            </p>
          )}
        </div>

        <InfoField
          label="Email Address"
          value={email}
          isEditing={isEditing}
          onChange={onChange}
          name="email"
          type="email"
          placeholder="Nhập địa chỉ email (ví dụ: example@email.com)"
          error={errors.email}
        />

        <div>
          <h2 className="text-gray-400 text-sm font-medium mb-2">Phone Number</h2>
          {isEditing ? (
            <div>
              <input
                type="tel"
                value={phoneNumber || ""}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="Nhập số điện thoại (10 chữ số)"
                maxLength={10}
                className={`font-semibold text-gray-800 border-b ${
                  errors.phoneNumber 
                    ? "border-red-500 focus:border-red-600" 
                    : "border-gray-300 focus:border-gray-500"
                } focus:outline-none w-full`}
              />
              <p className="text-red-500 text-sm font-medium mt-1 flex items-center gap-1">
                <Info className="w-4 h-4" />
                Số điện thoại phải có đúng 10 chữ số (ví dụ: 0912345678)
              </p>
              {errors.phoneNumber && (
                <p className="text-red-500 text-xl mt-1">* {errors.phoneNumber}</p>
              )}
            </div>
          ) : (
            <p className="font-semibold text-gray-800 break-all">
              {phoneNumber || "Chưa cập nhật"}
            </p>
          )}
        </div>

        <InfoField label="User Role" value={role} />

        {/* 🟡 Thêm field mật khẩu */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-3">
          <label className="block text-gray-700 font-semibold mb-1">
            Mật khẩu <span className="text-red-500">*</span>
          </label>
          <input
            type={isEditing ? "text" : "password"}
            name="password"
            className={`border rounded-xl px-4 py-2 w-full outline-none ${
              errors.password
                ? "border-red-500 focus:ring-2 focus:ring-red-300"
                : isEditing
                ? "border-orange-400 focus:ring-2 focus:ring-orange-300"
                : "border-gray-300 bg-gray-100 cursor-not-allowed"
            }`}
            placeholder={
              isEditing ? "Nhập mật khẩu mới (bắt buộc)" : "••••••••"
            }
            value={
              isEditing
                ? tempProfile.password || ""
                : profile.password
                ? "••••••••"
                : ""
            }
            onChange={(e) => {
              onChange("password", e.target.value);
              // Validate password in real-time
              if (isEditing) {
                const password = e.target.value;
                if (!password || password.trim() === "") {
                  setErrors((prev) => ({ ...prev, password: "Mật khẩu là bắt buộc để cập nhật thông tin" }));
                } else {
                  setErrors((prev) => ({ ...prev, password: "" }));
                }
              }
            }}
            disabled={!isEditing}
          />
          {isEditing && (
            <p className="text-red-500 text-sm font-medium mt-1 flex items-center gap-1">
              <Info className="w-4 h-4" />
              Mật khẩu là bắt buộc để cập nhật thông tin. Vui lòng nhập mật khẩu mới.
            </p>
          )}
          {errors.password && (
            <p className="text-red-500 text-xl mt-1">* {errors.password}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PersonalInfoCard;
