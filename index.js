require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// cors
const cors = require("cors");
app.use(cors());

// JSON 파싱을 위한 미들웨어
app.use(express.json());

// 라우터 가져오기
const planRouter = require("./backend/routes/planRoutes");
app.use("/", planRouter);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const reviewRoutes = require("./backend/routes/reviewRoutes");
app.use("/reviews", reviewRoutes);

const mypageRoutes = require("./backend/routes/mypageRoutes");
app.use("/mypage", mypageRoutes);

const { supabase } = require("./backend/utils/supabase");

app.post('/api', async (req, res) => {
  try {
    const { password, text } = req.body;

    const { data, error } = await supabase.from('ai').insert([
      {
        userKey: password,
        departure: text.departure,
        companions: text.companions,
        companionsType: text.companionsType,
        travelStyle: text.travelStyle,
        budget: text.budget,
        recommendation: text.recommendation,
        reviewKey: null
      }
    ])

    if (error) {
			res.status(500).json({ error: error.message });
			return;
		}

	res.status(201).json({success: true, data: {}});
  
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
  
})