const express = require("express");
const router = express.Router();
const planController = require("../controllers/planController");

// POST 요청이 /plans 경로로 들어오면 planController.createPlan 함수를 실행
router.post("/plans", planController.createPlan);

module.exports = router;
