describe("User login and sidebar navigation", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it("logs in with valid credentials via UI", () => {
    cy.loginViaUI();
    cy.contains("Bảng điều khiển", { timeout: 10000 }).should("be.visible");
  });

  it("shows user sidebar menus after login", () => {
    cy.loginViaUI();
    cy.contains("button", "☰").click();
    
    [
      "Đặt lịch",
      "Danh sách các dòng xe điện",
      "Trạm chuyển đổi pin",
      "Các gói dịch vụ",
      "Lịch sử giao dịch",
      "Bảng điều khiển",
      "Thông tin cá nhân",
      "Yêu cầu hỗ trợ",
      "Đánh giá",
      "Đăng xuất",
    ].forEach((label) => {
      cy.contains(label).should("be.visible");
    });
  });
});

