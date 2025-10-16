const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

// 검색은 /search를 먼저 정의 (/:id보다 앞에 위치해야 함)
router.get("/search", reviewController.searchReviews);

// 리뷰 조회
router.get("/", reviewController.getAllReviews);
router.get("/:id", reviewController.getReviewById);

// 내가 작성한 리뷰 조회
router.post("/my-reviews", reviewController.getMyReviews);

module.exports = router;
