import "./commands";

beforeEach(() => {
  // Reset localStorage/token to keep tests isolated
  cy.clearLocalStorage();
  cy.clearCookies();
});

