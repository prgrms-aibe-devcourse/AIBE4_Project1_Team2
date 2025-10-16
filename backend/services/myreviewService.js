const { supabase } = require("../utils/supabase");

const myreviewService = {
  saveReview: async (reviewData) => {
    const { planId, rate, title, content, img_path } = reviewData;

    try {
      // 1. 먼저 해당 planId가 존재하는지 확인
      const { data: planExists, error: planError } = await supabase
        .from("ai")
        .select("planId")
        .eq("planId", planId)
        .single();

      if (planError || !planExists) {
        console.error("Plan 조회 오류:", planError);
        return { error: "PLAN_NOT_FOUND" };
      }

      // 2. review 테이블에 리뷰 데이터 삽입
      const { data: newReview, error: reviewError } = await supabase
        .from("review")
        .insert({
          rate,
          title,
          content,
          img_path: img_path || null,
        })
        .select("reviewId")
        .single();

      if (reviewError) {
        console.error("Review 삽입 오류:", reviewError);
        throw reviewError;
      }

      const newReviewId = newReview.reviewId;

      // 3. ai 테이블의 reviewId 업데이트 (plan과 review 연결)
      const { error: updateError } = await supabase
        .from("ai")
        .update({ reviewId: newReviewId })
        .eq("planId", planId);

      if (updateError) {
        console.error("AI 테이블 업데이트 오류:", updateError);
        // 롤백을 위해 방금 생성한 리뷰 삭제
        await supabase.from("review").delete().eq("reviewId", newReviewId);
        throw updateError;
      }

      return {
        reviewId: newReviewId,
        planId: planId,
      };
    } catch (error) {
      console.error("myreviewService.saveReview 오류:", error);
      throw error;
    }
  },

  deleteReview: async (reviewId) => {
    try {
      // 1. 리뷰가 존재하는지 확인
      const { data: reviewExists, error: reviewCheckError } = await supabase
        .from("review")
        .select("reviewId")
        .eq("reviewId", reviewId)
        .single();

      if (reviewCheckError || !reviewExists) {
        console.error("Review 조회 오류:", reviewCheckError);
        return { error: "REVIEW_NOT_FOUND" };
      }

      // 2. ai 테이블에서 해당 reviewId를 참조하는 레코드 찾기
      const { data: planWithReview, error: planCheckError } = await supabase
        .from("ai")
        .select("planId, reviewId")
        .eq("reviewId", reviewId)
        .single();

      // 3. ai 테이블의 reviewId를 null로 업데이트 (연결 해제)
      if (planWithReview) {
        const { error: updateError } = await supabase
          .from("ai")
          .update({ reviewId: null })
          .eq("reviewId", reviewId);

        if (updateError) {
          console.error("AI 테이블 업데이트 오류:", updateError);
          throw updateError;
        }
      }

      // 4. review 테이블에서 리뷰 삭제
      const { error: deleteError } = await supabase
        .from("review")
        .delete()
        .eq("reviewId", reviewId);

      if (deleteError) {
        console.error("Review 삭제 오류:", deleteError);
        throw deleteError;
      }

      return { success: true };
    } catch (error) {
      console.error("myreviewService.deleteReview 오류:", error);
      throw error;
    }
  },
};

module.exports = myreviewService;
