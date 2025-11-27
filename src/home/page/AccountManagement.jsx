import React, { useEffect, useState } from "react";
import "../components/AccountMng.css";
import authService from "../../api/authService";

const AccountManagement = () => {
  const [search, setSearch] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [sortRole, setSortRole] = useState("");
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null); // also used for creating
  const [showModal, setShowModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: "",
    accountName: "",
    email: "",
    gender: "",
    address: "",
    phoneNumber: "",
    dateOfBirth: "",
    status: true,
    roleId: "",
    stationId: "",
    password: "",
  });

  const BASE_URL = "http://localhost:5204/api/Account";
  const ROLE_URL = "http://localhost:5204/api/Role/GetAll";
  const STATION_URL = "http://localhost:5204/api/Station/SelectAll";

  // Fetch all accounts
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/GetAll`);
      if (!res.ok) throw new Error("Failed to fetch accounts");

      const result = await res.json();

      console.log(result);
      setAccounts(result.data || []);
      console.log(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const fetchRoles = async () => {
    try {
      const res = await fetch(ROLE_URL);
      const data = await res.json();
      setRoles(data.data || []);
    } catch (err) {
      console.error("Fetch roles failed:", err);
    }
  };

  const fetchStations = async () => {
    try {
      const res = await fetch(STATION_URL);
      const data = await res.json();
      setStations(data.data || []);
    } catch (err) {
      console.error("Fetch stations failed:", err);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchRoles();
    fetchStations();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "status" ? value === "true" : value,
    }));
  };

  // Open modal for Add / Update
  const openModal = (account = null) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        fullName: account.fullName || "",
        accountName: account.accountName || "",
        email: account.email || "",
        gender: account.gender || "",
        address: account.address || "",
        phoneNumber: account.phoneNumber || "",
        dateOfBirth: account.dateOfBirth
          ? new Date(account.dateOfBirth).toISOString().split("T")[0]
          : "",
        status: account.status ?? true,
        roleId: account.roleId || "",
        stationId: account.stationId || "", 
        password: "123456",
      });
    } else {
      setEditingAccount(null);
      setFormData({
        fullName: "",
        accountName: "",
        email: "",
        gender: "",
        address: "",
        phoneNumber: "",
        dateOfBirth: "",
        status: true,
        roleId: "",
        stationId: "",
        password: "",
      });
    }
    setShowModal(true);
    setFormErrors({});
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAccount(null);
  };

  // Save (Add or Update)
  const handleSave = async () => {
    const isUpdate = !!editingAccount;
    // Basic validation for create
    if (!isUpdate) {
      const errors = {};
      // if (!formData.accountName?.trim()) errors.accountName = "Username is required";
      if (!formData.fullName?.trim()) errors.fullName = "Full name is required";
      if (!formData.roleId) errors.roleId = "Role is required";
      // if (!formData.stationId) errors.stationId = "Station is required";
      if (!formData.gender) errors.gender = "Gender is required";
      if (!formData.phoneNumber?.trim()) errors.phoneNumber = "Phone is required";
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
    } else {
      const errors = {};
      // if (!formData.accountName?.trim()) errors.accountName = "Username is required";
      if (!formData.fullName?.trim()) errors.fullName = "Full name is required";
      if (!formData.roleId) errors.roleId = "Role is required";
      // if (!formData.stationId) errors.stationId = "Station is required";
      if (!formData.gender) errors.gender = "Gender is required";
      if (!formData.phoneNumber?.trim()) errors.phoneNumber = "Phone is required";
      if (!formData.email?.trim()) errors.email = "Email is required";
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
    }
    try {
      if (isUpdate) {
        // Centralized update via service; password included only if provided
        await authService.updateProfile({
          accountId: editingAccount?.accountId,
          roleId: formData.roleId,
          accountName: formData.accountName || null,
          fullName: formData.fullName,
          email: formData.email,
          gender: formData.gender,
          address: formData.address,
          phoneNumber: formData.phoneNumber,
          dateOfBirth: formData.dateOfBirth || null,
          stationId: formData.stationId || null,
          status: formData.status,
          password: formData.password || undefined,
        });
      } else {
        // Use service for create; it handles date formatting
        await authService.createAccount({
          roleId: formData.roleId,
          accountName: formData.accountName,
          password: "default@123",
          fullName: formData.fullName,
          email: formData.email,
          gender: formData.gender,
          address: formData.address,
          phoneNumber: formData.phoneNumber,
          createDate: new Date().toISOString(),
          dateOfBirth: formData.dateOfBirth || null,
          stationId: formData.stationId || null,
          status: formData.status,
        });
      }

      await fetchAccounts();
      closeModal();
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete
  const handleDelete = async (accountId) => {
    if (!window.confirm("Confirm delete this account?")) return;
    try {
      // Backend expects /Account/SoftDelete?encode=...
      await authService.softDeleteAccounts(accountId);
      await fetchAccounts();
      alert("Account deleted successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredAccounts = accounts
    .filter((acc) => acc.status === true)
    .filter((acc) => {
      if (!search.trim()) return true;
      const searchLower = search.toLowerCase();
      const fullNameLower = acc.fullName?.toLowerCase() || "";
      const accountNameLower = acc.accountName?.toLowerCase() || "";
      const emailLower = acc.email?.toLowerCase() || "";
      
      return (
        fullNameLower.includes(searchLower) ||
        accountNameLower.includes(searchLower) ||
        emailLower.includes(searchLower)
      );
    });

  if (loading) return <p>Đang tải danh sách tài khoản...</p>;
  if (error) return <p>Lỗi: {error}</p>;

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Quản lý tài khoản</h1>

      {/* Toolbar */}
      <div
        className="dashboard-card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Tìm theo tên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            marginRight: "1rem",
            padding: "0.8rem",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
          }}
        />
        <button className="save-btn" onClick={() => openModal()}>
          + Thêm tài khoản
        </button>
        <select
          value={sortRole}
          onChange={(e) => setSortRole(e.target.value)}
          style={{
            padding: "0.8rem",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
            backgroundColor: "white",
            marginLeft: "8px",
          }}
        >
          <option value="">Tất cả</option>
          {roles.map((role) => (
            <option key={role.roleId} value={role.roleId}>
              {role.roleName}
            </option>
          ))}
        </select>
      </div>

      {/* Accounts Table */}
      <div className="dashboard-card">
        {filteredAccounts.length === 0 ? (
          <p>Không tìm thấy tài khoản phù hợp.</p>
        ) : (
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Giới tính</th>
                <th>Địa chỉ</th>
                <th>Điện thoại</th>
                <th>Vai trò</th>
                <th style={{ textAlign: "center" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts
                .filter((acc) => !sortRole || acc.roleId == sortRole)
                .map((acc) => {
                  const roleName =
                    roles.find((r) => r.roleId === acc.roleId)?.roleName || "-";
                  const stationName =
                    stations.find((s) => s.stationId === acc.stationId)
                      ?.stationName ||
                    stations.find((s) => s.stationId === acc.stationId)
                      ?.address ||
                    "-";
                  // Display fullName, fallback to accountName if fullName is empty or null
                  const displayName = acc.fullName?.trim() || acc.accountName || "-";
                  
                  return (
                    <tr key={acc.accountId}>
                      <td>{displayName}</td>
                      <td>{acc.gender || "-"}</td>
                      <td>{acc.address || "-"}</td>
                      <td>{acc.phoneNumber || "-"}</td>
                      <td>{roleName}</td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          className="update-btn"
                          onClick={() => openModal(acc)}
                        >
                          ✎
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(acc.accountId)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingAccount ? "Cập nhật tài khoản" : "Thêm tài khoản"}</h2>
            <form className="modal-form">
              {/* Full Name */}
              <label>Họ tên *</label>
              <input
                type="text"
                name="fullName"
                placeholder="Nhập họ tên"
                value={formData.fullName}
                onChange={handleChange}
              />
              {formErrors.fullName && <span className="field-error">{formErrors.fullName}</span>}

              {/* Username */}
              <label>Tên đăng nhập *</label>
              <input
                type="text"
                name="accountName"
                placeholder="Nhập tên đăng nhập"
                value={formData.accountName}
                onChange={handleChange}
              />
              {formErrors.accountName && <span className="field-error">{formErrors.accountName}</span>}

              {/* Gender */}
              <label>Giới tính *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Chọn giới tính</option>
                <option value={"Nam"}>Nam</option>
                <option value={"Nữ"}>Nữ</option>
              </select>
              {formErrors.gender && <span className="field-error">{formErrors.gender}</span>}

              {/* Address */}
              <label>Địa chỉ</label>
              <input
                type="text"
                name="address"
                placeholder="Nhập địa chỉ"
                value={formData.address}
                onChange={handleChange}
              />

              {/* Phone */}
              <label>Số điện thoại *</label>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Nhập số điện thoại"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
              {formErrors.phoneNumber && <span className="field-error">{formErrors.phoneNumber}</span>}

              {/* Date of birth */}
              <label>Ngày sinh</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />

              {/* Role dropdown */}
              <label>Vai trò *</label>
              <select
                name="roleId"
                value={formData.roleId}
                onChange={handleChange}
              >
                <option value="">Chọn vai trò</option>
                {roles.map((r) => (
                  <option key={r.roleId} value={r.roleId}>
                    {r.roleName}
                  </option>
                ))}
              </select>
              {formErrors.roleId && <span className="field-error">{formErrors.roleId}</span>}

              {/* Station dropdown */}
              <label>Trạm *</label>
              <select
                name="stationId"
                value={formData.stationId}
                onChange={handleChange}
              >
                <option value="">Chọn trạm</option>
                {stations.map((s) => (
                  <option key={s.stationId} value={s.stationId}>
                    {s.stationName || s.address}
                  </option>
                ))}
              </select>
              {formErrors.stationId && <span className="field-error">{formErrors.stationId}</span>}

              {/* Email (auto) and Password (default) for create; Email/Password editable for update */}
              {!editingAccount ? (
                <>
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {formErrors.email && <span className="field-error">{formErrors.email}</span>}
                  <label>Password (default)</label>
                  <input type="text" value="123456" readOnly />
                </>
              ) : (
                <>
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Nhập email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {formErrors.email && (
                    <span className="field-error">{formErrors.email}</span>
                  )}
                  <label>Mật khẩu mới</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Mặc định 123456 nếu không thay đổi"
                    value={formData.password || ""}
                    onChange={handleChange}
                  />
                </>
              )}

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value={true}>Đang hoạt động</option>
                <option value={false}>Ngừng kích hoạt</option>
              </select>
            </form>
            <div className="modal-actions">
              <button className="save-btn" onClick={handleSave}>
                Lưu
              </button>
              <button className="cancel-btn" onClick={closeModal}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManagement;
