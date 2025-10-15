const planService = require("../services/planService");

// 여행 일정 생성 요청을 처리하고 응답을 보냅니다.
exports.createPlan = async (req, res) => {
  try {
    const userInput = req.body.prompt;
    const travelPlan = await planService.generateTravelPlan(userInput);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "여행 일정이 성공적으로 생성되었습니다.",
      data: travelPlan,
    });
  } catch (error) {
    console.error("여행 일정 생성 중 오류 발생:", error);
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: "여행 일정 생성에 실패했습니다.",
      error: error.message,
    });
  }
};
