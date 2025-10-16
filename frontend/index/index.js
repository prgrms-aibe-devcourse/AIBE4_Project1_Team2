function goToAIPlan() {
  window.location.href = "./frontend/ai-plan/ai-plan.html";
}

async function goToReviews() {
  const handleError = (msg, error) => {
    console.error("리뷰 불러오기 실패:", error || msg);
    alert(msg);
  };

  try {
    const res = await fetch(
      "https://aibe4-project1-team2-m9vr.onrender.com/reviews"
    );
    if (!res.ok) throw new Error(`서버 응답 오류: ${res.status}`);

    const { success, data, message } = await res.json();
    const reviews = data?.reviews ?? [];

    if (!success || !Array.isArray(reviews) || reviews.length === 0) {
      return handleError(message || "유효한 리뷰 데이터가 없습니다.");
    }

    localStorage.setItem("savedReviews", JSON.stringify(reviews));
    window.location.href = "./frontend/reviews/reviews.html";
  } catch (err) {
    handleError(
      "서버 연결 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
      err
    );
  }
}
