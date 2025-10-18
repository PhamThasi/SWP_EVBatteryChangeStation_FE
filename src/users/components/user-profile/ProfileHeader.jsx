import Card from "@/components/card/Card";
import car from "./../../../assets/car.jpg";
const ProfileHeader = ({ profile, tempProfile, isEditing, onChange }) => {
  const { imgProfile, name, role, address } = isEditing ? tempProfile : profile;

  return (
    <Card className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6 p-8">
      <div className="flex-shrink-0">
        <img
          src={car}
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
export default ProfileHeader;
