function goToAIPlan() {
  window.location.href = "./frontend/ai-plan/ai-plan.html";
}

function goToReviews() {
    setupMockDataForReviews();
    
    alert("테스트용 리뷰 데이터가 준비되었습니다. 리뷰 페이지로 이동합니다.");
    window.location.href = "./frontend/reviews/reviews.html";
}

// 목 데이터
function setupMockDataForReviews() {
    // 성공 케이스 목 데이터
    const mockSuccessResponse = {
        "success": true,
        "statusCode": 200,
        "message": "성공적으로 조회되었습니다.",
        "data": [
            {
                "id": 1, "rate": 5, "title": "부산 존잼", "departure": "경주", "arrival": "부산",
                "content": "광안리 너무 예쁘고 감동이었어요. 음식 존맛탱! 바다 존예! ㅎㅎㅎ",
                "img_path": "https://images.unsplash.com/photo-1574936145849-f8aa04d2a37c?q=80&w=400"
            },
            {
                "id": 2, "rate": 4, "title": "제주 존예", "departure": "제주", "arrival": "성산일출봉",
                "content": "가족들과 함께 성산일출봉에 다녀왔어요. 날씨가 조금 흐렸지만 경치가 정말 좋아서 만족스러운 여행이었습니다.",
                "img_path": "https://images.unsplash.com/photo-1582238332992-a124fa9349c6?q=80&w=400"
            },
            {
                "id": 3, "rate": 5, "title": "강릉 경포대", "departure": "서울", "arrival": "강릉",
                "content": "경포대에서 인생샷 많이 남기고 왔어요. 예쁜 카페도 많고, 해산물도 신선해서 정말 좋았습니다.",
                "img_path": "https://images.unsplash.com/photo-1601002782639-06965a3119c4?q=80&w=400"
            }
        ]
    };
    
    // 실패 케이스 목 데이터 (필요시 테스트용으로 사용)
    const mockFailResponse = {
        "success": false, "statusCode": 404, "message": "요청하신 데이터를 찾을 수 없습니다.", "data": []
    };

    // 성공 케이스의 'data' 배열을 'savedReviews'라는 키로 Local Storage에 저장합니다.
    localStorage.setItem('savedReviews', JSON.stringify(mockSuccessResponse.data));
    
    console.log("리뷰 테스트용 데이터가 Local Storage에 저장되었습니다.");
}