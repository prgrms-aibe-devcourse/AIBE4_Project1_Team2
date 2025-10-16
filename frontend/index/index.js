function goToAIPlan() {
  window.location.href = "./frontend/ai-plan/ai-plan.html";
}

async function goToReviews() {
    try{
        // 서버에 리뷰 데이터를 GET 방식으로 요청
        const response = await fetch('https://aibe4-project1-team2-m9vr.onrender.com/reviews');
        
        // 서버 응답 성공 여부 확인
        if(!response.ok){
            throw new Error(`서버 응답 오류 : ${response.status}` );
        }

        // 응답 데이터를 JSON 형태로 파싱
        const result = await response.json();
        // API 응답 형식에 따라 성공 여부를 확인
        if(result.success && result.data) {
            localStorage.setItem('savedReviews', JSON.stringify(result.data));
            // 모든 과정이 성공하면 reviews 페이지로 이동
            window.location.href = "./frontend/reviews/reviews.html";
        } else {
            // 서버 응답은 성공, API가 실패 메시지 전송
            alert(`리뷰를 가져오지 못했습니다 : ${result.message || '알 수 없는 오류'}`);
        }
    } catch (error) {
        // fetch  요청 중 네트워크 오류나 기타 오류 발생
        console.error("리뷰 데이터를 불러오는 중 에러 발생 : ", error);
        alert("리뷰 데이터를 불러우는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.")
    }
}
