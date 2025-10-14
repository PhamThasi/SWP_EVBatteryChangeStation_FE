import React, { useMemo, useState } from "react";
import car from "./../../../assets/car.jpg";
import Card from "@/components/card/Card";
import CardHeader from "@/components/card/CardHeader";
import InfoField from "@/components/card/InfoField";
import EditingButton from "@/components/Button_Editting/EditingButton";

const ProfileHeader = ({ profile, tempProfile, isEditing, onChange }) => {
  const { imgProfile, name, role, address } = isEditing ? tempProfile : profile;

  return (
    <Card className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6 p-8">
      <div className="flex-shrink-0">
        <img
          src={imgProfile}
          alt="Profile"
          className="border-gray-300 border-2 w-32 h-32 rounded-full object-cover"
        />
        {isEditing && (
          <input
            type="text"
            value={tempProfile.imgProfile}
            onChange={(e) => onChange("imgProfile", e.target.value)}
            placeholder="Image URL"
            className="mt-2 w-32 text-xs p-1 border rounded"
          />
        )}
      </div>
      <div className="flex-grow text-center md:text-left">
        {isEditing ? (
          <input
            type="text"
            value={tempProfile.name}
            onChange={(e) => onChange("name", e.target.value)}
            className="text-purple-700 text-3xl font-bold mb-2 border-b-2 border-purple-300 focus:outline-none focus:border-purple-500 w-full"
          />
        ) : (
          <h1 className="text-purple-700 text-3xl font-bold mb-2">{name}</h1>
        )}
        {isEditing ? (
          <input
            type="text"
            value={tempProfile.role}
            onChange={(e) => onChange("role", e.target.value)}
            className="text-gray-600 mb-2 border-b border-gray-300 focus:outline-none focus:border-gray-500 w-full"
          />
        ) : (
          <p className="text-gray-600 mb-2">{role}</p>
        )}
        {isEditing ? (
          <input
            type="text"
            value={tempProfile.address}
            onChange={(e) => onChange("address", e.target.value)}
            className="text-gray-500 border-b border-gray-300 focus:outline-none focus:border-gray-500 w-full"
          />
        ) : (
          <p className="text-gray-500">{address}</p>
        )}
      </div>
    </Card>
  );
};

const PersonalInfoCard = ({
  profile,
  tempProfile,
  isEditing,
  onEdit,
  onCancel,
  onChange,
}) => {
  const { dateOfBirth, email, phoneNumber, role } = isEditing
    ? tempProfile
    : profile;

  const [fName, lName] = useMemo(() => {
    const parts = profile.name.split(" ");
    return [parts[0], parts.slice(1).join(" ")];
  }, [profile.name]);

  return (
    <Card className="mb-6">
      <CardHeader
        title="Personal Information"
        isEditing={isEditing}
        onEdit={onEdit}
        onCancel={onCancel}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoField label="First Name" value={fName} />
        <InfoField label="Last Name" value={lName} />
        <InfoField
          label="Date of Birth"
          value={dateOfBirth}
          isEditing={isEditing}
          onChange={onChange}
          name="dateOfBirth"
        />
        <InfoField
          label="Email Address"
          value={email}
          isEditing={isEditing}
          onChange={onChange}
          name="email"
          type="email"
        />
        <InfoField
          label="Phone Number"
          value={phoneNumber}
          isEditing={isEditing}
          onChange={onChange}
          name="phoneNumber"
          type="tel"
        />
        <InfoField label="User Role" value={role} />
      </div>
    </Card>
  );
};

const AddressCard = ({
  address,
  tempAddress,
  isEditing,
  onEdit,
  onCancel,
  onChange,
}) => {
  const displayAddress = isEditing ? tempAddress : address;

  return (
    <Card>
      <CardHeader
        title="Address"
        isEditing={isEditing}
        onEdit={onEdit}
        onCancel={onCancel}
      />
      <InfoField
        label="Street Address"
        value={displayAddress}
        isEditing={isEditing}
        onChange={onChange}
        name="address"
      />
    </Card>
  );
};

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    imgProfile: car,
    name: "Quang Hiển",
    role: "User",
    dateOfBirth: "11/08/2005",
    email: "anhvietanh1123@gmail.com",
    phoneNumber: "0966949208",
    address: "23/11/160 tăng nhơn phú A",
  });
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
