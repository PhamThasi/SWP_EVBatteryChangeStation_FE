describe("UI smoke tests", () => {
  it("renders hero section on homepage and navigates to subscriptions", () => {
    cy.visit("/");
    cy.contains("h1", "Genki Power").should("be.visible");
    cy.contains("button", "Xem gói dịch vụ").click();
    cy.url().should("include", "/subscriptions");
    cy.contains("h1", "Chọn Gói Dịch Vụ Swap Pin").should("be.visible");
  });

  it("shows subscription cards on public subscriptions page", () => {
    cy.visit("/userPage/subscriptions");
    cy.contains("h1", "Chọn Gói Dịch Vụ Swap Pin").should("be.visible");
    cy.get("div").filter(".grid").should("exist");
  });

  it("displays login form controls", () => {
    cy.visit("/login");
    cy.contains("h1", "WELCOME BACK!").should("be.visible");
    cy.get('input[placeholder="Email Address"]').should("exist");
    cy.get('input[placeholder="Password"]').should("exist");
    cy.contains("button", "Sign in").should("be.enabled");
  });
});

