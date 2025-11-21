import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.js",
    video: true,
    screenshotsFolder: "cypress/screenshots",
    videosFolder: "cypress/videos",
  },
  env: {
    apiUrl: "http://localhost:5204/api",
    loginEmail: "anhvietanh1123@gmail.com",
    loginPassword: "123456",
  },
});

