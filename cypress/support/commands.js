const fillInput = (selector, value) => {
  cy.get(selector).should("exist").clear().type(value);
};

Cypress.Commands.add("loginViaUI", () => {
  const email = Cypress.env("loginEmail");
  const password = Cypress.env("loginPassword");

  if (!email || !password) {
    throw new Error("Missing login credentials in Cypress env configuration.");
  }

  cy.visit("/login");
  cy.intercept("POST", "**/Authen/Login").as("loginRequest");

  fillInput('input[placeholder="Email Address"]', email);
  fillInput('input[placeholder="Password"]', password);

  cy.contains("button", "Sign in").should("be.enabled").click();
  cy.wait("@loginRequest").its("response.statusCode").should("eq", 200);
  cy.url({ timeout: 20000 }).should("include", "/userPage");
});

