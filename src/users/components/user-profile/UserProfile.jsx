import { useEffect, useState } from "react";
import ProfileHeader from "./ProfileHeader";
import PersonalInfoCard from "./PersonalInfoCard";
import AddressCard from "./AddressCard";
import tokenUtils from "@/utils/tokenUtils";
import authService from "@/api/authService";

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({});
  const [tempProfile, setTempProfile] = useState({});
  const [loading, setLoading] = useState(true);

  // ---------------- FETCH USER PROFILE ----------------
  useEffect(() => {
    const loadUserProfile = async () => {
      const token = tokenUtils.getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userProfile = await tokenUtils.getUserProfile();
        if (userProfile) {
          const enriched = {
            ...userProfile,
            fullName: userProfile.fullName || userProfile.name || "",
            gender: userProfile.gender || "",
          };
          setProfile(enriched);
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      }

      setLoading(false);
    };

    loadUserProfile();
  }, []);

  // ---------------- VALIDATION ----------------
  const validateProfile = (profileData) => {
    const errors = {};

    // Validate password (required)
    if (!profileData.password || profileData.password.trim() === "") {
      errors.password = "Mật khẩu là bắt buộc để cập nhật thông tin";
    }

    // Validate phone number (must be exactly 10 digits)
    if (profileData.phoneNumber) {
      const cleaned = profileData.phoneNumber.replace(/\D/g, "");
      if (cleaned.length !== 10) {
        errors.phoneNumber = "Số điện thoại phải có đúng 10 chữ số (ví dụ: 0912345678)";
      }
    }

    // Validate date of birth
    if (profileData.dateOfBirth) {
      try {
        const dateObj = new Date(profileData.dateOfBirth);
        if (isNaN(dateObj.getTime())) {
          errors.dateOfBirth = "Ngày sinh không hợp lệ";
        } else {
          const now = new Date();
          if (dateObj > now) {
            errors.dateOfBirth = "Ngày sinh không thể lớn hơn ngày hiện tại";
          }
        }
      } catch {
        errors.dateOfBirth = "Ngày sinh không hợp lệ";
      }
    }

    // Validate email format
    if (profileData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profileData.email)) {
        errors.email = "Địa chỉ email không hợp lệ";
      }
    }

    // Validate full name
    if (!profileData.fullName || profileData.fullName.trim() === "") {
      errors.fullName = "Họ và tên không được để trống";
    }

    return errors;
  };

  // ---------------- HANDLERS ----------------
  const handleEdit = async () => {
    if (isEditing) {
      // Validate before submitting
      const validationErrors = validateProfile(tempProfile);
      if (Object.keys(validationErrors).length > 0) {
        const errorMessages = Object.values(validationErrors).map(msg => `* ${msg}`).join("\n");
        alert("⚠️ Vui lòng sửa các lỗi sau:\n\n" + errorMessages);
        return;
      }

      const confirmed = window.confirm(
        "Bạn có chắc chắn muốn cập nhật thông tin cá nhân không?\n\nThông tin sẽ được lưu và không thể hoàn tác."
      );
      if (!confirmed) return;

      try {
        const sanitizedProfile = {
          ...tempProfile,
          password: tempProfile.password, // Password is required and validated
        };

        const response = await authService.updateProfile(sanitizedProfile);

        if (response && response.data) {
          setProfile(tempProfile);
          localStorage.setItem("user", JSON.stringify(tempProfile));
          alert("✅ Cập nhật thông tin thành công!");
        } else {
          alert("⚠️ Có lỗi xảy ra khi cập nhật thông tin!");
        }
      } catch (error) {
        console.error("Update profile error:", error);
        alert(
          "❌ Có lỗi xảy ra khi cập nhật thông tin: " +
            (error.response?.data?.message || error.message)
        );
      }
    } else {
      setTempProfile(profile);
    }

    setIsEditing(!isEditing);
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setTempProfile((prev) => ({ ...prev, [field]: value }));
  };

  // ---------------- LOADING STATE ----------------
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen w-full flex flex-col items-center justify-center py-10 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <h2 className="text-orange-500 text-xl font-semibold">
            Đang tải thông tin...
          </h2>
        </div>
      </div>
    );
  }

  // ---------------- UI RENDER ----------------
  return (
    <div className="bg-gray-50 min-h-screen w-full flex flex-col items-center py-10 px-4">
      <h1 className="text-orange-500 text-3xl font-bold mb-8">My Profile</h1>

      <ProfileHeader
        profile={profile}
        tempProfile={tempProfile}
        isEditing={isEditing}
        onChange={handleChange}
      />

      <PersonalInfoCard
        profile={profile}
        tempProfile={tempProfile}
        isEditing={isEditing}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onChange={handleChange}
      />

      <AddressCard
        address={profile.address}
        tempAddress={tempProfile.address}
        isEditing={isEditing}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onChange={handleChange}
      />
    </div>
  );
};

export default UserProfile;
