require("dotenv").config()
const express = require('express')
const app = express()
const port = 3000

// cors
const cors = require("cors");
app.use(cors());

// JSON 파싱을 위한 미들웨어
app.use(express.json());

// 라우터 가져오기
const planRouter = require("./backend/routes/planRoute");
app.use("/", planRouter);

app.get('/', (req, res) => {
  res.send('Hello, World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

const reviewRoutes = require('./backend/routes/reviewRoutes');
app.use('/reviews', reviewRoutes);
