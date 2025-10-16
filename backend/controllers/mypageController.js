const mypageService = require("../services/mypageService");

const mypageController = {
  // 저장된 일정 상세 조회
  getScheduleDetail: async (req, res) => {
    try {
      const scheduleId = parseInt(req.params.planId, 10);
      const schedule = await mypageService.getScheduleDetail(scheduleId);

      if (!schedule) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: "해당 일정을 찾을 수 없습니다.",
          data: null,
        });
      }

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: "저장된 일정 상세 정보가 성공적으로 조회되었습니다.",
        data: schedule,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: error.message || "일정 상세 조회에 실패하였습니다.",
      });
    }
  },

  // 일정에 후기 작성
  createReview: async (req, res) => {
    try {
      // const scheduleId = parseInt(req.params.scheduleId, 10);
      const {
        planId,
        userKey,
        rate,
        title,
        content,
        companioonsType,
        travleStyles,
        budget,
        img_path,
      } = req.body;

      // 필수 입력값 검증
      if (!userKey || !rate || !title || !content) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "필수 입력값이 누락되었습니다.",
          data: null,
        });
      }

      const result = await mypageService.createReview({
        planId,
        userKey,
        rate,
        title,
        content,
        companioonsType,
        travleStyles,
        budget,
        img_path,
      });

      if (!result.success) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: "해당 일정을 찾을 수 없습니다.",
          data: null,
        });
      }

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: "일정에 대한 후기가 성공적으로 작성되었습니다.",
        data: {
          reviewId: result.reviewId,
          scheduleId: scheduleId,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: error.message || "후기 작성에 실패하였습니다.",
      });
    }
  },

  // 일정 삭제
  deletePlan: async (req, res) => {
    try {
      const planId = parseInt(req.params.planId, 10);
      // const { userKey } = req.body;

      if (!userKey) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "비밀번호를 입력해주세요.",
          data: null,
        });
      }

      const result = await mypageService.deleteReview(planId);

      if (!result.success) {
        if (result.statusCode === 404) {
          return res.status(404).json({
            success: false,
            statusCode: 404,
            message: "해당 후기를 찾을 수 없습니다.",
            data: null,
          });
        }

        if (result.statusCode === 401) {
          return res.status(401).json({
            success: false,
            statusCode: 401,
            message: "비밀번호가 일치하지 않아 삭제 권한이 없습니다.",
            data: null,
          });
        }
      }

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: "삭제되었습니다.",
        data: {},
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: error.message || "후기 삭제에 실패하였습니다.",
      });
    }
  },
};

module.exports = mypageController;
