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
        ai ( planId )
      `)
      .range(startIndex, startIndex + limit - 1)
      .order('reviewId', { ascending: false });

      if (error) {
        console.error("리뷰 조회 오류:", error);
        throw new Error(error.message);
      }

      const processedData = data?.map(item => {
        // ai 테이블에서 가져온 planId를 최상위 레벨로 이동시킵니다.
        const planId = item.ai && item.ai.length > 0 ? item.ai[0].planId : null;
        return {
          ...item, // reviewId, title, rate, content, img_path
          planId: planId,
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
  //getReviewById: async (reviewId) => {
  //  try {
  //    const { data, error } = await supabase
  //      .from("review")
  //      .select("*")
  //      .eq("reviewId", reviewId)
  //      .single();

  //    if (error) {
  //      console.error("리뷰 상세 조회 오류:", error);
  //      return null;
  //    }

  //    return data;
  //  } catch (error) {
  //    console.error("getReviewById 오류:", error);
  //    return null;
  //  }
  //},

  // 리뷰 검색 (키워드만)
  searchReviews: async (filters) => {
    try {
      const { keyword, departure, travelStyles, minRate, companionsType } = filters;

      // 기본 쿼리: review 테이블과 ai 테이블을 조인합니다.
      let query = supabase.from("review").select(`
        reviewId,
        title,
        rate,
        content,
        img_path,
        ai ( planId )
      `);

      // 1. 키워드 검색 (리뷰 제목 또는 내용)
      if (keyword) {
        query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
      }

      // 2. 출발지 검색 (ai 테이블)
      if (departure) {
        // foreign table 필터링은 'foreignTable.column' 형식을 사용합니다.
        query = query.ilike("ai.departure", `%${departure}%`);
      }

      // 3. 동행자 유형 검색 (ai 테이블)
      if (companionsType) {
        query = query.ilike("ai.companionsType", `%${companionsType}%`);
      }

      // 4. 여행 스타일 검색 (ai 테이블, 배열 포함 여부)
      if (travelStyles) {
        query = query.contains("ai.travelStyles", [travelStyles]);
      }

      // 5. 별점 검색 (review 테이블)
      if (minRate) {
        query = query.gte("rate", minRate);
      }

      const { data, error } = await query;

      if (error) {
        console.error("리뷰 검색 오류:", error);
        throw new Error(error.message);
      }

      // getAllReviews와 동일한 데이터 구조로 가공하여 반환
      const processedData = data?.map(item => {
        const planId = item.ai && item.ai.length > 0 ? item.ai[0].planId : null;
        return {
          ...item,
          planId: planId,
        };
      });

      return processedData || [];
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
