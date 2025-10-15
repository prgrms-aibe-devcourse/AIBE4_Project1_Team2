function goToAIPlan() {
  window.location.href = "./frontend/ai-plan/ai-plan.html";
}

async function goToReviews() {
  const BASE_URL = 'https://aibe4-project1-team2-m9vr.onrender.com';

  try {
    // ✅ 서버에서 전체 리뷰 목록 가져오기
    const response = await fetch(`${BASE_URL}/reviews`);
    if (!response.ok) {
      throw new Error(`서버 응답 오류: ${response.status}`);
    }

    const result = await response.json();
    console.log('전체 리뷰 응답:', result);

    // ✅ 성공 응답 확인 및 데이터 저장
    if (result.success && Array.isArray(result.data)) {
      localStorage.setItem('savedReviews', JSON.stringify(result.data));
      window.location.href = './frontend/reviews/reviews.html';
    } else {
      alert(`리뷰 데이터를 불러오지 못했습니다: ${result.message || '알 수 없는 오류'}`);
    }
  } catch (error) {
    console.error('리뷰 데이터를 불러오는 중 오류 발생:', error);
    alert('리뷰 데이터를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
  }
}