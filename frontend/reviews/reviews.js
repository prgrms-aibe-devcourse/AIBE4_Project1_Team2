document.addEventListener("DOMContentLoaded", () => {
  /* ======================================================
     1. 상수 및 DOM 캐싱
  ====================================================== */
  const API_BASE = "https://aibe4-project1-team2-m9vr.onrender.com";

  const DOM = {
    reviewsContainer: document.getElementById("reviewsContainer"),
    modal: {
      overlay: document.getElementById("reviewModal"),
      closeButton: document
        .getElementById("reviewModal")
        .querySelector(".close-button"),
      title: document.getElementById("modalTitle"),
      rate: document.getElementById("modalRate"),
      body: document
        .getElementById("reviewModal")
        .querySelector(".review-body"),
      prev: document.getElementById("prevBtn"),
      next: document.getElementById("nextBtn"),
      planBtn: document.getElementById("viewPlan"),
    },
  };

  let reviews = [];
  let currentIndex = -1;

  /* ======================================================
     2. 유틸 함수
  ====================================================== */
  const stripHTML = (html = "") => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return (div.textContent || div.innerText || "").trim();
  };

  const stars = (n = 0) =>
    "★".repeat(Math.min(5, Math.max(0, Number(n)))) +
    "☆".repeat(5 - Math.min(5, Math.max(0, Number(n))));

  const snippet = (text = "", max = 120) => {
    const clean = stripHTML(text);
    return clean.length > max ? `${clean.slice(0, max).trim()} …` : clean;
  };

  const lockScroll = () => (document.body.style.overflow = "hidden");
  const unlockScroll = () => (document.body.style.overflow = "");

  const showAlert = (msg) => alert(msg);

  /* ======================================================
     3. 로컬 데이터 로드
  ====================================================== */
  const loadReviews = () => {
    try {
      const raw = localStorage.getItem("reviews");
      const parsed = JSON.parse(raw || "[]");
      if (Array.isArray(parsed)) return parsed;
      if (parsed?.data?.reviews && Array.isArray(parsed.data.reviews))
        return parsed.data.reviews;
      return [];
    } catch (e) {
      console.error("후기 데이터 파싱 오류:", e);
      return [];
    }
  };

  /* ======================================================
     4. 리뷰 카드 렌더링
  ====================================================== */
  function createReviewCard(review, index) {
    const card = document.createElement("article");
    card.className = "review-card";
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute(
      "aria-label",
      `${review?.title || "제목 없음"} 후기 열기`
    );

    const imgSrc = review?.img_path || "../public/images/default-trip.jpg";
    const title = review?.title || "제목 없음";
    const rate = Number(review?.rate) || 0;

    card.innerHTML = `
      <h3 class="card-title">${title}</h3>
      <div class="card-image"><img src="${imgSrc}" alt="${title} 이미지"></div>
      <div class="card-rate">${stars(rate)}</div>
      <p class="card-snippet">${snippet(review?.content, 130)}</p>
    `;

    const open = () => openModal(index);
    card.addEventListener("click", open);
    card.addEventListener("keyup", (e) => {
      if (["Enter", " "].includes(e.key)) open();
    });

    return card;
  }

  function renderReviews(list) {
    const container = DOM.reviewsContainer;
    container.innerHTML = "";

    if (!Array.isArray(list) || list.length === 0) {
      container.innerHTML = "<p>표시할 후기가 없습니다.</p>";
      return;
    }

    list.forEach((r, i) => container.appendChild(createReviewCard(r, i)));
  }

  /* ======================================================
     5. 후기 상세 모달
  ====================================================== */
  function openModal(index) {
    const r = reviews[index];
    if (!r) return;

    currentIndex = index;

    const imgSrc = r?.img_path || "../public/images/default-trip.jpg";
    const title = r?.title || "제목 없음";
    const rate = Number(r?.rate) || 0;
    const content = stripHTML(r?.content || "내용이 없습니다.");

    DOM.modal.title.textContent = "";
    DOM.modal.rate.textContent = "";
    DOM.modal.body.innerHTML = `
      <h2 class="modal-title-text">${title}</h2>
      <img class="modal-image" src="${imgSrc}" alt="${title} 이미지">
      <div class="modal-rate">${stars(rate)}</div>
      <hr class="modal-divider">
      <div class="review-text">${content}</div>
    `;

    DOM.modal.prev.onclick = () => navigate(-1);
    DOM.modal.next.onclick = () => navigate(1);
    DOM.modal.planBtn.onclick = () => handlePlanClick(r);

    DOM.modal.overlay.classList.add("active");
    lockScroll();
    document.addEventListener("keydown", keyHandler);
  }

  function closeModal() {
    DOM.modal.overlay.classList.remove("active");
    unlockScroll();
    document.removeEventListener("keydown", keyHandler);
  }

  function keyHandler(e) {
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft") navigate(-1);
    if (e.key === "ArrowRight") navigate(1);
  }

  function navigate(dir) {
    if (!reviews.length) return;

    const next = currentIndex + dir;
    if (next < 0) return showAlert("이전 후기가 없습니다.");
    if (next >= reviews.length) return showAlert("다음 후기가 없습니다.");
    openModal(next);
  }

  DOM.modal.closeButton.addEventListener("click", closeModal);
  DOM.modal.overlay.addEventListener("click", (e) => {
    if (e.target === DOM.modal.overlay) closeModal();
  });

  /* ======================================================
     6. 일정 모달
  ====================================================== */
  const planModal = document.createElement("div");
  planModal.className = "modal-overlay";
  planModal.innerHTML = `
    <div class="modal-content plan-result-modal">
      <button class="close-button">&times;</button>
      <div id="plan-container" class="plan-container"></div>
    </div>`;
  document.body.appendChild(planModal);

  const closePlanModal = () => {
    planModal.classList.remove("active");
    unlockScroll();
    document.removeEventListener("keydown", planKeyHandler);
  };
  const planKeyHandler = (e) => e.key === "Escape" && closePlanModal();

  planModal
    .querySelector(".close-button")
    .addEventListener("click", closePlanModal);
  planModal.addEventListener("click", (e) => {
    if (e.target === planModal) closePlanModal();
  });

  function showPlanModal(plan) {
    const container = planModal.querySelector("#plan-container");
    const {
      departure,
      companions,
      companionsType,
      travelStyles = [],
      recommendation = {},
      departureDate,
    } = plan;

    const route = `${departure} → ${recommendation.destinationName || ""}`;
    const estimated = recommendation.estimatedBudget || {};
    const budget =
      estimated.min && estimated.max && estimated.unit
        ? `${Number(estimated.min).toLocaleString()} ~ ${Number(
            estimated.max
          ).toLocaleString()} ${estimated.unit}`
        : "-";

    container.innerHTML = `
      <section class="plan-header">
        <h1 class="destination-title">${route}</h1>
        <p class="destination-desc">${
          recommendation.destinationDescription || ""
        }</p>
        <div class="plan-summary">
          <span>📅 출발일: ${departureDate || "-"}</span>
          <span>👥 ${companionsType || "-"} (${companions ?? "-"}명)</span>
          <span>💰 예산: ${budget}</span>
          <span>🎨 여행 스타일: ${
            Array.isArray(travelStyles) ? travelStyles.join(", ") : "-"
          }</span>
        </div>
      </section>
      <section class="plan-itinerary-section">
        <h2>🗓️ 여행 일정</h2>
        <div class="plan-cards">
          ${
            Array.isArray(recommendation.itinerary)
              ? recommendation.itinerary
                  .map(
                    (i) => `
              <div class="plan-card">
                <h3>${i.time || ""}</h3>
                <p class="activity">${i.activity || ""}</p>
                <p class="desc">${i.description || ""}</p>
                <p class="transport">🚗 ${i.transportation || ""}</p>
              </div>`
                  )
                  .join("")
              : "<p>일정 정보가 없습니다.</p>"
          }
        </div>
      </section>
      <section class="plan-notes-section">
        <h2>💡 AI 추천 메모</h2>
        <ul class="plan-notes">
          ${
            Array.isArray(recommendation.notes)
              ? recommendation.notes
                  .map((n) => `<li>${stripHTML(n)}</li>`)
                  .join("")
              : "<li>메모가 없습니다.</li>"
          }
        </ul>
      </section>
    `;

    planModal.classList.add("active");
    lockScroll();
    document.addEventListener("keydown", planKeyHandler);
  }

  /* ======================================================
     7. 일정 확인 버튼 클릭 처리
  ====================================================== */
  async function handlePlanClick(review) {
    try {
      const reviewId = review?.reviewId;
      if (!reviewId) return showAlert("리뷰 ID가 존재하지 않습니다.");

      const storedReviews = loadReviews();
      const matched = storedReviews.find(
        (r) => String(r.reviewId) === String(reviewId)
      );
      const planId = matched?.planId ?? matched?.ai?.planId;
      if (!planId && planId !== 0)
        return showAlert("이 후기에는 연결된 일정이 없습니다.");

      DOM.modal.planBtn.disabled = true;
      DOM.modal.planBtn.textContent = "불러오는 중...";

      const res = await fetch(`${API_BASE}/plan/${encodeURIComponent(planId)}`);
      const result = await res.json();

      if (!res.ok || !result?.success || !result?.data)
        throw new Error(result?.message || "일정 정보를 불러오지 못했습니다.");

      showPlanModal(result.data);
    } catch (err) {
      console.error("일정 조회 오류:", err);
      showAlert("일정 정보를 불러오는 중 문제가 발생했습니다.");
    } finally {
      DOM.modal.planBtn.disabled = false;
      DOM.modal.planBtn.textContent = "일정 확인하기";
    }
  }

  /* ======================================================
     8. 초기 실행
  ====================================================== */
  reviews = loadReviews();
  renderReviews(reviews);
});
