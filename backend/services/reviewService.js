const { supabase } = require("../utils/supabase");

const reviewService = {
  // 모든 리뷰 조회
  getAllReviews: async (page, limit) => {
    try {
      const startIndex = (page - 1) * limit;

      const { count, error: countError } = await supabase
        .from("review")
        .select("*", { count: "exact", head: true });

      if (countError) {
        console.error("리뷰 개수 조회 오류:", countError);
        throw new Error(countError.message);
      }

      const { data, error } = await supabase
      .from('review')
      .select(`
        reviewId,
        title,
        rate,
        content,
        img_path,
        ai!inner(*)
      `)
      .range(startIndex, startIndex + limit - 1)
      .order('reviewId', { ascending: false });

      if (error) {
        console.error("리뷰 조회 오류:", error);
        throw new Error(error.message);
      }

      // userKey 같은 민감 정보를 제거하고 데이터 구조를 재구성합니다.
      const processedData = data?.map(item => {
        const { ai, ...reviewData } = item;
        const { userKey, ...planData } = ai; // ai 객체에서 userKey 제거

        return {
          ...reviewData, // reviewId, title, rate, content, img_path
          planId: planData.planId, 
          plan: planData, 
        };
      });

      return {
        reviews: processedData || [],
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
        },
      };
    } catch (error) {
      console.error("getAllReviews 오류:", error);
      throw error;
    }
  },

  // 특정 리뷰 상세 조회
  getReviewById: async (reviewId) => {
    try {
      const { data, error } = await supabase
        .from("review")
        .select("*")
        .eq("reviewId", reviewId)
        .single();

      if (error) {
        console.error("리뷰 상세 조회 오류:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("getReviewById 오류:", error);
      return null;
    }
  },

  // 리뷰 검색 (키워드만)
  searchReviews: async ({ keyword }) => {
    try {
      let query = supabase.from("review").select("*");

      if (keyword) {
        query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("리뷰 검색 오류:", error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error("searchReviews 오류:", error);
      throw error;
    }
  },

  // 내가 작성한 리뷰조회
  fetchMyReviews: async (userKey) => {
    const { data, error } = await supabase
      .from("ai")
      .select(
        `
          departure,
          recommendation->destinationName,
          review(
            reviewId,
            rate,
            title,
            content,
            img_path
          )
        `
      )
      .eq("userKey", userKey)
      .not("reviewId", "is", null);

    if (error) {
      console.error(error);
      throw error;
    }

    return data;
  },
};

module.exports = reviewService;
