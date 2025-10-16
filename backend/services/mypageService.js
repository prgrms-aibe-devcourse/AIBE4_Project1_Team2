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
  createReview: async (reviewData) => {
    // 일정이 존재하는지 확인
    const { data: aiData, error: aiError } = await supabase
    .from('ai').select('*').eq('planId', reviewData.planId)

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
      userKey: reviewData.userKey,
      rate: Number(reviewData.rate),
      title: reviewData.title,
      content: reviewData.content,
      img_path: reviewData.img_path
    };

    const { data: insertData, error: insertError } = await supabase.from('review').insert([newReview]).select('reviewId')
    if (insertError) {
      console.error(insertError)
      return { success: false };
    }

    const { data: updatedData, error: updatedError } = await supabase.from('ai')
    .update({ reviewId: insertData[0].reviewId }).eq('planId', scheduleId).select()
    if (updatedError) {
      console.error(updatedError)
      return { success: false };
    }

    return {
      success: true,
      reviewId: insertData[0].reviewId,
    };
  },

  // 후기 삭제
  deleteReview: async (planId) => {

    // 후기 삭제
    const { error } = await supabase.from('review').delete().eq('planId', planId)
    if (error) {
      return { success: false };
    }

    return { success: true };
  },
};

module.exports = mypageService;
