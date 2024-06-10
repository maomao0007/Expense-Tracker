// 引用 Express 與 Express 路由器
const express = require("express");
const router = express.Router();

// 準備引入路由模組
const expenses = require("./expenses");

router.use("/Expenses-Tracker", expenses);

router.get("/", (req, res) => {
  res.render("index");
});

// 匯出路由器
module.exports = router;
