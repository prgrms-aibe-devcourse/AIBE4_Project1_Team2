const planService = require("../services/planService");
const { handleSuccess, handleError } = require("../utils/responseHandler");

const reviewController = {
  // 여행 일정 생성 요청을 처리하고 응답을 보냅니다.
  createPlan: async (req, res) => {
    try {
      const userInput = req.body.prompt;
      const travelPlan = await planService.generateTravelPlan(userInput);

      handleSuccess(
        res,
        200,
        "여행 일정이 성공적으로 생성되었습니다.",
        travelPlan
      );
    } catch (error) {
      console.error("여행 일정 생성 중 오류 발생:", error);
      handleError(res, "여행 일정 생성에 실패했습니다.");
    }
  },

  // 여행 일정 저장
  savePlan: async (req, res) => {
    try {
      const plan = req.body;
      await planService.savePlan(plan);

      handleSuccess(res, 201, "여행 일정이 성공적으로 저장되었습니다.");
    } catch (error) {
      console.error("여행 일정 저장 중 오류 발생:", error);
      handleError(res, "여행 일정 저장에 실패했습니다.", error);
    }
  },

  // 내가 저장한 일정 조회
  getMyPlans: async (req, res) => {
    try {
      const { userKey } = req.body;
      const result = await planService.getPlans(userKey);

      console.log(result);

      handleSuccess(res, 200, "내 일정이 조회되었습니다.", result);
    } catch (error) {
      console.error("내 일정 조회중 실패", error);
      handleError(res, "내 일정 조회에 실패했습니다.", error);
    }
  },

  // 내가 저장한 일정 삭제
  deletePlan: async (req, res) => {
    try {
      const planId = parseInt(req.params.planId, 10);
      await planService.deletePlan(planId);

      handleSuccess(res, 200, "삭제되었습니다.");
    } catch (error) {
      console.error("일정 삭제 중 오류 발생:", error);
      handleError(res, "일정 삭제에 실패했습니다.", error);
    }
  },
    // 특정 일정 상세 조회
  getPlanById: async (req, res) => {
    try {
      const planId = parseInt(req.params.planId, 10);
      if (isNaN(planId)) {
        return res.status(400).json({ success: false, message: "유효하지 않은 planId 입니다." });
      }

      const plan = await planService.getPlanById(planId);
      if (!plan) {
        return res.status(404).json({ success: false, message: "해당 일정을 찾을 수 없습니다." });
      }
      handleSuccess(res, 200, "일정이 성공적으로 조회되었습니다.", plan);
    } catch (error) {
      handleError(res, "일정 조회에 실패했습니다.", error);
    }
  }
};

module.exports = reviewController;
