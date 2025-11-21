import axiosClient from "./axiosClient";

// Cache roles để tránh fetch nhiều lần
let rolesCache = null;
let rolesCacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

const roleService = {
  getAllRoles: async (forceRefresh = false) => {
    try {
      // Kiểm tra cache
      if (!forceRefresh && rolesCache && rolesCacheTime) {
        const now = Date.now();
        if (now - rolesCacheTime < CACHE_DURATION) {
          return rolesCache;
        }
      }

      const response = await axiosClient.get("/Role/GetAll");
      const roles = response.data?.data || [];
      
      // Lưu vào cache
      rolesCache = roles;
      rolesCacheTime = Date.now();
      
      return roles;
    } catch (error) {
      console.error("Error getting all roles:", error);
      throw error;
    }
  },

  // Lấy role theo tên (case-insensitive)
  getRoleByName: async (roleName) => {
    const roles = await roleService.getAllRoles();
    const normalized = (roleName || "").toLowerCase();
    return roles.find(
      (r) => (r.roleName || "").toLowerCase() === normalized
    );
  },

  // Lấy role ID theo tên
  getRoleIdByName: async (roleName) => {
    const role = await roleService.getRoleByName(roleName);
    return role?.roleId || null;
  },

  // Lấy route path dựa trên role name hoặc roleId
  getRedirectPathByRole: async (roleName, roleId) => {
    const roles = await roleService.getAllRoles();
    
    // Ưu tiên tìm theo roleId
    if (roleId) {
      const normalizedId = (roleId || "").toLowerCase();
      const roleById = roles.find(
        (r) => (r.roleId || "").toLowerCase() === normalizedId
      );
      if (roleById) {
        return roleService._mapRoleToRoute(roleById.roleName);
      }
    }

    // Fallback theo roleName
    if (roleName) {
      return roleService._mapRoleToRoute(roleName);
    }

    return "/userPage"; // Default
  },

  // Map role name sang route path
  _mapRoleToRoute: (roleName) => {
    const normalized = (roleName || "").toLowerCase();
    switch (normalized) {
      case "admin":
        return "/admin";
      case "staff":
        return "/staff";
      case "customer":
      case "user":
        return "/userPage";
      default:
        return "/userPage";
    }
  },

  // Clear cache (dùng khi cần refresh)
  clearCache: () => {
    rolesCache = null;
    rolesCacheTime = null;
  },
};

export default roleService;
