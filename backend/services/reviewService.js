let reviews = [
  {
    id: 1,
    rate: 5,
    title: "부산 존잼",
    content: "광안리 너무 예쁘고 감동이었어요. 음식 존맛탱! 바다 존예! ㅎㅎㅎ",
    departure: "경주",
    arrival: "부산",
    companionsType: "친구",
    companions: 3,
    travelStyles: "자연과 함께",
    budget: 100000,
    additionalInfo: "추가적인 세부사항",
    img_path: "img_url",
    hasReview: false,
    ai_schedule: "오전 9시 경주역에서 KTX 탑승 (약 30분 소요) 하여 부산역 도착 후 광안리로 이동하여 점심 식사. 오후 2시 해변 산책 및 카페 방문. 오후 5시 부산역으로 이동 후 복귀 KTX 탑승."
  },
  {
    id: 2,
    rate: 4,
    title: "제주도 힐링 여행",
    content: "가족들과 함께 성산일출봉에 다녀왔어요. 날씨가 조금 흐렸지만 경치가 정말 좋아서 만족스러운 여행이었습니다.",
    departure: "서울",
    arrival: "제주",
    companionsType: "가족",
    companions: 4,
    travelStyles: "휴양",
    budget: 500000,
    additionalInfo: "렌터카 필수, 숙소는 제주시 중심가",
    img_path: "img_url",
    hasReview: true,
    ai_schedule: "오전 7시 김포공항 출발, 오전 8시 30분 제주공항 도착 후 렌터카 픽업. 오전 10시 성산일출봉 등반. 오후 1시 해녀의 집에서 점심. 오후 3시 섭지코지 관광. 오후 6시 숙소 체크인."
  },
  {
    id: 3,
    rate: 5,
    title: "강릉 바다 여행",
    content: "경포대에서 인생샷 많이 남기고 왔어요. 예쁜 카페도 많고, 해산물도 신선해서 정말 좋았습니다.",
    departure: "서울",
    arrival: "강릉",
    companionsType: "연인",
    companions: 2,
    travelStyles: "사진 촬영",
    budget: 150000,
    additionalInfo: "카페 투어 중심",
    img_path: "img_url",
    hasReview: true,
    ai_schedule: "오전 10시 서울역 출발, KTX로 강릉역 도착 (약 2시간). 오후 1시 경포대 해변 산책 및 점심 식사. 오후 3시 안목해변 카페거리 투어. 오후 6시 강릉역으로 이동 후 복귀."
  },
];

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