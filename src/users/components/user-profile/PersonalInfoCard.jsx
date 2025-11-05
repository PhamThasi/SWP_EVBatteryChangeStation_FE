import Card from "@/components/card/Card";
import CardHeader from "@/components/card/CardHeader";
import InfoField from "@/components/card/InfoField";
import { useMemo } from "react";

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

  console.log(
    "PersonalInfoCard - profile data:",
    isEditing ? tempProfile : profile
  );

  const displayFullName = useMemo(() => {
    return (isEditing ? tempProfile.fullName : profile.fullName) || "";
  }, [isEditing, tempProfile.fullName, profile.fullName]);

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
        />

        <InfoField
          label="Gender"
          value={gender}
          isEditing={isEditing}
          onChange={onChange}
          name="gender"
        />

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

        {/* 🟡 Thêm field mật khẩu */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-3">
          <label className="block text-gray-700 font-semibold mb-1">
            Mật khẩu
          </label>
          <input
            type={isEditing ? "text" : "password"}
            name="password"
            className={`border rounded-xl px-4 py-2 w-full outline-none ${
              isEditing
                ? "border-orange-400 focus:ring-2 focus:ring-orange-300"
                : "border-gray-300 bg-gray-100 cursor-not-allowed"
            }`}
            placeholder={
              isEditing ? "Nhập mật khẩu mới (nếu muốn đổi)" : "••••••••"
            }
            value={
              isEditing
                ? tempProfile.password || ""
                : profile.password
                ? "••••••••"
                : ""
            }
            onChange={(e) => onChange("password", e.target.value)}
            disabled={!isEditing}
          />
        </div>
      </div>
    </Card>
  );
};

export default PersonalInfoCard;
