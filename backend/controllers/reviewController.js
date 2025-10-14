const reviewService = require('../services/reviewService');

const reviewController = {
    getAllReviews: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await reviewService.getAllReviews(page, limit);

            res.status(200).json({
                success: true,
                statusCode: 200,
                message: "성공적으로 조회되었습니다.",
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                statusCode: 500,
                message: error.message || "리뷰 목록 조회에 실패하였습니다.",
            });
        }
    },

getReviewById: async (req, res) => {
    try {
        const reviewId = parseInt(req.params.id, 10);
        const review = await reviewService.getReviewById(reviewId);
        
        if(!review) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                message: "조회에 실패하였습니다.",
                data: null
            });
        }

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "성공적으로 조회되었습니다.",
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: error.message || "리뷰 상세 조회에 실패하였습니다."
            });
    }

},

  // 리뷰 검색
  searchReviews: async (req, res) => {
    try {
      const { departure, arrival, keyword } = req.query;
      const reviews = await reviewService.searchReviews({ departure, arrival, keyword });
      
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: "성공적으로 조회되었습니다.",
        data: reviews
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: error.message || "리뷰 검색에 실패하였습니다."
      });
    }
  }
};

module.exports = reviewController;