const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// cors
const cors = require("cors");
app.use(cors());

// JSON 파싱을 위한 미들웨어
app.use(express.json());

app.get("/", (req, res) => {
  res.send("돔황챠 프로젝트 실행중...");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// 라우터 가져오기
const planRoutes = require("./backend/routes/planRoutes");
app.use("/", planRoutes);

const reviewRoutes = require("./backend/routes/reviewRoutes");
app.use("/reviews", reviewRoutes);

const mypageRoutes = require("./backend/routes/mypageRoutes");
app.use("/mypage", mypageRoutes);

const myReviewRoutes = require("./backend/routes/myReviewRoutes");
app.use("/my-review", myReviewRoutes);
