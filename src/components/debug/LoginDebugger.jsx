import React, { useState } from "react";
import authService from "@/api/authService";

const LoginDebugger = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log("🧪 Testing login with:", { email, password });
      const response = await authService.login(email, password);
      
      console.log("✅ Login successful!");
      console.log("Full response:", response);
      console.log("Response data:", response.data);
      console.log("Response status:", response.status);
      
      setResult({
        success: true,
        data: response.data,
        status: response.status,
        message: "Login successful!"
      });
      
    } catch (error) {
      console.error("❌ Login failed:", error);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);
      
      setResult({
        success: false,
        error: error.message,
        errorData: error.response?.data,
        status: error.response?.status,
        message: "Login failed!"
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Login Debugger</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Test Login</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter password"
            />
          </div>
          
          <button
            onClick={testLogin}
            disabled={loading || !email || !password}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "Testing..." : "Test Login"}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            Result: {result.success ? "✅ Success" : "❌ Failed"}
          </h2>
          
          <div className="space-y-4">
            <div>
              <strong>Message:</strong> {result.message}
            </div>
            
            {result.success ? (
              <div>
                <strong>Response Data:</strong>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto mt-2">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
                
                <div className="mt-4">
                  <strong>Status Code:</strong> {result.status}
                </div>
                
                <div className="mt-4">
                  <strong>Token:</strong> 
                  <div className="bg-gray-100 p-2 rounded text-sm mt-1">
                    {result.data?.data || "No token found"}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <strong>Error:</strong> {result.error}
                <div className="mt-2">
                  <strong>Status Code:</strong> {result.status}
                </div>
                {result.errorData && (
                  <div className="mt-2">
                    <strong>Error Data:</strong>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto mt-2">
                      {JSON.stringify(result.errorData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginDebugger;
