const express = require("express")
const app = express()
const { engine } = require("express-handlebars");

const db = require("./models")
const expenseTracker = db.expenseTracker;

const port = 3000

app.engine(".hbs", engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");
app.set("views", "./views");

// app.get('/', (req, res) => {
//   res.send("hello")
// })

  app.get("/", (req, res) => {
    res.render("index");
  })

app.get("/expenses", (req, res) => {
  return expenseTracker.findAll()
  .then((expenses) => res.send({ expenses}))
  .catch((err) => res.status(422).json(err))
});

app.listen(port, () => {
  console.log(`express server is running on http://localhost:${port}`);
})