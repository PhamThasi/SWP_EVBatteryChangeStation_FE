import { useState, useEffect } from "react";
import tokenUtils from "@/utils/tokenUtils";

const TokenDataDebugger = () => {
  const [tokenData, setTokenData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [decodedToken, setDecodedToken] = useState(null);

  useEffect(() => {
    const token = tokenUtils.getToken();
    const user = tokenUtils.getUserData();
    
    if (token) {
      const decoded = tokenUtils.decodeToken(token);
      setDecodedToken(decoded);
    }
    
    setUserData(user);
  }, []);

  const refreshData = () => {
    const token = tokenUtils.getToken();
    const user = tokenUtils.getUserData();
    
    if (token) {
      const decoded = tokenUtils.decodeToken(token);
      setDecodedToken(decoded);
    }
    
    setUserData(user);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg m-4">
      <h3 className="text-lg font-bold mb-4 text-orange-500">Token Data Debugger</h3>
      
      <div className="mb-4">
        <button 
          onClick={refreshData}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Decoded Token Data */}
        <div className="bg-gray-100 p-3 rounded">
          <h4 className="font-bold mb-2">Decoded Token Data:</h4>
          {decodedToken ? (
            <pre className="text-xs overflow-auto max-h-60">
              {JSON.stringify(decodedToken, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500">No token data</p>
          )}
        </div>

        {/* User Data from localStorage */}
        <div className="bg-gray-100 p-3 rounded">
          <h4 className="font-bold mb-2">User Data from localStorage:</h4>
          {userData ? (
            <pre className="text-xs overflow-auto max-h-60">
              {JSON.stringify(userData, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500">No user data</p>
          )}
        </div>
      </div>

      {/* Required Fields Check */}
      <div className="mt-4 bg-blue-50 p-3 rounded">
        <h4 className="font-bold mb-2">Required Fields Check:</h4>
        {decodedToken && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={decodedToken.email ? "text-green-600" : "text-red-600"}>
              Email: {decodedToken.email ? "✓" : "✗"}
            </div>
            <div className={decodedToken.fullName ? "text-green-600" : "text-red-600"}>
              Full Name: {decodedToken.fullName ? "✓" : "✗"}
            </div>
            <div className={decodedToken.address ? "text-green-600" : "text-red-600"}>
              Address: {decodedToken.address ? "✓" : "✗"}
            </div>
            <div className={decodedToken.phoneNumber ? "text-green-600" : "text-red-600"}>
              Phone: {decodedToken.phoneNumber ? "✓" : "✗"}
            </div>
            <div className={decodedToken.dateOfBirth ? "text-green-600" : "text-red-600"}>
              Date of Birth: {decodedToken.dateOfBirth ? "✓" : "✗"}
            </div>
            <div className={decodedToken.accountId ? "text-green-600" : "text-red-600"}>
              Account ID: {decodedToken.accountId ? "✓" : "✗"}
            </div>
          </div>
        )}
      </div>

      {/* User Info from Token */}
      <div className="mt-4 bg-green-50 p-3 rounded">
        <h4 className="font-bold mb-2">User Info from Token (getUserInfoFromToken):</h4>
        {(() => {
          const userInfo = tokenUtils.getUserInfoFromToken();
          return userInfo ? (
            <pre className="text-xs overflow-auto max-h-40">
              {JSON.stringify(userInfo, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500">No user info available</p>
          );
        })()}
      </div>
    </div>
  );
};

export default TokenDataDebugger;
