function goToAIPlan() {
  window.location.href = "./frontend/ai-plan/ai-plan.html";
}

async function goToReviews() {
  const API_BASE_URL = "https://aibe4-project1-team2-m9vr.onrender.com";

  const handleError = (message, error) => {
    console.error("[후기 불러오기 실패]", error || message);
    alert(message);
  };

  const loader = document.getElementById("loadingSpinner");
  loader?.classList.remove("hidden");

  try {
    const res = await fetch(`${API_BASE_URL}/reviews`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error(`서버 응답 오류: ${res.status}`);

    let json;
    try {
      json = await res.json();
    } catch (parseError) {
      throw new Error("서버 응답을 해석하는 중 오류가 발생했습니다.");
    }

    const { success, data, message } = json;
    const reviews = data?.reviews ?? [];

    if (!success || !Array.isArray(reviews) || reviews.length === 0) {
      throw new Error(message || "유효한 후기 데이터가 없습니다.");
    }

    localStorage.setItem("reviews", JSON.stringify(reviews));
    window.location.href = "./frontend/reviews/reviews.html";
  } catch (err) {
    if (err instanceof TypeError) {
      handleError("네트워크 연결이 불안정합니다. 인터넷을 확인해주세요.", err);
    } else {
      handleError(
        "서버 연결 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
        err
      );
    }
  } finally {
    loader?.classList.add("hidden");
  }
}
