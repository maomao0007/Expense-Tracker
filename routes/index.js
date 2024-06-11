// 引用 Express 與 Express 路由器
const express = require("express");
const router = express.Router();

const passport = require("passport");
const LocalStrategy = require("passport-local");
const FacebookStrategy = require("passport-facebook");

const db = require('../models')
const User = db.User

router.use("/Expenses-Tracker", expenses);

router.get("/", (req, res) => {
  res.render("index");
});

passport.use(new LocalStrategy({ usernameField: "email" }, async (username, password, done) => {
try {
    const user = await User.findOne({
    attributes: ["id", "name", "email", "password"],
    where: { email: username },
    raw:true
  })
    if (!user) {
      return done(null, false, { message: "Incorrect email or password." });
    }

    const isMatch = bcrypt.compare(password, user.password)
    
    if (!isMatch) {
      return done(null, false, { message: "Incorrect email or password."});
    }
    return done(null, user);  
    }
    catch((error) => {
        error.errorMessage = "Failed to login";
        done(error)
    }) 
  })
)

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ["email", "displayName"],
    },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const name = profile.displayName;

      let user =  User.findOne({
        attributes: ["id", "name", "email"],
        where: { email },
        raw: true,
      })
      if (user) { 
        return done(null, user);
      }

      const randomPwd = Math.random().toString(36).slice(-8);
      const hash = await bcrypt.hash(randomPwd, 10)
      user = User.create({ name, email, password: hash })

      return done(null, { id: user.id, name: user.name, email: user.email })
    }
      catch((error) => {
      error.errorMessage = "Failed to login.";
      done(error)
    })
  }
 )
)

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
