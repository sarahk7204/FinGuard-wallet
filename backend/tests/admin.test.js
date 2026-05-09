const request = require("supertest");
const app = require("../app");

describe("Admin APIs", () => {
  test("GET /api/health", async () => {
    const response = await request(app).get("/api/health");
    expect(response.statusCode).toBe(200);
  });
});