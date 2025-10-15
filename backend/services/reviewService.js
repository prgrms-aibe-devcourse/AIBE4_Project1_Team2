const { supabase } = require('../utils/supabase');

const reviewService = {
  // 모든 리뷰 조회 (페이지네이션)
  getAllReviews: async (page, limit) => {
    try {
      const startIndex = (page - 1) * limit;

      // 전체 개수 조회
      const { count, error: countError } = await supabase
        .from('review')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('리뷰 개수 조회 오류:', countError);
        throw new Error(countError.message);
      }

      // 페이지네이션된 리뷰 조회
      const { data, error } = await supabase
        .from('review')
        .select('reviewId, title, rate, content, img_path')
        .range(startIndex, startIndex + limit - 1)
        .order('reviewId', { ascending: false });

      if (error) {
        console.error('리뷰 조회 오류:', error);
        throw new Error(error.message);
      }

      return {
        reviews: data || [],
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
        },
      };
    } catch (error) {
      console.error('getAllReviews 오류:', error);
      throw error;
    }
  },

  // 특정 리뷰 상세 조회
  getReviewById: async (reviewId) => {
    try {
      const { data, error } = await supabase
        .from('review')
        .select('*')
        .eq('reviewId', reviewId)
        .single();

      if (error) {
        console.error('리뷰 상세 조회 오류:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('getReviewById 오류:', error);
      return null;
    }
  },

  // 리뷰 검색 (키워드만 지원)
  searchReviews: async ({ keyword }) => {
    try {
      let query = supabase.from('review').select('*');

      if (keyword) {
        query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('리뷰 검색 오류:', error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('searchReviews 오류:', error);
      throw error;
    }
  }
};

module.exports = reviewService;