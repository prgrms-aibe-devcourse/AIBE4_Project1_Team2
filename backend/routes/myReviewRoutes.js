const express = require("express");
const router = express.Router();
const myreviewController = require("../controllers/myreviewController");

// POST /my-review/save
router.post("/save", myreviewController.saveReview);

// DELETE /my-review/:reviewId
router.delete("/:reviewId", myreviewController.deleteReview);

module.exports = router;
