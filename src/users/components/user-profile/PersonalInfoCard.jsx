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
  const { dateOfBirth, email, phoneNumber, role } = isEditing
    ? tempProfile
    : profile;
    
  console.log("PersonalInfoCard - profile data:", isEditing ? tempProfile : profile);
  console.log("PersonalInfoCard - phoneNumber:", phoneNumber);
  console.log("PersonalInfoCard - email:", email);

  const [fName, lName] = useMemo(() => {
    if (!profile.name) return ["", ""];
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

export default PersonalInfoCard;
