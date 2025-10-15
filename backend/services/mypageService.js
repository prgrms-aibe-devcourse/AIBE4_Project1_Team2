const { supabase } = require("../utils/supabase")

const mypageService = {
  // 저장된 일정 상세 조회
  getScheduleDetail: async (scheduleId) => {
    const schedule = schedules.find((s) => s.id === scheduleId);

    if (!schedule) {
      return null;
    }

    // userKey는 응답에서 제외 (보안)
    const { userKey, ...scheduleData } = schedule;

    // hasReview 필드 추가 (이 일정에 후기가 있는지 확인)
    const hasReview = reviews.some((r) => r.scheduleId === scheduleId);

    return {
      ...scheduleData,
      hasReview,
    };
  },

  // 일정에 후기 작성
  createReview: async (scheduleId, reviewData) => {
    // 일정이 존재하는지 확인
    const { data: aiData, error: aiError } = await supabase
    .from('ai').select('*').eq('userKey', reviewData.userKey)

    if (aiError || !aiData || aiData.length === 0) {
      console.log("aiError")
      return { success: false };
    }

    // const schedule = schedules.find((s) => s.id === scheduleId);

    // if (!schedule) {
    //   return { success: false };
    // }

    // 새 후기 생성
    const newReview = {
      // scheduleId: scheduleId,
      userKey: reviewData.userKey,
      rate: reviewData.rate,
      title: reviewData.title,
      content: reviewData.content,
      // companioonsType: reviewData.companioonsType,
      // travleStyles: reviewData.travleStyles,
      // budget: reviewData.budget,
      img_path: reviewData.img_path,
      // departure: schedule.departure,
      // arrival: schedule.arrival,
      // createdAt: new Date(),
    };

    // const { data, error } = await supabase.from('review').insert([newReview]).select('id')
    // if (error) {
    //   console.log("reviewError")
    //   return { success: false };
    // }

    return {
      success: true,
      reviewId: data[0].id,
    };
  },

  // 후기 삭제
  deleteReview: async (reviewId, userKey) => {
    // 일정이 존재하는지 확인
    const { data: aiData, error: aiError } = await supabase
    .from('ai').select('*').eq('userKey', userKey)

    if (aiError || !aiData || aiData.length === 0) {
      return { success: false };
    }

    // const reviewIndex = reviews.findIndex((r) => r.id === reviewId);

    // if (reviewIndex === -1) {
    //   return { success: false };
    // }

    // const review = reviews[reviewIndex];

    // 비밀번호 확인
    // if (review.userKey !== userKey) {
    //   return { success: false };
    // }

    // 후기 삭제
    const { error } = await supabase.from('review').delete().eq('userKey', userKey)
    if (error) {
      return { success: false };
    }

    // reviews.splice(reviewIndex, 1);

    // 해당 일정의 hasReview를 false로 변경
    // const schedule = schedules.find((s) => s.id === review.scheduleId);
    // if (schedule) {
    //   schedule.hasReview = false;
    // }

    return { success: true };
  },
};

module.exports = mypageService;
