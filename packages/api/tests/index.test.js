const app = require("../src/index.js");

function importTest(name, path) {
  describe(name, function () {
    const test = require(path);
    test(app);
  });
}

afterAll(function () {
  app.close();
});

describe("Main", function () {
  importTest("Hello", "./hello.routes.js");
});
