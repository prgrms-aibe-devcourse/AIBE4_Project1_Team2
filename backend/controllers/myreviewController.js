const myreviewService = require("../services/myreviewService");
const { handleSuccess, handleError } = require("../utils/responseHandler");

const myreviewController = {
  // 리뷰 저장
  saveReview: async (req, res) => {
    try {
      const { planId, rate, title, content, img_path } = req.body;

      // 필수 필드 검증
      if (!planId || !rate || !title || !content) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "필수 정보가 누락되었습니다. (planId, rate, title, content)",
          data: null,
        });
      }

      // rate 범위 검증 (1~5)
      if (rate < 1 || rate > 5) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "별점은 1~5 사이의 값이어야 합니다.",
          data: null,
        });
      }

      const result = await myreviewService.saveReview({
        planId,
        rate,
        title,
        content,
        img_path,
      });

      // 일정을 찾을 수 없는 경우
      if (result.error === "PLAN_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: "해당 일정을 찾을 수 없습니다.",
          data: null,
        });
      }

      // 성공
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "일정에 대한 후기가 성공적으로 작성되었습니다.",
        data: {
          reviewId: result.reviewId,
          planId: planId,
        },
      });
    } catch (error) {
      console.error("리뷰 저장 중 오류 발생:", error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        message: "리뷰 저장에 실패했습니다.",
        data: null,
      });
    }
  },
  // 리뷰 수정
  saveReview: async (req, res) => {
    try {
      
      const reviewId = parseInt(req.params.reviewId, 10);
      const { planId, rate, title, content, img_path } = req.body;

      // 필수 필드 검증
      if (!reviewId || !planId || !rate || !title || !content) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "필수 정보가 누락되었습니다. (reviewId, planId, rate, title, content)",
          data: null,
        });
      }

      // rate 범위 검증 (1~5)
      if (rate < 1 || rate > 5) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "별점은 1~5 사이의 값이어야 합니다.",
          data: null,
        });
      }

      const result = await myreviewService.updateReview({
        reviewId,
        planId,
        rate,
        title,
        content,
        img_path,
      });

      // 일정을 찾을 수 없는 경우
      if (result.error === "PLAN_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: "해당 일정을 찾을 수 없습니다.",
          data: null,
        });
      }

      // 성공
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "일정에 대한 후기가 성공적으로 작성되었습니다.",
        data: {
          reviewId: result.reviewId,
          planId: planId,
        },
      });
    } catch (error) {
      console.error("리뷰 저장 중 오류 발생:", error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        message: "리뷰 저장에 실패했습니다.",
        data: null,
      });
    }
  },

  // 리뷰 삭제
  deleteReview: async (req, res) => {
    try {
      const reviewId = parseInt(req.params.reviewId, 10);

      // reviewId 유효성 검증
      if (isNaN(reviewId)) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "유효하지 않은 reviewId입니다.",
          data: null,
        });
      }

      const result = await myreviewService.deleteReview(reviewId);

      // 리뷰를 찾을 수 없는 경우
      if (result.error === "REVIEW_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: "해당 리뷰를 찾을 수 없습니다.",
          data: null,
        });
      }

      // 권한 없음 (비밀번호 불일치 등)
      if (result.error === "UNAUTHORIZED") {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: "비밀번호가 일치하지 않아 삭제 권한이 없습니다.",
          data: null,
        });
      }

      // 성공
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "삭제되었습니다.",
        data: {},
      });
    } catch (error) {
      console.error("리뷰 삭제 중 오류 발생:", error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        message: "리뷰 삭제에 실패했습니다.",
        data: null,
      });
    }
  },
};

module.exports = myreviewController;
