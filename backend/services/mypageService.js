let schedules = [];
let reviews = [];
let nextReviewId = 1;

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
    const schedule = schedules.find((s) => s.id === scheduleId);

    if (!schedule) {
      return { success: false };
    }

    // 새 후기 생성
    const newReview = {
      id: nextReviewId++,
      scheduleId: scheduleId,
      userKey: reviewData.userKey,
      rate: reviewData.rate,
      title: reviewData.title,
      content: reviewData.content,
      companioonsType: reviewData.companioonsType,
      travleStyles: reviewData.travleStyles,
      budget: reviewData.budget,
      img_path: reviewData.img_path,
      departure: schedule.departure,
      arrival: schedule.arrival,
      createdAt: new Date(),
    };

    reviews.push(newReview);

    // 일정의 hasReview를 true로 변경
    schedule.hasReview = true;

    return {
      success: true,
      reviewId: newReview.id,
    };
  },

  // 후기 삭제
  deleteReview: async (reviewId, userKey) => {
    const reviewIndex = reviews.findIndex((r) => r.id === reviewId);

    if (reviewIndex === -1) {
      return { success: false, statusCode: 404 };
    }

    const review = reviews[reviewIndex];

    // 비밀번호 확인
    if (review.userKey !== userKey) {
      return { success: false, statusCode: 401 };
    }

    // 후기 삭제
    reviews.splice(reviewIndex, 1);

    // 해당 일정의 hasReview를 false로 변경
    const schedule = schedules.find((s) => s.id === review.scheduleId);
    if (schedule) {
      schedule.hasReview = false;
    }

    return { success: true };
  },
};

module.exports = mypageService;
