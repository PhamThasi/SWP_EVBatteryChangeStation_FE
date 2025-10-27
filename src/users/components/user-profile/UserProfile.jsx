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
          console.log("User profile loaded:", userProfile);
          setProfile(userProfile);
        } else {
          console.error("Failed to load user profile");
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
      // Save changes - call API to update profile
      try {
        console.log("Saving profile changes...");
        console.log("Account ID:", profile.accountId);
        console.log("Updated data:", tempProfile);
        
        const response = await authService.updateProfile(tempProfile);
        console.log("Update response:", response);
        
        if (response && response.data) {
          // Update local state with new data
          setProfile(tempProfile);
          
          // Update localStorage with new user data
          localStorage.setItem("user", JSON.stringify(tempProfile));
          
          alert("Cập nhật thông tin thành công!");
        } else {
          alert("Có lỗi xảy ra khi cập nhật thông tin!");
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

  const refreshProfile = async () => {
    setLoading(true);
    try {
      console.log("Refreshing profile data from API...");
      // Force refresh = true để bỏ qua cache và lấy data mới từ API
      const userProfile = await tokenUtils.getUserProfile(true);
      
      if (userProfile) {
        setProfile(userProfile);
        setTempProfile(userProfile);
        console.log("Profile refreshed successfully");
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    } finally {
      setLoading(false);
    }
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
      
      {/* Debug info */}
      <div className="mt-4 p-4 bg-yellow-100 rounded">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">Debug Info:</h3>
          <button 
            onClick={refreshProfile}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Refresh Data
          </button>
        </div>
        <p><strong>Account ID:</strong> {profile.accountId}</p>
        <p><strong>Account Name:</strong> {profile.accountName}</p>
        <p><strong>Full Name:</strong> {profile.fullName}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Phone:</strong> {profile.phoneNumber}</p>
        <p><strong>Address:</strong> {profile.address}</p>
        <p><strong>Gender:</strong> {profile.gender}</p>
        <p><strong>Role:</strong> {profile.role}</p>
        <p><strong>Date of Birth:</strong> {profile.dateOfBirth}</p>
      </div>

    </div>
  );
};
export default UserProfile;
