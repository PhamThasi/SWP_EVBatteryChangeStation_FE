// import car from "./../../../assets/car.jpg";
import ProfileHeader from "./ProfileHeader";
import PersonalInfoCard from "./PersonalInfoCard";
import { useEffect, useState } from "react";
import AddressCard from "./AddressCard";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  // const [profile, setProfile] = useState({
  //   imgProfile: car,
  //   name: "Quang Hiển",
  //   role: "User",
  //   dateOfBirth: "11/08/2005",
  //   email: "anhvietanh1123@gmail.com",
  //   phoneNumber: "0966949208",
  //   address: "23/11/160 tăng nhơn phú A",
  // });
  const [profile, setProfile] = useState({});
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decoded = jwtDecode(token);

    axios
      .get(
        `http://localhost:5204/api/Account/GetAccountByName?accview=${decoded.name}`
      )
      .then((response) => {
        return setProfile(response.data);
      })
      .catch((err) => console.error(err));
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
