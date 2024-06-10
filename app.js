const express = require("express")
const app = express()
const port = "3000";

const { engine } = require("express-handlebars");
const methodOverride = require("method-override");
const flash = require("connect-flash");

const db = require("./models")
const expenseTracker = db.expenseTracker;

const messageHandler = require("./middlewares/message-handler");
const errorHandler = require("./middlewares/error-handler");

app.engine(".hbs", engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");
app.set("views", "./views");

//用於解析 POST 請求中的 URL 編碼的表單資料
app.use(express.urlencoded({ extended: true }));

// 解析在 public 檔案裡的靜態文件目錄
app.use(express.static("public"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());

app.get("/", (req, res) => {
    res.render("index");
  })

app.get("/", (req, res) => {
     res.redirect("/Expense-Tracker");
   });

// app.get("/Expense-Tracker", (req, res) => {
//   return expenseTracker.findAll()
//   .then((expenses) => res.send({ expenses}))
//   .catch((err) => res.status(422).json(err))
// });

app.get("/Expense-Tracker/new", (req, res) => {
  return res.render("new")
})

app.post("/Expense-Tracker", (req, res, next) => {
  const { name, date, category, amount } = req.body;
  const userId = req.user.id;
  const categoryId = req.category.id

  return Expense.create({ name, date, category, amount, userId, categoryId })
    .then(() => {
      req.flash("success", "Added successfully");
      res.redirect("Expense-Tracker")
    })
    .catch((error) => {
      error.errorMessage = "Failed to create"
      next(error);
    })  
})

app.get("/Expense-Tracker/:id", (req, res, next ) => {
  const id = req.params.id
  const userId = req.user.id
  const categoryId = req.category.id

  return Expense.findByPk(id, {
    attributes: ["id", "name", "date", "amount", "userId", "categoryId"],
    raw: true,
  })
    .then(() => {
    if (!expense) {
      req.flash("error", "Data not found");
      return res.redirect("/Expense-Tracker");
    }
    if (expense.userId !== userId) {
      req.flash("error", "Unauthorized access");
      return res.redirect("/Expense-Tracker");
    }
    res.render("detail", { expense });
  })
    .catch((error) => {
      error.errorMessage = "Failed to load"
      next(error);
    })
})

app.put("/Expense-Tracker/:id", (req, res, next ) => {
  const id = req.params.id
  const userId = req.user.id
  const categoryId = req.category.id

  return Expense.findByPk(id, {
    attributes: ["id", "name", "date", "amount", "userId", "categoryId"]
  })
    .then((expense) => {
			if (!expense) {
				req.flash('error', 'Data not found')
				return res.redirect('/Expense-Tracker')
			}
			if (expense.userId !== userId) { 
				req.flash('error', 'Unauthorized access')
				return res.redirect('/Expense-Tracker')
			}
   return expense.update(body)
     .then(() => {
      req.flash("success", "Edited successfully")
      res.redirect(`/Expense-Tracker/${id}`)
     })
     .catch((error) => {
      error.errorMessage="Failed to edit"
      next(error)
     })
   })
})

app.delete("/Expense-Tracker/:id", (req, res, next ) => {
  const id = req.params.id
  const userId = req.user.id
  const categoryId = req.category.id

  return Expense.findByPk(id, {
    attributes: ["id", "name", "date", "amount", "userId", "categoryId"]
  })
    .then((expense) => {
			if (!expense) {
				req.flash('error', 'Data not found')
				return res.redirect('/Expense-Tracker')
			}
			if (expense.userId !== userId) { 
				req.flash('error', 'Unauthorized access')
				return res.redirect('/Expense-Tracker')
			}
  return expense.destroy()
    .then(() =>{
     req.flash("success", "Deleted successfully")
     res.redirect("/Expense-Tracker")
    })
    .catch((error) => {
      error.errorMessage="Failed to delete"
      next(error)
    })
  })
})

app.listen(port, () => {
  console.log(`express server is running on http://localhost:${port}`);
})