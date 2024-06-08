const express = require("express")
const app = express()

const db = require("./models")
const expenseTracker = db.expenseTracker;

const port = 3000

app.get('/', (req, res) => {
  res.send("hello")
})

app.get('/',)

app.get("/expenses", (req, res) => {
  return expenseTracker.findAll()
  .then((expenses) => res.send({ expenses}))
  .catch((err) => res.status(422).json(err))
});

app.listen(port, () => {
  console.log(`express server is running on http://localhost:${port}`);
})