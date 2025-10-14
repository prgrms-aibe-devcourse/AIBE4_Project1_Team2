const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");

// 기본 경로 '/'에 GET 요청이 들어오면 homeController.getHome 함수를 실행합니다.
router.get("/", homeController.getHome);

module.exports = router;
