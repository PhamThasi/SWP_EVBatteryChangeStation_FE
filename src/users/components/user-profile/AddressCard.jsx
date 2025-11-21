import Card from "@/components/card/Card";
import CardHeader from "@/components/card/CardHeader";
import InfoField from "@/components/card/InfoField";

const AddressCard = ({
  address,
  tempAddress,
  isEditing,
  onEdit,
  onCancel,
  onChange,
}) => {
  const displayAddress = isEditing ? tempAddress : address;
  
  console.log("AddressCard - address:", address);
  console.log("AddressCard - tempAddress:", tempAddress);
  console.log("AddressCard - displayAddress:", displayAddress);

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
        placeholder="Nhập địa chỉ đầy đủ (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)"
      />
    </Card>
  );
};
export default AddressCard;
