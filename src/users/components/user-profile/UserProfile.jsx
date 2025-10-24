// import car from "./../../../assets/car.jpg";
import ProfileHeader from "./ProfileHeader";
import PersonalInfoCard from "./PersonalInfoCard";
import { useEffect, useState } from "react";
import AddressCard from "./AddressCard";
import axios from "axios";
import tokenUtils from "@/utils/tokenUtils";

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = tokenUtils.getToken();
    const userData = tokenUtils.getUserData();
    
    console.log("Token:", token);
    console.log("User data from localStorage:", userData);
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // First try to get user data from localStorage (from decoded token)
      if (userData) {
        console.log("Using cached user data:", userData);
        setProfile(userData);
        setLoading(false);
      } else {
        // Fallback: decode token and try to get data from API
        const decoded = tokenUtils.decodeToken(token);
        console.log("Decoded token:", decoded);

        if (decoded) {
          // Try to get additional data from API
          axios
            .get(
              `http://localhost:5204/api/Account/GetAccountByName?accview=${decoded.name || decoded.accountName}`
            )
            .then((response) => {
              console.log("API response:", response.data);
              setProfile(response.data);
              setLoading(false);
            })
            .catch((err) => {
              console.error("API Error:", err);
              // If API fails, use token data
              const mappedProfile = tokenUtils.mapTokenToUserProfile(decoded);
              setProfile(mappedProfile);
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Token decode error:", error);
      setLoading(false);
    }
  }, []);

  const [tempProfile, setTempProfile] = useState(profile);

  const handleEdit = () => {
    if (isEditing) {
      setProfile(tempProfile);
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
