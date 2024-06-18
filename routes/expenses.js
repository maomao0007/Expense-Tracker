const express = require("express");
const router = express.Router();

const db = require("../models");
const Expense = db.Expense;

const formatDate = function (date) {
  const day = ("0" + date.getDate()).slice(-2); // 保證兩位數
  const month = ("0" + (date.getMonth() + 1)).slice(-2); // 保證兩位數
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};
// 創建一個新的 Date 對象，代表當前日期和時間
const date = new Date();

router.get("/", async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 12; // 12 items per page
  const userId = req.user.id;
  const categoryId = req.query.categoryId;
  const sortBy = req.query.sortBy;

  const categories = {
    1: {
      name: "Housing and Utilities",
      icon: "fa-solid fa-house",
    },
    2: {
      name: "Transportation and Commuting",
      icon: "fa-solid fa-van-shuttle",
    },
    3: {
      name: "Leisure and Entertainment",
      icon: "fa-solid fa-face-grin-beam",
    },
    4: {
      name: "Food and Dining",
      icon: "fa-solid fa-utensils",
    },
    5: {
      name: "Others",
      icon: "fa-solid fa-pen",
    },
  };
    // dropdown box setting
    const sortOptionsMap = {
      housing_asc: { categoryFilter: 1, order: [["name", "ASC"]] },
      transportation_asc: { categoryFilter: 2, order: [["name", "ASC"]] },
      leisure_asc: { categoryFilter: 3, order: [["name", "ASC"]] },
      food_asc: { categoryFilter: 4, order: [["name", "ASC"]] },
      others_asc: { categoryFilter: 5, order: [["name", "ASC"]] },
      name_asc: { order: [["name", "ASC"]] },
      name_desc: { order: [["name", "DESC"]] },
      date_asc: { order: [["date", "ASC"]] },
      date_desc: { order: [["date", "DESC"]] },
      amount_asc: { order: [["amount", "ASC"]] },
      amount_desc: { order: [["amount", "DESC"]] },
    };

  const orderOption = sortOptionsMap[sortBy] || [["name", "ASC"]];

  try {

    let whereCondition = { userId };
    let orderOption = [["name", "ASC"]]; // Default order

    if (sortBy && sortOptionsMap[sortBy]) {
      const { categoryFilter, order } = sortOptionsMap[sortBy];
      if (categoryFilter !== undefined) {
        whereCondition.categoryId = categoryFilter;
      }
      if (order) {
        orderOption = order;
      }
    }
    // calculate the total amount of expenses
    const totalAmount = await Expense.sum("amount", { where: whereCondition });

    // retrieve all expenses
    const expenses = await Expense.findAll({
      attributes: ["id", "name", "date", "amount", "userId", "categoryId"],
      // where: { userId },
      where: whereCondition,
      order: orderOption,
      offset: (page - 1) * limit,
      limit,
      raw: true,
    });

    // Map categoryId to icon and format date for each expense
    expenses.forEach((expense) => {
      expense.icon = categories[expense.categoryId].icon;
      expense.categoriesName = categories[expense.categoryId].name;
      expense.formattedDate = formatDate(new Date(expense.date));
    });
    
      console.log("expenses", expenses);
 

    res.render("index", {
      expenses,
      totalAmount,
      order: sortBy,
      // filter: categoryId,
      prev: page > 1 ? page - 1 : page, // if the current page > 1 , minus 1 ; otherwise, show the current page
      next: page + 1,
      page, // the current page
    });
  } catch (error) {
    error.errorMessage = "Failed to load";
    next(error);
  }
})

router.get("/new", (req, res) => {
  return res.render("new");
});

router.post("/", (req, res, next) => {
  const { name, date, amount, categoryId } = req.body;
  const userId = req.user.id;

  return Expense.create({ name, date, amount, userId, categoryId })
    .then(() => {
      req.flash("success", "Added successfully");
      res.redirect("/Expense-Tracker");
    })
    .catch((error) => {
      error.errorMessage = "Failed to create";
      next(error);
    });
});

router.get("/:id/edit", (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id;

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
      expense.formattedDate = formatDate(new Date(expense.date));

      res.render("edit", {
        expense,
        date: expense.formattedDate,
      });
    })
    .catch((error) => {
      error.errorMessage = "Failed to edit";
      next(error);
    });
});

router.put("/:id", (req, res, next) => {
  const { name, date, amount, categoryId } = req.body;
  const id = req.params.id;
  const userId = req.user.id;

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
    expense.formattedDate = formatDate(new Date(expense.date));
    return expense
      .update({ name, date, amount, categoryId })
      .then(() => {
        console.log("expense", expense);
        req.flash("success", "Edited successfully");
        res.redirect("/Expense-Tracker");
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
  // const categoryId = req.body.categoryId;

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
    return expense.destroy()
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
