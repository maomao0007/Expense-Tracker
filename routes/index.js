// 引用 Express 與 Express 路由器
const express = require("express");
const router = express.Router();

const passport = require("passport");
const LocalStrategy = require("passport-local");

const db = require('../models')
const User = db.User

router.use("/Expenses-Tracker", expenses);

router.get("/", (req, res) => {
  res.render("index");
});

passport.use(new LocalStrategy({ usernameField: "email" }, (username, password, done) => {
  return User.findOne({
    attributes: ["id", "name", "email", "password"],
    where: { email: username },
    raw:true
  })
  .then((user) => {
  if(!user || user.password !== password) {
    return done(null, false, { message: "Incorrect email or password."})
  }
  return done(null, user)
})
  .catch((error) => {
  error.errorMessage = "Failed to login."
  done(error)
  })
}))

passport.serializeUser((user, done) => {
  const { id, name, email } = user;
  return done(null, { id, name, email });
});

passport.deserializeUser((user, done) => {
  // 設定資料如何從 session取出
  done(null, { id: user.id });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/Expense-Tracker",
    failureRedirect: "/login",
    failureFlash: true,
  })
);
  
const expenses = require("./Expense-Tracker");
const users = require("./users");

const authHandler = require("../middlewares/auth-handler");
router.user("/Expense-Tracker", authHandler, expenses);
router.user("/users", users);

router.post("/logout", (req, res) => {
  req.logout((error) => {
    if (error) {
      next(error)
    }
    return res.redirect("login")
  })
})


// 匯出路由器
module.exports = router;
