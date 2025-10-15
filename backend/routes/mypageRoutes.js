const express = require("express");
const router = express.Router();
const mypageController = require("../controllers/mypageController");

// 저장된 일정 상세 조회
router.get("/:scheduleId", mypageController.getScheduleDetail);

// 일정에 후기 작성
router.post("/:scheduleId/review", mypageController.createReview);

// 후기 삭제
router.delete("/my-review/:reviewId", mypageController.deleteReview);

module.exports = router;
