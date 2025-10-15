const express = require("express");
const router = express.Router();
const planController = require("../controllers/planController");

// POST 요청이 /plans 경로로 들어오면 planController.createPlan 함수를 실행
router.post("/plans", planController.createPlan);

// AI 출력 결과 저장
router.post("/schedules", planController.savePlan);

// 내가 저장한 일정 조회
router.get("/mypage/schedules", planController.getMyPlans);

module.exports = router;
