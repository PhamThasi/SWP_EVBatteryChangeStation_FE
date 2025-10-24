import React, { useState, useEffect } from "react";
import tokenUtils from "@/utils/tokenUtils";

const TokenDebugger = () => {
  const [token, setToken] = useState("");
  const [decodedData, setDecodedData] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Load current token and user data
    const currentToken = tokenUtils.getToken();
    const currentUserData = tokenUtils.getUserData();
    
    setToken(currentToken || "");
    setUserData(currentUserData);
    
    if (currentToken) {
      const decoded = tokenUtils.decodeToken(currentToken);
      setDecodedData(decoded);
    }
  }, []);

  const handleDecodeToken = () => {
    if (token) {
      const decoded = tokenUtils.decodeToken(token);
      setDecodedData(decoded);
      
      if (decoded) {
        const mappedProfile = tokenUtils.mapTokenToUserProfile(decoded);
        setUserData(mappedProfile);
        localStorage.setItem("user", JSON.stringify(mappedProfile));
      }
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Token Debugger</h1>
      
      <div className="space-y-6">
        {/* Token Input */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Token Input</h2>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your JWT token here..."
            className="w-full h-32 p-2 border rounded"
          />
          <button
            onClick={handleDecodeToken}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Decode Token
          </button>
        </div>

        {/* Decoded Token Data */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Decoded Token Data</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {decodedData ? JSON.stringify(decodedData, null, 2) : "No token decoded"}
          </pre>
        </div>

        {/* Mapped User Profile */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Mapped User Profile</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {userData ? JSON.stringify(userData, null, 2) : "No user data"}
          </pre>
        </div>

        {/* Expected Structure */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Expected User Data Structure</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
{`{
  "roleId": "ae25395f-c7ec-42ab-92e3-f63bf97c38b2",
  "accountId": "86845a53-2c9e-4600-b359-5e6008df951c",
  "accountName": "staffHCM",
  "email": "staffHCM@gmail.com",
  "fullName": "Trần Văn Staff",
  "password": "staff@123",
  "gender": "Nam",
  "address": "TP.HCM",
  "phoneNumber": "0933333333",
  "dateOfBirth": "1992-07-15",
  "status": true,
  "createDate": null,
  "updateDate": null
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TokenDebugger;
