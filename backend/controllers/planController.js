const planService = require("../services/planService");
const { handleSuccess, handleError } = require("../utils/responseHandler");

// 여행 일정 생성 요청을 처리하고 응답을 보냅니다.
exports.createPlan = async (req, res) => {
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
};

// 여행 일정 저장
exports.savePlan = async (req, res) => {
  try {
    const plan = req.body;
    await planService.savePlan(plan);

    handleSuccess(res, 201, "여행 일정이 성공적으로 저장되었습니다.");
  } catch (error) {
    console.error("여행 일정 저장 중 오류 발생:", error);
    handleError(res, "여행 일정 저장에 실패했습니다.", error);
  }
};

// 내가 저장한 일정 조회
exports.getMyPlans = async (req, res) => {
  try {
    const { userKey } = req.body;
    console.log(userKey);
    const result = await planService.getPlans(userKey);

    console.log(result);

    handleSuccess(res, 200, "내 일정이 조회되었습니다.", result);
  } catch (error) {
    console.error("내 일정 조회중 실패", error);
    handleError(res, "내 일정 조회에 실패했습니다.", error);
  }
};

