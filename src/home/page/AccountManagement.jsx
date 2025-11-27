import React, { useEffect, useState } from "react";
import "../components/AccountMng.css";
import authService from "../../api/authService";
import { notifySuccess, notifyError } from "../../components/notification/notification";

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
      const accountsData = result.data || [];
      // Sắp xếp mới nhất lên đầu (ưu tiên updateDate, nếu không có thì dùng createDate)
      const sortedAccounts = accountsData.sort((a, b) => {
        const dateA = a.updateDate 
          ? new Date(a.updateDate).getTime() 
          : (a.createDate ? new Date(a.createDate).getTime() : 0);
        const dateB = b.updateDate 
          ? new Date(b.updateDate).getTime() 
          : (b.createDate ? new Date(b.createDate).getTime() : 0);
        return dateB - dateA; // Mới nhất lên đầu (giảm dần)
      });
      setAccounts(sortedAccounts);
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
      if (!formData.accountName?.trim()) errors.accountName = "Tên đăng nhập là bắt buộc";
      if (!formData.fullName?.trim()) errors.fullName = "Họ tên là bắt buộc";
      if (!formData.roleId) errors.roleId = "Vai trò là bắt buộc";
      if (!formData.gender) errors.gender = "Giới tính là bắt buộc";
      if (!formData.phoneNumber?.trim()) errors.phoneNumber = "Số điện thoại là bắt buộc";
      if (!formData.email?.trim()) errors.email = "Email là bắt buộc";
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
    } else {
      const errors = {};
      if (!formData.accountName?.trim()) errors.accountName = "Tên đăng nhập là bắt buộc";
      if (!formData.fullName?.trim()) errors.fullName = "Họ tên là bắt buộc";
      if (!formData.roleId) errors.roleId = "Vai trò là bắt buộc";
      if (!formData.gender) errors.gender = "Giới tính là bắt buộc";
      if (!formData.phoneNumber?.trim()) errors.phoneNumber = "Số điện thoại là bắt buộc";
      if (!formData.email?.trim()) errors.email = "Email là bắt buộc";
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
    }
    try {
      if (isUpdate) {
        // Update account - theo cấu trúc: accountId, roleId, stationId, accountName, password, fullName, email, gender, address, phoneNumber, dateOfBirth, updateDate
        await authService.updateProfile({
          accountId: editingAccount?.accountId,
          roleId: formData.roleId,
          stationId: formData.stationId || null,
          accountName: formData.accountName.trim(),
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          gender: formData.gender,
          address: formData.address?.trim() || "",
          phoneNumber: formData.phoneNumber.trim(),
          dateOfBirth: formData.dateOfBirth || null,
          status: formData.status,
          password: formData.password?.trim() || undefined,
        });
        notifySuccess("Cập nhật tài khoản thành công!");
      } else {
        // Create account - theo cấu trúc tương tự nhưng không có accountId và updateDate
        await authService.createAccount({
          roleId: formData.roleId,
          stationId: formData.stationId || null,
          accountName: formData.accountName.trim(),
          password: formData.password?.trim() || "default@123",
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          gender: formData.gender,
          address: formData.address?.trim() || "",
          phoneNumber: formData.phoneNumber.trim(),
          dateOfBirth: formData.dateOfBirth || null,
          status: formData.status ?? true,
          createDate: new Date().toISOString(),
        });
        notifySuccess("Tạo tài khoản thành công!");
      }

      await fetchAccounts();
      closeModal();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Có lỗi xảy ra";
      notifyError(isUpdate ? "Cập nhật tài khoản thất bại: " + errorMessage : "Tạo tài khoản thất bại: " + errorMessage);
    }
  };

  // Delete
  const handleDelete = async (accountId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) return;
    try {
      // Backend expects /Account/SoftDelete?encode=...
      await authService.softDeleteAccounts(accountId);
      await fetchAccounts();
      notifySuccess("Xóa tài khoản thành công!");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Có lỗi xảy ra";
      notifyError("Xóa tài khoản thất bại: " + errorMessage);
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
                disabled={!!editingAccount}
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
              <label>Trạm</label>
              <select
                name="stationId"
                value={formData.stationId}
                onChange={handleChange}
              >
                <option value="">Chọn trạm (tùy chọn)</option>
                {stations.map((s) => (
                  <option key={s.stationId} value={s.stationId}>
                    {s.stationName || s.address}
                  </option>
                ))}
              </select>
              {formErrors.stationId && <span className="field-error">{formErrors.stationId}</span>}

              {/* Email */}
              <label>Email *</label>
              <input
                type="email"
                name="email"
                placeholder="Nhập email"
                value={formData.email}
                onChange={handleChange}
              />
              {formErrors.email && <span className="field-error">{formErrors.email}</span>}

              {/* Password */}
              {!editingAccount ? (
                <>
                  <label>Mật khẩu (mặc định)</label>
                  <input
                    type="text"
                    name="password"
                    placeholder="Mặc định: default@123"
                    value={formData.password || "default@123"}
                    onChange={handleChange}
                  />
                </>
              ) : (
                <>
                  <label>Mật khẩu mới (để trống nếu không đổi)</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Để trống nếu không muốn thay đổi mật khẩu"
                    value={formData.password || ""}
                    onChange={handleChange}
                  />
                </>
              )}

              {/* Status */}
              <label>Trạng thái</label>
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
