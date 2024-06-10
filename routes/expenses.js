const express = require("express");
const router = require("./Routes"); // 引用路由器

const db = require("../models");
const expenseTracker = db.expenseTracker;

router.get("/", (req, res) => {
  res.render("index");
});

// router.get("/Expense-Tracker", (req, res) => {
//   return expenseTracker.findAll()
//   .then((expenses) => res.send({ expenses}))
//   .catch((err) => res.status(422).json(err))
// });

router.get("/new", (req, res) => {
  return res.render("new");
});

router.post("/", (req, res, next) => {
  const { name, date, category, amount } = req.body;
  const userId = req.user.id;
  const categoryId = req.category.id;

  return Expense.create({ name, date, category, amount, userId, categoryId })
    .then(() => {
      req.flash("success", "Added successfully");
      res.redirect("Expense-Tracker");
    })
    .catch((error) => {
      error.errorMessage = "Failed to create";
      next(error);
    });
});

router.get("/:id", (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id;
  const categoryId = req.category.id;

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
      error.errorMessage = "Failed to load";
      next(error);
    });
});

router.put("/:id", (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id;
  const categoryId = req.category.id;

  return Expense.findByPk(id, {
    attributes: ["id", "name", "date", "amount", "userId", "categoryId"],
  }).then((expense) => {
    if (!expense) {
      req.flash("error", "Data not found");
      return res.redirect("/Expense-Tracker");
    }
    if (expense.userId !== userId) {
      req.flash("error", "Unauthorized access");
      return res.redirect("/Expense-Tracker");
    }
    return expense
      .update(body)
      .then(() => {
        req.flash("success", "Edited successfully");
        res.redirect(`/Expense-Tracker/${id}`);
      })
      .catch((error) => {
        error.errorMessage = "Failed to edit";
        next(error);
      });
  });
});

router.delete("/:id", (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id;
  const categoryId = req.category.id;

  return Expense.findByPk(id, {
    attributes: ["id", "name", "date", "amount", "userId", "categoryId"],
  }).then((expense) => {
    if (!expense) {
      req.flash("error", "Data not found");
      return res.redirect("/Expense-Tracker");
    }
    if (expense.userId !== userId) {
      req.flash("error", "Unauthorized access");
      return res.redirect("/Expense-Tracker");
    }
    return expense
      .destroy()
      .then(() => {
        req.flash("success", "Deleted successfully");
        res.redirect("/Expense-Tracker");
      })
      .catch((error) => {
        error.errorMessage = "Failed to delete";
        next(error);
      });
  });
});

// 匯出路由器
module.exports = router;
