require("dotenv").config();
const { GoogleGenAI, Type } = require("@google/genai");
const ai = new GoogleGenAI({});

const { supabase } = require("../utils/supabase");

const planService = {
  // 사용자의 입력에 따라 여행 일정 생성
  generateTravelPlan: async (userInput) => {
    const {
      departure,
      departureDate,
      companionsType,
      companions,
      travelStyles,
      additionalInfo,
      budget,
    } = userInput;

    const userPrompt = `
    다음 정보에 맞는 여행 일정을 생성해줘.
    - 출발지: ${departure}
    - 여행 날짜: ${departureDate}
    - 동반 유형: ${companionsType}
    - 여행객 수: ${companions}명
    - 여행 스타일: ${travelStyles}
    - 추가 요청 사항: ${additionalInfo}
    - 예산: ${budget}원

    응답은 반드시 한국어로 해야돼.   
  `;

    console.log(userPrompt);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT, // 최상위 응답 객체의 타입
          properties: {
            // 속성 값
            departure: { type: Type.STRING },
            departureDate: { type: Type.STRING },
            companionsType: { type: Type.STRING },
            companions: { type: Type.NUMBER },
            travelStyles: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            budget: { type: Type.NUMBER },
            budgetUnit: { type: Type.STRING },
            recommendation: {
              type: Type.OBJECT,
              properties: {
                destinationName: { type: Type.STRING },
                destinationDescription: { type: Type.STRING },
                estimatedBudget: {
                  type: Type.OBJECT,
                  properties: {
                    min: { type: Type.STRING },
                    max: { type: Type.STRING },
                    unit: { type: Type.STRING },
                  },
                },
                itinerary: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      time: { type: Type.STRING },
                      activity: { type: Type.STRING },
                      description: { type: Type.STRING },
                      transportation: { type: Type.STRING },
                    },
                  },
                },
                notes: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const travelPlan = response.text;
    console.log(travelPlan);
    return travelPlan;
  },

  // 생성된 여행 일정 저장
  savePlan: async (plan) => {
    const { error } = await supabase.from("ai").insert(plan);
    if (error) {
      console.error(error);
      throw error;
    }
  },

  // 내가 저장한 일정 조회
  getPlans: async (userKey) => {
    const { data, error } = await supabase
      .from("ai")
      .select(
        "planId, departure, companions, companionsType, travelStyles, budget, recommendation, departureDate, budgetUnit"
      )
      .eq("userKey", userKey);

    if (error) {
      console.error(error);
      throw error;
    }

    return data;
  },

  deletePlan: async (planId) => {
    const { error } = await supabase.from("ai").delete().eq("planId", planId);
    if (error) {
      console.error(error);
      throw error;
    }
  },

  // planId로 특정 일정 상세 조회
  getPlanById: async (planId) => {
    const { data, error } = await supabase
      .from("ai")
      .select(
        "planId, departure, companions, companionsType, travelStyles, budget, recommendation, departureDate, budgetUnit"
      )
      .eq("planId", planId)
      .single(); // planId는 고유하므로 single()을 사용합니다.

    if (error) {
      // 데이터가 없는 경우(null)도 Supabase는 에러로 처리할 수 있습니다.
      console.error("getPlanById 서비스 오류:", error.message);
      // 컨트롤러에서 404 처리를 할 수 있도록 null을 반환합니다.
      return null;
    }

    return data;
  },
};

module.exports = planService;
