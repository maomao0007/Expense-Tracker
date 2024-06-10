const express = require("express")
const app = express()
const router = require("./routes");
const port = "3000";

const { engine } = require("express-handlebars");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");

const messageHandler = require("./middlewares/message-handler");
const errorHandler = require("./middlewares/error-handler");

if (process.env.NODE_ENV === "development") {
  require("dotenv").config();
}

const passport = require("passport");

app.engine(".hbs", engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");
app.set("views", "./views");

//用於解析 POST 請求中的 URL 編碼的表單資料
app.use(express.urlencoded({ extended: true }));
// 設置 method-override 中介軟體
app.use(methodOverride("_method"));

// 解析在 public 檔案裡的靜態文件目錄
app.use(express.static("public"));

// 設置 session 中介軟體
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// 設置 connect-flash 中介軟體
app.use(flash());

// 設置 passport 中介軟體
app.use(passport.initialize());
app.use(passport.session());

app.use(messageHandler);

app.use(router) // 將 request 導入路由器

app.use(errorHandler);

app.listen(port, () => {
  console.log(`express server is running on http://localhost:${port}`);
})