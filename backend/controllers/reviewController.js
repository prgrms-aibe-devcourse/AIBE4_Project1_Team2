const reviewService = require("../services/reviewService");
const { handleSuccess, handleError } = require("../utils/responseHandler");

const reviewController = {
  getAllReviews: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await reviewService.getAllReviews(page, limit);

      handleSuccess(res, 200, "성공적으로 조회되었습니다.", result);
    } catch (error) {
      handleError(res, "리뷰 목록 조회에 실패하였습니다.", error);
    }
  },

  getReviewById: async (req, res) => {
    try {
      const reviewId = parseInt(req.params.planId, 10);
      const review = await reviewService.getReviewById(reviewId);

      if (!review) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: "조회에 실패하였습니다.",
          data: null,
        });
      }

      handleSuccess(res, 200, "성공적으로 조회되었습니다.", review);
    } catch (error) {
      handleError(res, "리뷰 상세 조회에 실패하였습니다.", error);
    }
  },

  // 리뷰 검색
  searchReviews: async (req, res) => {
    try {
      // req.query에서 minRate를 숫자로 변환합니다.
      const filters = {
        ...req.query,
        minRate: req.query.minRate ? parseInt(req.query.minRate, 10) : undefined,
      };

      // 변환된 필터를 서비스로 전달합니다.
      const reviews = await reviewService.searchReviews(filters);

      handleSuccess(res, 200, "성공적으로 조회되었습니다.", reviews);
    } catch (error) {
      handleError(res, "리뷰 검색에 실패하였습니다.", error);
    }
  },

  // 내가 작성한 리뷰 조회
  getMyReviews: async (req, res) => {
    try {
      const { userKey } = req.body;
      const result = await reviewService.fetchMyReviews(userKey);

      console.log(result);

      handleSuccess(res, 200, "작성한 리뷰가 조회되었습니다.", result);
    } catch (error) {
      console.error("작성한 리뷰 조회에 실패했습니다.", error);
      handleError(res, "작성한 리뷰 조회에 실패했습니다.", error);
    }
  },
};

module.exports = reviewController;
