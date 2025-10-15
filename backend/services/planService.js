require("dotenv").config();
const { GoogleGenAI, Type } = require("@google/genai");
const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

const { supabase } = require("../utils/supabase");

// 사용자의 입력에 따라 여행 일정 생성
async function generateTravelPlan(userInput) {
  const {
    departure,
    departureDate,
    companionsType,
    companions,
    travelStyles,
    budget,
  } = userInput;

  const userPrompt = `
    다음 정보에 맞는 여행 일정을 생성해줘.
    - 출발지: ${departure}
    - 여행 날짜: ${departureDate}
    - 동반 유형: ${companionsType}
    - 여행객 수: ${companions}명
    - 여행 스타일: ${travelStyles}
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
}

// 생성된 여행 일정 저장
async function savePlan(plan) {
  const { error } = await supabase.from("ai").insert(plan);
  if (error) {
    console.error(error);
    throw error;
  }
}

// 내가 저장한 일정 조회
async function getPlans(userKey) {
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
}

// 내가 작성한 리뷰조회
async function getMyReviews(userKey) {
  const { data, error } = await supabase
    .from("review")
    .select("id, rate, title, content, img_path")
    .eq("userKey", userKey);

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
}

module.exports = { generateTravelPlan, savePlan, getPlans, getMyReviews };
