const { supabase } = require("../utils/supabase");

const reviewService = {
  getAllReviews: async (page, limit) => {
    try {
      const startIndex = (page - 1) * limit;

      const { count, error: countError } = await supabase
        .from('review')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('리뷰 개수 조회 오류:', countError);
        throw new Error(countError.message);
      }

      const { data, error } = await supabase
        .from('review')
        .select('id, title, rate, content, img_path')
        .range(startIndex, startIndex + limit - 1)
        .order('id', { ascending: false });

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

  getReviewById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('review')
        .select('*')
        .eq('id', id)
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