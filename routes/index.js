// 引用 Express 與 Express 路由器
const express = require("express");
const router = express.Router();
const passport = require("passport");

router.get("/", (req, res) => {
  res.render("index");
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/Expense-Tracker",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

router.get(
  "/login/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/oauth2/redirect/facebook",
  passport.authenticate("facebook", {
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
    return res.redirect("/login")
  })
})

// 匯出路由器
module.exports = router;
