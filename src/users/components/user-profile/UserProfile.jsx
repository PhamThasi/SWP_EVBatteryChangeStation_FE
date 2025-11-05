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

  // ---------------- HANDLERS ----------------
  const handleEdit = async () => {
    if (isEditing) {
      const confirmed = window.confirm(
        "Bạn có chắc chắn muốn cập nhật thông tin cá nhân không?\n\nThông tin sẽ được lưu và không thể hoàn tác."
      );
      if (!confirmed) return;

      try {
        const sanitizedProfile = {
          ...tempProfile,
          password: tempProfile.password || "string", // thêm dòng này
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
