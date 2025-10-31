// import car from "./../../../assets/car.jpg";
import ProfileHeader from "./ProfileHeader";
import PersonalInfoCard from "./PersonalInfoCard";
import { useEffect, useState } from "react";  
import AddressCard from "./AddressCard";
import tokenUtils from "@/utils/tokenUtils";
import authService from "@/api/authService";

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadUserProfile = async () => {
      const token = tokenUtils.getToken();
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Sử dụng hàm getUserProfile với logic fallback đã được tối ưu
        const userProfile = await tokenUtils.getUserProfile();
        
        if (userProfile) {
          setProfile(userProfile);
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
      
      setLoading(false);
    };

    loadUserProfile();
  }, []);

  const [tempProfile, setTempProfile] = useState(profile);

  const handleEdit = async () => {
    if (isEditing) {
      // Show confirmation dialog before saving
      const confirmed = window.confirm(
        "Bạn có chắc chắn muốn cập nhật thông tin cá nhân không?\n\n" +
        "Thông tin sẽ được lưu và không thể hoàn tác."
      );
      
      if (!confirmed) {
        return; // User cancelled, don't save
      }
      
      // Save changes - call API to update profile
      try {
        const response = await authService.updateProfile(tempProfile);
        
        if (response && response.data) {
          // Update local state with new data
          setProfile(tempProfile);
          
          // Update localStorage with new user data
          localStorage.setItem("user", JSON.stringify(tempProfile));
          
          alert(" Cập nhật thông tin thành công!");
        } else {
          alert(" Có lỗi xảy ra khi cập nhật thông tin!");
        }
      } catch (error) {
        console.error("Update profile error:", error);
        alert("Có lỗi xảy ra khi cập nhật thông tin: " + (error.response?.data?.message || error.message));
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


  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen w-full flex flex-col items-center justify-center py-10 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <h2 className="text-orange-500 text-xl font-semibold">Đang tải thông tin...</h2>
        </div>
      </div>
    );
  }

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
