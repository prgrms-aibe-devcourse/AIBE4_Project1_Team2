const express = require("express");
const router = express.Router();
const mypageController = require("../controllers/mypageController");

// 후기 작성
router.post("/save", mypageController.createReview);
// 일정 삭제
router.delete("/:planId", mypageController.deletePlan);

module.exports = router;