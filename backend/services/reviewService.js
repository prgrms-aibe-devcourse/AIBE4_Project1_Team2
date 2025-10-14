import { supabase } from "../utils/supabase";

let reviews = [];
let nextId = 1;

const reviewService = {
  getAllReviews: async (page, limit) => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    // 전체 리뷰에서 리스트용 필드만 추출
    const paginatedReviews = reviews
      .slice(startIndex, endIndex)
      .map(review => ({
        id: review.id,
        title: review.title,
        rate: review.rate,
        departure: review.departure,
        arrival: review.arrival,
        img_path: review.img_path
        // 리스트에 보여줄 필드만 여기 추가
      }));
    
    return {
      reviews: paginatedReviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(reviews.length / limit),
        totalItems: reviews.length,
      },
    };
  }
  ,

  getReviewById: async (id) => {
    return reviews.find(r => r.id === id);
  },

  searchReviews: async ({ departure, arrival, keyword }) => {
    let filteredReviews = reviews;
    
    if (departure) {
      filteredReviews = filteredReviews.filter(r => 
        r.departure.includes(departure)
      );
    }
    
    if (arrival) {
      filteredReviews = filteredReviews.filter(r => 
        r.arrival.includes(arrival)
      );
    }
    
    if (keyword) {
      filteredReviews = filteredReviews.filter(r => 
        r.title.includes(keyword) || r.content.includes(keyword)
      );
    }
    
    return filteredReviews;
  }
};

module.exports = reviewService;