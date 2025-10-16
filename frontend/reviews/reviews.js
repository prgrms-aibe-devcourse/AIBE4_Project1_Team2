document.addEventListener("DOMContentLoaded", () => {
  const DOM = {
    reviewsContainer: document.getElementById("reviewsContainer"),
    modal: {
      overlay: document.getElementById("reviewModal"),
      closeButton: document
        .getElementById("reviewModal")
        .querySelector(".close-button"),
      title: document.getElementById("modalTitle"),
      rate: document.getElementById("modalRate"),
      image: document.getElementById("modalImage"),
      content: document.getElementById("modalContent"),
      prev: document.getElementById("prevBtn"),
      next: document.getElementById("nextBtn"),
      planBtn: document
        .querySelector(".bottom-btn")
        .querySelectorAll("button")[1],
    },
  };

  // 일정 상세 모달
  const planModal = document.createElement("div");
  planModal.className = "modal-overlay";
  planModal.innerHTML = `
    <div class="modal-content plan-result-modal">
      <button class="close-button">&times;</button>
      <div class="plan-container" id="plan-container"></div>
    </div>
  `;
  document.body.appendChild(planModal);

  const planCloseBtn = planModal.querySelector(".close-button");
  planCloseBtn.addEventListener("click", closePlanModal);
  planModal.addEventListener("click", (e) => {
    if (e.target === planModal) closePlanModal();
  });

  function closePlanModal() {
    planModal.classList.remove("active");
    planModal.scrollTop = 0;
    document.body.style.overflow = "auto";
  }

  let reviews = [];
  let currentIndex = 0;

  // ======================================================
  // 후기 카드 생성
  // ======================================================
  function createReviewCard(review, index) {
    const card = document.createElement("div");
    card.className = "review-card";

    card.innerHTML = `
      <img src="${review.img_path || "../public/images/default-trip.jpg"}"
           alt="${review.title || "여행 이미지"}"
           class="card-image" />
      <div class="card-rate">
        ${"★".repeat(review.rate || 0) + "☆".repeat(5 - (review.rate || 0))}
      </div>
      <h3 class="card-title">${review.title || "제목 없음"}</h3>
    `;
    card.addEventListener("click", () => openModal(index));
    return card;
  }

  // ======================================================
  // 후기 목록 렌더링
  // ======================================================
  function renderReviews(reviewsData) {
    if (!Array.isArray(reviewsData) || reviewsData.length === 0) {
      DOM.reviewsContainer.innerHTML = "<p>표시할 후기가 없습니다.</p>";
      return;
    }

    DOM.reviewsContainer.innerHTML = "";
    reviewsData.forEach((review, i) => {
      DOM.reviewsContainer.appendChild(createReviewCard(review, i));
    });
  }

  // ======================================================
  // 후기 상세 모달 열기
  // ======================================================
  function openModal(index) {
    const review = reviews[index];
    currentIndex = index;

    const modalBody = DOM.modal.overlay.querySelector(".review-body");
    modalBody.innerHTML = `
      <div class="review-detail">
        <img
          src="${review.img_path || "../public/images/default-trip.jpg"}"
          alt="후기 이미지"
          class="modal-image"
        />
        <div class="modal-rate">
          ${"★".repeat(review.rate || 0) + "☆".repeat(5 - (review.rate || 0))}
        </div>
        <h2 class="modal-title-text">${review.title || "제목 없음"}</h2>
        <hr class="modal-divider" />
        <div class="review-text">${review.content || "내용이 없습니다."}</div>
      </div>
    `;

    DOM.modal.overlay.classList.add("active");
    DOM.modal.overlay.scrollTop = 0;
    document.body.style.overflow = "hidden";

    // 일정 보기 버튼 클릭 시 API 요청
    DOM.modal.planBtn.onclick = async () => {
      if (!review.planId) {
        alert("이 후기에는 연결된 일정이 없습니다.");
        return;
      }

      try {
        const res = await fetch(
          `https://aibe4-project1-team2-m9vr.onrender.com/plan/${review.planId}`
        );
        const result = await res.json();

        if (!res.ok || !result.success || !result.data) {
          alert("일정 정보를 불러오지 못했습니다.");
          console.error(result);
          return;
        }

        showPlanModal(result.data);
      } catch (err) {
        console.error("일정 조회 중 오류:", err);
        alert("일정 정보를 불러오는 중 문제가 발생했습니다.");
      }
    };
  }

  // ======================================================
  // 일정 상세 모달 표시
  // ======================================================
  function showPlanModal(plan) {
    const container = planModal.querySelector("#plan-container");
    const {
      departure,
      companions,
      companionsType,
      travelStyles,
      budget,
      recommendation,
      departureDate,
      budgetUnit,
    } = plan;

    const route = `${departure} → ${recommendation.destinationName}`;
    const estimated = recommendation.estimatedBudget;
    const formattedBudget = `${Number(estimated.min).toLocaleString()} ~ ${Number(
      estimated.max
    ).toLocaleString()} ${estimated.unit}`;

    container.innerHTML = `
      <section class="plan-header">
        <h1 class="destination-title">${route}</h1>
        <p class="destination-desc">${recommendation.destinationDescription}</p>
        <div class="plan-summary">
          <span>📅 출발일: ${departureDate}</span>
          <span>👥 ${companionsType} (${companions}명)</span>
          <span>💰 예산: ${formattedBudget}</span>
          <span>🎨 여행 스타일: ${travelStyles.join(", ")}</span>
        </div>
      </section>

      <section class="plan-itinerary-section">
        <h2>🗓️ 여행 일정</h2>
        <div class="plan-cards">
          ${recommendation.itinerary
            .map(
              (i) => `
              <div class="plan-card">
                <h3>${i.time}</h3>
                <p class="activity">${i.activity}</p>
                <p class="desc">${i.description}</p>
                <p class="transport">🚗 ${i.transportation}</p>
              </div>`
            )
            .join("")}
        </div>
      </section>

      <section class="plan-notes-section">
        <h2>💡 AI 추천 메모</h2>
        <ul class="plan-notes">
          ${recommendation.notes.map((n) => `<li>${n}</li>`).join("")}
        </ul>
      </section>
    `;

    planModal.classList.add("active");
    planModal.scrollTop = 0;
    document.body.style.overflow = "hidden";
  }

  // ======================================================
  // 후기 데이터 불러오기
  // ======================================================
  try {
    const saved = JSON.parse(localStorage.getItem("reviews"));
    reviews = Array.isArray(saved) ? saved : saved?.data?.reviews || [];
    renderReviews(reviews);
  } catch (e) {
    console.error("후기 데이터 파싱 오류:", e);
    DOM.reviewsContainer.innerHTML =
      "<p>후기 데이터를 불러오는 중 문제가 발생했습니다.</p>";
  }
});
