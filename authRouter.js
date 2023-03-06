// маршрути для запитів

const Router = require("express");
const router = new Router();
const authController = require("./authController.js");
const { body } = require("express-validator"); // це middleware. https://express-validator.github.io/docs
const authMiddleware = require('./middleware/authMiddleware.js');
const roleMiddleware = require('./middleware/roleMiddleware.js');

router.post(
  "/registration",
  [
    body("username", "User Name cannot be empty").notEmpty(),
    body(
      "password",
      "Password should be more then 4 and less then 10 symbols"
    ).isLength({ min: 4, max: 10 }),
  ],
  authController.registration);

router.post("/login", authController.login);


// router.get("/users", authMiddleware, authController.getUsers);
router.get("/users", roleMiddleware('admin'), authController.getUsers);

module.exports = router;
