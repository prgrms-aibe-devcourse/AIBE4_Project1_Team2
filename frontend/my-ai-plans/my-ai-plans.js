document.addEventListener("DOMContentLoaded", () => {
  // =============================
  // DOM 참조
  // =============================
  const DOM = {
    planList: document.getElementById("planList"),
    modal: document.getElementById("planModal"),
    closeButton: document.querySelector(".close-button"),
    modalTitle: document.getElementById("modalTitle"),
    modalInfo: document.getElementById("modalInfo"),
    modalDescription: document.getElementById("modalDescription"),
    modalTimeline: document.getElementById("modalTimeline"),
    modalNotes: document.getElementById("modalNotes"),
    prevBtn: document.getElementById("prevBtn"),
    nextBtn: document.getElementById("nextBtn"),
    reviewBtn: document.getElementById("modalReviewBtn"),
    deleteBtn: document.getElementById("modalDeleteBtn"),
  };

  let savedPlans = JSON.parse(localStorage.getItem("myAiPlans")) || [];
  let currentIndex = 0;

  // =============================
  // 일정이 없을 경우
  // =============================
  if (savedPlans.length === 0) {
    DOM.planList.innerHTML = "<p>저장된 AI 일정이 없습니다.</p>";
    return;
  }

  // =============================
  // 일정 카드 렌더링
  // =============================
  savedPlans.forEach((plan, index) => {
    const card = document.createElement("div");
    card.className = "plan-card";

    const destination = plan?.recommendation?.destinationName ?? "미정";

    card.innerHTML = `
      <h3 class="card-route">${plan.departure} → ${destination}</h3>
      <div class="plan-summary">
        <p>${plan.departureDate}</p>
        <p>${plan.companionsType} | 총 ${plan.companions}명</p>
        <p>${(plan.travelStyles || []).join(", ")}</p>
        <p>예산 약 ${Number(plan.budget || 0).toLocaleString()}${
      plan.budgetUnit || "원"
    }</p>
      </div>
      <div class="card-btns">
        <button class="btn-review">후기 작성하기</button>
        <button class="btn-delete">삭제하기</button>
      </div>
    `;

    // 카드 클릭 → 상세보기
    card.addEventListener("click", (e) => {
      if (e.target.tagName === "BUTTON") return;
      openModal(index);
    });

    // 후기 작성
    card.querySelector(".btn-review").addEventListener("click", (e) => {
      e.stopPropagation();
      goToReview(plan.planId);
    });

    // 삭제
    card.querySelector(".btn-delete").addEventListener("click", (e) => {
      e.stopPropagation();
      deletePlan(plan.planId);
    });

    DOM.planList.appendChild(card);
  });

  // =============================
  // 모달 열기
  // =============================
  function openModal(index) {
    currentIndex = index;
    const plan = savedPlans[index];
    const rec = plan?.recommendation ?? {};

    // 제목
    DOM.modalTitle.innerHTML = `
      <div class="modal-route">
        ${plan.departure} → <span class="highlight-destination">${
      rec.destinationName || "미정"
    }</span>
      </div>
    `;

    // 기본 정보
    DOM.modalInfo.innerHTML = `
      <div class="info-line">
        ${plan.departureDate}
        ${plan.companionsType} | 총 ${plan.companions}명
        예산 약 ${Number(plan.budget || 0).toLocaleString()}${
      plan.budgetUnit || "원"
    }
      </div>
      <div class="info-line">
        ${(plan.travelStyles || []).join(", ")}
      </div>
    `;

    // 여행지 설명
    DOM.modalDescription.textContent = rec.destinationDescription || "";

    // 일정 타임라인
    DOM.modalTimeline.innerHTML = Array.isArray(rec.itinerary)
      ? rec.itinerary
          .map(
            (item) => `
          <div class="timeline-item">
            <div class="time">${item.time || ""}</div>
            <div class="details">
              <div class="activity">${item.activity || ""}</div>
              <div class="desc">${item.description || ""}</div>
              ${
                item.transportation
                  ? `<div class="transport">교통: ${item.transportation}</div>`
                  : ""
              }
            </div>
          </div>`
          )
          .join("")
      : "<p>일정 정보가 없습니다.</p>";

    // 여행 팁
    DOM.modalNotes.innerHTML = Array.isArray(rec.notes)
      ? rec.notes.map((note) => `<li>${note}</li>`).join("")
      : "<li>추가 여행 팁이 없습니다.</li>";

    DOM.modal.querySelector(".modal-content").scrollTo({ top: 0 });
    DOM.modal.classList.add("active");
  }

  // =============================
  // 모달 닫기
  // =============================
  function closeModal() {
    DOM.modal.classList.remove("active");
  }
  DOM.closeButton.addEventListener("click", closeModal);
  DOM.modal.addEventListener("click", (e) => {
    if (e.target === DOM.modal) closeModal();
  });

  // =============================
  // 이전 / 다음 일정
  // =============================
  DOM.prevBtn?.addEventListener("click", () => {
    if (currentIndex > 0) openModal(currentIndex - 1);
    else alert("이전 일정이 없습니다.");
  });

  DOM.nextBtn?.addEventListener("click", () => {
    if (currentIndex < savedPlans.length - 1) openModal(currentIndex + 1);
    else alert("다음 일정이 없습니다.");
  });

  // =============================
  // 후기 작성
  // =============================
  function goToReview(planId) {
    localStorage.setItem("selectedPlanId", planId);
    window.location.href = "../review-form/review-form.html";
  }

  // =============================
  // 일정 삭제
  // =============================
  async function deletePlan(planId) {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(
        `https://aibe4-project1-team2-m9vr.onrender.com/my-plans/${planId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      const result = await response.json();
      if (!response.ok || !result.success) {
        console.error("삭제 실패 응답:", result);
        alert(result.message || "삭제 중 문제가 발생했습니다.");
        return;
      }

      alert("삭제되었습니다.");

      // 로컬 및 화면 갱신
      savedPlans = savedPlans.filter((p) => p.planId !== planId);
      localStorage.setItem("myAiPlans", JSON.stringify(savedPlans));
      closeModal();

      renderPlanList();
    } catch (error) {
      console.error("서버 요청 중 오류:", error);
      alert("서버 연결 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  }

  // =============================
  // 일정 목록 재렌더링
  // =============================
  function renderPlanList() {
    DOM.planList.innerHTML = "";
    if (!savedPlans.length) {
      DOM.planList.innerHTML = "<p>저장된 AI 일정이 없습니다.</p>";
      return;
    }

    savedPlans.forEach((plan, index) => {
      const card = document.createElement("div");
      card.className = "plan-card";

      const destination = plan?.recommendation?.destinationName ?? "미정";
      card.innerHTML = `
        <h3 class="card-route">${plan.departure} → ${destination}</h3>
        <div class="plan-summary">
          <p>${plan.departureDate}</p>
          <p>${plan.companionsType} | 총 ${plan.companions}명</p>
          <p>${(plan.travelStyles || []).join(", ")}</p>
          <p>예산 약 ${Number(plan.budget || 0).toLocaleString()}${
        plan.budgetUnit || "원"
      }</p>
        </div>
        <div class="card-btns">
          <button class="btn-review">후기 작성하기</button>
          <button class="btn-delete">삭제하기</button>
        </div>
      `;

      card.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON") return;
        openModal(index);
      });

      card.querySelector(".btn-review").addEventListener("click", (e) => {
        e.stopPropagation();
        goToReview(plan.planId);
      });

      card.querySelector(".btn-delete").addEventListener("click", (e) => {
        e.stopPropagation();
        deletePlan(plan.planId);
      });

      DOM.planList.appendChild(card);
    });
  }
});
