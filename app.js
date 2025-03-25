const express = require("express");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const path = require("path");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// 中介層：產生 CSRF Token 並設成 Cookie & 傳入模板
function generateCSRFToken(req, res, next) {
  const csrfToken = crypto.randomBytes(16).toString("hex");
  res.cookie("csrfToken", csrfToken, { httpOnly: false }); // 為了能塞到表單中
  req.csrfToken = csrfToken;
  next();
}

// 中介層：驗證 CSRF Token 是否匹配
function validateCSRFToken(req, res, next) {
  const csrfTokenFromCookie = req.cookies.csrfToken;
  const csrfTokenFromBody = req.body.csrfToken;

  if (
    csrfTokenFromCookie &&
    csrfTokenFromBody &&
    csrfTokenFromCookie === csrfTokenFromBody
  ) {
    next();
  } else {
    res.status(403).send("無效的 CSRF Token，請重新載入頁面再試一次。");
  }
}

// 顯示表單（附帶 Token）
app.get("/", generateCSRFToken, (req, res) => {
  res.render("form", { csrfToken: req.csrfToken });
});

// 處理表單提交
app.post("/transfer", validateCSRFToken, (req, res) => {
  const { recipient, amount } = req.body;

  res.send("轉帳成功！");
});

app.listen(port, () => {
  console.log(`DB Cookie submit App 運行在 http://localhost:${port}/`);
});
