const { supabase } = require("../utils/supabase");

const mypageService = {
  // 저장된 일정 상세 조회
  getScheduleDetail: async (scheduleId) => {
    const schedule = schedules.find((s) => s.id === scheduleId);

    if (!schedule) {
      return null;
    }

    const hasReview = reviews.some((r) => r.planId === scheduleId);

    return {
      ...schedule,
      hasReview,
    };
  },

  // 일정에 후기 작성
  createReview: async (planId, reviewData) => {
    // 일정이 존재하는지 확인
    const schedule = schedules.find((s) => s.id === planId);

    if (!schedule) {
      return { success: false };
    }

    // 새 후기 생성
    const newReview = {
      id: nextReviewId++,
      planId: planId,
      rate: reviewData.rate,
      title: reviewData.title,
      content: reviewData.content,
      companioonsType: reviewData.companioonsType,
      travleStyles: reviewData.travleStyles,
      budget: reviewData.budget,
      img_path: reviewData.img_path,
      departure: schedule.departure,
      arrival: schedule.recommendation?.destinationName || schedule.arrival,
      createdAt: new Date(),
    };

    reviews.push(newReview);

    return {
      success: true,
      reviewId: newReview.id,
    };
  },

  // 후기 삭제
  deleteReview: async (reviewId) => {
    const reviewIndex = reviews.findIndex((r) => r.id === reviewId);

    if (reviewIndex === -1) {
      return { success: false, statusCode: 404 };
    }

    // 후기 삭제
    reviews.splice(reviewIndex, 1);

    return { success: true };
  },
};

module.exports = mypageService;
