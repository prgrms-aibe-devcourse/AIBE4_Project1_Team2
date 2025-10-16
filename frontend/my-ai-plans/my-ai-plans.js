document.addEventListener("DOMContentLoaded", () => {
  const planList = document.getElementById("plan-list");
  const modal = document.getElementById("planModal");
  const closeButton = modal.querySelector(".close-button");

  const modalTitle = modal.querySelector("#modal-title");
  const modalInfo = modal.querySelector("#modal-info");
  const modalDescription = modal.querySelector("#modal-description");
  const modalTimeline = modal.querySelector("#modal-timeline");
  const modalNotes = modal.querySelector("#modal-notes");

  const prevBtn = modal.querySelector("#prevPlan");
  const nextBtn = modal.querySelector("#nextPlan");
  const reviewBtn = modal.querySelector("#modalReviewBtn");
  const deleteBtn = modal.querySelector("#modalDeleteBtn");

  let savedPlans = JSON.parse(localStorage.getItem("aiSchedules")) || [];
  let currentIndex = 0;

  // 저장된 일정이 없을 때
  if (!savedPlans.length) {
    planList.innerHTML = "<p>저장된 AI 일정이 없습니다.</p>";
    return;
  }

  /** ===============================
   * 카드 렌더링
   * =============================== */
  savedPlans.forEach((plan, index) => {
    const card = document.createElement("div");
    card.className = "plan-card";
    const dest = plan.recommendation.destinationName;

    card.innerHTML = `
      <h3>${plan.departure} → ${dest}</h3>
      <div class="plan-summary">
        ${plan.departureDate}<br>
        ${plan.companionsType} | 총 ${
      plan.companions
    }명 | ${plan.travelStyles.join(", ")}<br>
        예산 약 ${plan.budget.toLocaleString()}${plan.budgetUnit}
      </div>
      <div class="card-btns">
        <button class="btn-review">✏️ 후기 작성하기</button>
        <button class="btn-delete">🗑 삭제하기</button>
      </div>
    `;

    // 카드 클릭 → 상세 모달 열기
    card.addEventListener("click", (e) => {
      if (e.target.tagName === "BUTTON") return;
      openModal(index);
    });

    // 후기 버튼
    card.querySelector(".btn-review").addEventListener("click", (e) => {
      e.stopPropagation();
      navigateToReview(plan.planId);
    });

    // 삭제 버튼
    card.querySelector(".btn-delete").addEventListener("click", (e) => {
      e.stopPropagation();
      handleDelete(plan.planId);
    });

    planList.appendChild(card);
  });

  /** ===============================
   * 모달 열기 함수
   * =============================== */
  function openModal(index) {
    currentIndex = index;
    const plan = savedPlans[index];
    const rec = plan.recommendation;

    // 제목 & 정보
    modalTitle.innerHTML = `${plan.departure} → <span class="highlight-destination">${rec.destinationName}</span>`;
    modalInfo.textContent = `${plan.departureDate} | ${
      plan.companionsType
    } | 총 ${plan.companions}명 | ${plan.travelStyles.join(
      ", "
    )} | 예산 약 ${plan.budget.toLocaleString()}${plan.budgetUnit}`;
    modalDescription.textContent = rec.destinationDescription;

    // 일정
    modalTimeline.innerHTML = rec.itinerary
      .map(
        (item) => `
        <div class="timeline-item">
          <div class="time">${item.time}</div>
          <div class="details">
            <div class="activity">${item.activity}</div>
            <div>${item.description}</div>
            ${
              item.transportation
                ? `<div class="transport">🚗 ${item.transportation}</div>`
                : ""
            }
          </div>
        </div>
      `
      )
      .join("");

    // 여행 팁
    modalNotes.innerHTML = rec.notes.map((note) => `<li>${note}</li>`).join("");

    // 스크롤 맨 위로
    modal
      .querySelector(".modal-content")
      .scrollTo({ top: 0, behavior: "auto" });

    // 모달 활성화
    modal.classList.add("active");
  }

  /** ===============================
   * 모달 닫기
   * =============================== */
  closeButton.addEventListener("click", () => modal.classList.remove("active"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("active");
  });

  /** ===============================
   * 이전 / 다음 일정 보기
   * =============================== */
  prevBtn?.addEventListener("click", () => {
    if (currentIndex > 0) openModal(currentIndex - 1);
    else alert("이전 일정이 없습니다.");
  });

  /* ==================================================
     🔹 삭제 기능
  ================================================== */
  btnDelete.addEventListener("click", async () => {
    if (currentIndex === null) return;
    const confirmDelete = confirm("정말로 이 일정을 삭제하시겠습니까?");
    if (confirmDelete) {
      const response = await fetch(
        `https://aibe4-project1-team2-m9vr.onrender.com/mypage/my-review/${currentIndex}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json()
      console.log(data)
    } else return;

    schedules.splice(currentIndex, 1);
    localStorage.setItem("schedules", JSON.stringify(schedules));
    alert("삭제되었습니다.");
    closeModal();
    // renderScheduleCards();
  nextBtn?.addEventListener("click", () => {
    if (currentIndex < savedPlans.length - 1) openModal(currentIndex + 1);
    else alert("다음 일정이 없습니다.");
  });

  /** ===============================
   * 후기 작성 / 삭제 함수
   * =============================== */
  function navigateToReview(planId) {
    localStorage.setItem("selectedPlanId", planId);
    window.location.href = "../review-form/review-form.html";
  }

  function handleDelete(planId) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    savedPlans = savedPlans.filter((p) => p.planId !== planId);
    localStorage.setItem("aiSchedules", JSON.stringify(savedPlans));
    modal.classList.remove("active");
    location.reload();
  }

  reviewBtn?.addEventListener("click", () =>
    navigateToReview(savedPlans[currentIndex].planId)
  );
  deleteBtn?.addEventListener("click", () =>
    handleDelete(savedPlans[currentIndex].planId)
  );

  /** ===============================
   * 뒤로가기 버튼 (선택적)
   * =============================== */
  const backBtn = document.getElementById("btnBack");
  backBtn?.addEventListener("click", () => {
    window.location.href = "/AIBE4_Project1_Team2/index.html";
  });
});
