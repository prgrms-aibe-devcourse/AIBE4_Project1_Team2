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

  // ======================================================
  // 일정 상세 모달 생성 (공통 구조)
  // ======================================================
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
  // 리뷰 카드 생성
  // ======================================================
  function createReviewCard(review, index) {
    const card = document.createElement("div");
    card.className = "review-card";

    const planData = review.plan || {};
    const routeText =
      planData.departure && planData.recommendation
        ? `${planData.departure} → ${planData.recommendation.destinationName}`
        : "출발지 정보 없음";

    card.innerHTML = `
      <h4 class="card-route">${routeText}</h4>
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
  // 리뷰 목록 렌더링
  // ======================================================
  function renderReviews(reviewsData) {
    if (!Array.isArray(reviewsData) || reviewsData.length === 0) {
      DOM.reviewsContainer.innerHTML = "<p>표시할 리뷰가 없습니다.</p>";
      return;
    }

    DOM.reviewsContainer.innerHTML = "";
    reviewsData.forEach((review, i) => {
      DOM.reviewsContainer.appendChild(createReviewCard(review, i));
    });
  }

  // ======================================================
  // 리뷰 상세 모달 열기
  // ======================================================
  function openModal(index) {
    const review = reviews[index];
    currentIndex = index;

    const planData = review.plan || {};
    const routeText =
      planData.departure && planData.recommendation
        ? `${planData.departure} → ${planData.recommendation.destinationName}`
        : "출발지 정보 없음";

    const modalBody = DOM.modal.overlay.querySelector(".review-body");
    modalBody.innerHTML = `
      <div class="review-detail">
        <div class="modal-route">${routeText}</div>
        <img
          src="${review.img_path || "../public/images/default-trip.jpg"}"
          alt="리뷰 이미지"
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

    // 일정 보기 버튼
    DOM.modal.planBtn.onclick = () => {
      if (!review.planId) {
        alert("이 리뷰에는 연결된 일정이 없습니다.");
        return;
      }

      const targetPlan = reviews.find((r) => r.planId === review.planId)?.plan;
      if (!targetPlan) {
        alert("일정 정보를 찾을 수 없습니다.");
        return;
      }

      showPlanModal(targetPlan);
    };
  }

  // ======================================================
  // 모달 닫기 (공통)
  // ======================================================
  DOM.modal.closeButton.addEventListener("click", () =>
    DOM.modal.overlay.classList.remove("active")
  );

  DOM.modal.overlay.addEventListener("click", (e) => {
    if (e.target === DOM.modal.overlay) {
      DOM.modal.overlay.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  });

  // ======================================================
  // 이전 / 다음 버튼 (끝에서 멈춤)
  // ======================================================
  DOM.modal.prev?.addEventListener("click", () => {
    if (currentIndex > 0) openModal(currentIndex - 1);
    else alert("이전 후기가 없습니다.");
  });

  DOM.modal.next?.addEventListener("click", () => {
    if (currentIndex < reviews.length - 1) openModal(currentIndex + 1);
    else alert("다음 후기가 없습니다.");
  });

  // ======================================================
  // 일정 상세 모달
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

    const routeTitle = `${departure} → ${recommendation.destinationName}`;

    container.innerHTML = `
      <section class="plan-header">
        <h1 class="destination-title">${routeTitle}</h1>
        <p class="destination-desc">${recommendation.destinationDescription}</p>
        <div class="plan-summary">
          <span>🗓️ 출발일: ${departureDate}</span>
          <span>👥 ${companionsType} (총 ${companions}명)</span>
          <span>💰 예산: ${budget.toLocaleString()} ${budgetUnit}</span>
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
  // 로컬스토리지 데이터 불러오기
  // ======================================================
  try {
    const saved = JSON.parse(localStorage.getItem("reviews"));
    reviews = Array.isArray(saved) ? saved : saved?.data?.reviews || [];
    renderReviews(reviews);
  } catch (e) {
    console.error("리뷰 데이터 파싱 오류:", e);
    DOM.reviewsContainer.innerHTML =
      "<p>리뷰 데이터를 불러오는 중 문제가 발생했습니다.</p>";
  }
});
