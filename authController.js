//функції по взаємодії з юзером - авторизація, реєстрація, отримання юзерів

// клас створений для зручності групування

const User = require("./models/User.js");
const Role = require("./models/Role.js");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const { validationResult} = require('express-validator');
const {secret} = require('./config.js')

const generateAccessToken = (id, roles) => {
    const payload = {
        id, roles
    }
    return jwt.sign(payload, secret, { expiresIn: "24h" });
}

class authController {

  async registration(req, res) {
      try {
        const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
          };

      const { username, password } = req.body;
      const candidate = await User.findOne({ username });

      if (candidate) {
        return res
          .status(400)
              .json({ message: "User with this name already exists" });
            };
// спробували знайти користувача з цим username
        // якщо зайшли,то кидаємо помилку,що вже такий існує
        // якщо знайшли - захешували пароль 
        // створили користувача. Зберегли його в БД і повернули відповідь на клієнт
        //
    //   const salt = bcrypt.genSaltSync(5);
      const hashPassword = bcrypt.hashSync(password, 7);

      const userRole = await Role.findOne({ value: "user" });

      const user = new User({
        username,
        password: hashPassword,
        roles: [userRole.value]
      });

      await user.save();

      return res.json({ message: "User registered successfully" });
    
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: "Registration error" });
    }
  }

  async login(req, res) {
      try {
          const { username, password } = req.body;
          const user = await User.findOne({ username });
          if (!user) {
              return res.status(400).json({ message: `User ${username} was not found` });
          }
          const validPassword = bcrypt.compareSync(password, user.password);
          if (!validPassword) {
             return res.status(400).json({ message: "wrong password" });
          };

          const token = generateAccessToken(user._id, user.roles);
          return res.json({ token });
          
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: "Login error" });
    }
  }

  async getUsers(req, res) {
    try {
      // костиль для запису ролей в Монго Атлас
      // const userRole = new Role();
      // const adminRole = new Role({ value: "admin" });
      // await userRole.save();
      // await adminRole.save();
    //   res.json("server works");

        const users = await User.find();
        res.json(users);
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = new authController();
