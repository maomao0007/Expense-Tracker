const express = require("express");
const router = express.Router();

const db = require("../models");
const Expense = db.Expense;

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/", (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 12; // 12 items per page
  const userId = req.user.id;

  const category = {
  "Housing and Utilities": "https://fontawesome.com/icons/home?style=solid",
  "Transportation and Commuting": "https://fontawesome.com/icons/shuttle-van?style=solid",
  "Leisure and Entertainment": "https://fontawesome.com/icons/grin-beam?style=solid",
  "Food and Dining": "https://fontawesome.com/icons/utensils?style=solid",
  "Others": "https://fontawesome.com/icons/pen?style=solid"
}

  // let sortAttributes = req.query.sortAttributes || "";
  // let sortMethods = req.query.sortAttributes || "ASC" 
  
  // dropdown box setting
  const sortOptions = {
    housing: [["Housing and Utilities"]],
    transportation: [["Transportation and Commuting"]],
    leisure: [["Leisure and Entertainment"]],
    food: [["Food and Dining"]],
    others: [["Others"]],
    name_asc: [["name", "ASC"]],
    name_desc: [["name", "DESC"]],
    date_asc: [["date", "ASC"]],
    date_desc: [["date", "DESC"]],
    amount_asc: [["amount", "ASC"]],
    amount_desc: [["amount", "DESC"]],
  };
let totalAmount;
Expense.sum("amount", { where: { userId } })
  .then(sum => {
    totalAmount = sum;
  })
  .catch(error => {
    error.errorMessage = "Failed to load";
    next(error);
  });
  return Expense.findAll({
    attributes: [name, date, category, amount, userId, categoryId],
    where: { userId },
    offset: (page - 1) * limit,
    limit,
    raw: true,
  })
    .then((expense) => {
      res.render("index", {
        expense,
        order:sortOptions,
        prev: page > 1 ? page - 1 : page, // if the current page > 1 , minus 1 ; otherwise, show the current page
        next: page + 1,
        page, // the current page
      });
    })
    .catch((error) => {
      error.errorMessage = "Failed to load";
      next(error);
    })
});

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

router.get("/:id/edit", (req, res, next) => {
   const id = req.params.id;
   const userId = req.user.id;
   const categoryId = req.category.id;
  return Expense.findByPk(id, {
    attributes: ["id", "name", "date", "amount", "userId", "categoryId"],
    raw: true,
  })
  .then((expense) => {
    if (!expense) {
      req.flash("error", "Data not found");
      return res.redirect("/Expense-Tracker");
    }
    if (expense.userId !== userId) {
      req.flash("error", "Unauthorized access");
      return res.redirect("/Expense-Tracker");
    }
      res.render("edit", { expense })
  })
      .catch((error) => {
        error.errorMessage = "Failed to edit";
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
