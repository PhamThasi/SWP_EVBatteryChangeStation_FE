// vietmapService.js
// Nhiệm vụ: hỗ trợ search + geocode + routing VietMap API

export const vietmapService = {
  // Lấy toạ độ theo địa chỉ (sử dụng search + place)
  geocodeAddress: async (API_KEY, address, focus = null, displayType = 1) => {
    try {
      if (!address || !API_KEY) return null;
      const cleanAddress = address
        .replace(/(Thành Phố|TP\.?|Tỉnh|Quận|Q\.?|Huyện|Phường|P\.?|Xã)/gi, "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
        .slice(-3)
        .join(",");

      const focusParam = focus ? `&focus=${focus.lat},${focus.lng}` : "";
      const searchUrl = `https://maps.vietmap.vn/api/search/v4?apikey=${API_KEY}&text=${encodeURIComponent(
        cleanAddress
      )}${focusParam}&display_type=${displayType}`;

      const res = await fetch(searchUrl);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) return null;

      const refid = data[0]?.ref_id;
      if (!refid) return null;

      const placeUrl = `https://maps.vietmap.vn/api/place/v4?apikey=${API_KEY}&refid=${refid}`;
      const placeRes = await fetch(placeUrl);
      const placeData = await placeRes.json();

      return { lat: placeData.lat, lng: placeData.lng };
    } catch (err) {
      console.error("🚨 geocodeAddress error:", err);
      return null;
    }
  },

  // hiển_: gọi search API riêng để tìm theo từ khoá
  searchPlace: async (API_KEY, text, userLocation = null) => {
    try {
      const focusParam = userLocation
        ? `&focus=${userLocation[1]},${userLocation[0]}`
        : "";
      const url = `https://maps.vietmap.vn/api/search/v4?apikey=${API_KEY}&text=${encodeURIComponent(
        text
      )}${focusParam}&display_type=1`;
      const res = await fetch(url);
      return await res.json();
    } catch (err) {
      console.error("🚨 searchPlace error:", err);
      return null;
    }
  },

  // hiển_: gọi place API để lấy thông tin chi tiết (lat/lng)
  getPlaceByRef: async (API_KEY, refid) => {
    try {
      const url = `https://maps.vietmap.vn/api/place/v4?apikey=${API_KEY}&refid=${refid}`;
      const res = await fetch(url);
      return await res.json();
    } catch (err) {
      console.error("🚨 getPlaceByRef error:", err);
      return null;
    }
  },
};
