const request = require("supertest");

module.exports = function routes(app) {
  describe("Hello Endpoints", () => {
    it("should say hello", async () => {
      const res = await request(app).get("/api/v1/hello").send();
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("msg", "hello there!");
    });
  });
};
