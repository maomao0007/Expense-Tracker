const express = require("express")
const app = express()
const router = require("./routes");
const port = "3000";

const { engine } = require("express-handlebars");
const methodOverride = require("method-override");
const flash = require("connect-flash");



const messageHandler = require("./middlewares/message-handler");
const errorHandler = require("./middlewares/error-handler");

app.engine(".hbs", engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");
app.set("views", "./views");

//用於解析 POST 請求中的 URL 編碼的表單資料
app.use(express.urlencoded({ extended: true }));

// 解析在 public 檔案裡的靜態文件目錄
app.use(express.static("public"));

app.use(messageHandler);

app.use(router) // 將 request 導入路由器

app.use(errorHandler);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());



app.listen(port, () => {
  console.log(`express server is running on http://localhost:${port}`);
})