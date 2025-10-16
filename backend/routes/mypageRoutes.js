const express = require("express");
const router = express.Router();
const mypageController = require("../controllers/mypageController");

// 저장된 일정 상세 조회
router.get("/:scheduleId", mypageController.getScheduleDetail);

module.exports = router;