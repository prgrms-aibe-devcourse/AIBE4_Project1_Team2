const express = require("express");
const router = express.Router();
const planController = require("../controllers/planController");

// POST 요청이 /plans 경로로 들어오면 planController.createPlan 함수를 실행
router.post("/plan", planController.createPlan);

// AI 출력 결과 저장
router.post("/plan-save", planController.savePlan);

// 내가 저장한 일정 조회
router.post("/my-plans", planController.getMyPlans);

// 저장한 일정 삭제
router.delete("/my-plans/:planId", planController.deletePlan);

// 특정 planId의 상세 정보를 조회
router.get("/plan/:planId", planController.getPlanById);

module.exports = router;
