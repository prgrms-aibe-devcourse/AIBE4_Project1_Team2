document.addEventListener("DOMContentLoaded", () => {
  const DOM = {
    body: document.body,
    reviewsContainer: document.getElementById("reviews-container"),
    buttons: {
      myReviews: document.getElementById("btnMyReviews"),
      myPlans: document.getElementById("btnMyPlans"),
    },
    modal: {
      overlay: document.getElementById("reviewModal"),
      closeButton: document
        .getElementById("reviewModal")
        .querySelector(".close-button"),
      title: document.getElementById("modal-title"),
      rate: document.getElementById("modal-rate"),
      image: document.getElementById("modal-image"),
      content: document.getElementById("modal-content"),
    },
  };

  // 리뷰 카드 생성
  function createReviewCard(review) {
    const card = document.createElement("div");
    card.className = "review-card";
    card.innerHTML = `
      <img src="${review.img_path || "https://placehold.co/400x250"}" alt="${
      review.title || "리뷰 이미지"
    }" />
      <h3>${review.title || "제목 없음"}</h3>
      <p>${review.content?.substring(0, 60) || "내용이 없습니다."}...</p>
      <div class="card-rate">⭐ ${review.rate ?? "0"}</div>
    `;
    card.addEventListener("click", () => openModal(review));
    return card;
  }

  // 리뷰 렌더링
  function renderReviews(reviews) {
    if (!reviews || reviews.length === 0) {
      DOM.reviewsContainer.innerHTML = "<p>표시할 리뷰가 없습니다.</p>";
      return;
    }
    DOM.reviewsContainer.innerHTML = "";
    reviews.forEach((r) =>
      DOM.reviewsContainer.appendChild(createReviewCard(r))
    );
  }

  // 모달 열기
  function openModal(review) {
    DOM.modal.title.textContent = review.title;
    DOM.modal.rate.textContent =
      "★".repeat(review.rate || 0) + "☆".repeat(5 - (review.rate || 0));
    DOM.modal.image.src = review.img_path || "https://placehold.co/600x400";
    DOM.modal.content.textContent = review.content;
    DOM.modal.overlay.classList.add("active");
  }

  // 모달 닫기
  function closeModal() {
    DOM.modal.overlay.classList.remove("active");
  }
  DOM.modal.closeButton.addEventListener("click", closeModal);
  DOM.modal.overlay.addEventListener("click", (e) => {
    if (e.target === DOM.modal.overlay) closeModal();
  });

  // 데이터 불러오기
  try {
    const data =
      JSON.parse(localStorage.getItem("savedReviews")) ||
      JSON.parse(localStorage.getItem("reviews")) ||
      [];
    renderReviews(data);
  } catch (e) {
    console.error("리뷰 불러오기 오류:", e);
    DOM.reviewsContainer.innerHTML =
      "<p>리뷰 데이터를 불러오는 중 문제가 발생했습니다.</p>";
  }

  // 버튼 기능
  DOM.buttons.myReviews.addEventListener("click", () =>
    alert("🛠 내가 작성한 후기 보기 기능은 준비 중입니다.")
  );

  DOM.buttons.myPlans.addEventListener("click", async () => {
    const userKey = prompt("고유번호를 입력해주세요:");
    if (!userKey) return alert("⚠️ 고유번호를 입력해야 합니다.");
    try {
      const response = await fetch(
        "https://aibe4-project1-team2-m9vr.onrender.com/my-plans",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userKey }),
        }
      );
      const result = await response.json();
      if (!response.ok || !result.data)
        return alert(result.message || "❌ 일정을 불러오지 못했습니다.");
      localStorage.setItem("aiPlans", JSON.stringify(result.data));
      alert("✅ 저장된 일정을 불러왔습니다!");
      window.location.href = "../my-ai-plans/my-ai-plans.html";
    } catch (err) {
      alert("⚠️ 서버 연결 오류. 잠시 후 다시 시도해주세요.");
    }
  });
});
