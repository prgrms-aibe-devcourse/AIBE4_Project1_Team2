document.addEventListener("DOMContentLoaded", () => {
  const planList = document.getElementById("planList");
  const modal = document.getElementById("planModal");
  const closeButton = modal.querySelector(".close-button");

  const modalTitle = modal.querySelector("#modalTitle");
  const modalInfo = modal.querySelector("#modalInfo");
  const modalDescription = modal.querySelector("#modalDescription");
  const modalTimeline = modal.querySelector("#modalTimeline");
  const modalNotes = modal.querySelector("#modalNotes");

  const prevBtn = modal.querySelector("#prevBtn");
  const nextBtn = modal.querySelector("#nextBtn");
  const reviewBtn = modal.querySelector("#modalReviewBtn");
  const deleteBtn = modal.querySelector("#modalDeleteBtn");

  let savedPlans = JSON.parse(localStorage.getItem("myAiPlans")) || [];
  let currentIndex = 0;

  if (!savedPlans.length) {
    planList.innerHTML = "<p>저장된 AI 일정이 없습니다.</p>";
    return;
  }

  /* ===========================================================
   * 1. 일정 카드 렌더링
   * =========================================================== */
  savedPlans.forEach((plan, index) => {
    const card = document.createElement("div");
    card.className = "plan-card";

    const dest = plan?.recommendation?.destinationName ?? "미정";

    card.innerHTML = `
      <h3 class="card-route">${plan.departure} → ${dest}</h3>
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
      navigateToReview(plan.planId);
    });

    card.querySelector(".btn-delete").addEventListener("click", (e) => {
      e.stopPropagation();
      handleDelete(plan.planId);
    });

    planList.appendChild(card);
  });

  /* ===========================================================
   * 2. 상세보기 모달 열기
   * =========================================================== */
  function openModal(index) {
    currentIndex = index;
    const plan = savedPlans[index];
    const rec = plan?.recommendation ?? {};

    modalTitle.innerHTML = `
      <div class="modal-route">
        ${plan.departure} → <span class="highlight-destination">${
      rec.destinationName || "미정"
    }</span>
      </div>
    `;

    modalInfo.innerHTML = `
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

    modalDescription.textContent = rec.destinationDescription || "";

    modalTimeline.innerHTML = (rec.itinerary || [])
      .map(
        (item) => `
          <div class="timeline-item">
            <div class="time">⏰${item.time || ""}</div>
            <div class="details">
              <div class="activity">🌳${item.activity || ""}</div>
              <div class="desc">${item.description || ""}</div>
              ${
                item.transportation
                  ? `<div class="transport">🚶‍♂️${item.transportation}</div>`
                  : ""
              }
            </div>
          </div>
        `
      )
      .join("");

    modalNotes.innerHTML = (rec.notes || [])
      .map((note) => `<li>${note}</li>`)
      .join("");

    modal
      .querySelector(".modal-content")
      .scrollTo({ top: 0, behavior: "auto" });
    modal.classList.add("active");
  }

  /* ===========================================================
   * 3. 모달 닫기
   * =========================================================== */
  closeButton.addEventListener("click", () => modal.classList.remove("active"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("active");
  });

  /* ===========================================================
   * 4. 이전 / 다음 버튼
   * =========================================================== */
  prevBtn?.addEventListener("click", () => {
    if (currentIndex > 0) openModal(currentIndex - 1);
    else alert("이전 일정이 없습니다.");
  });
  
  nextBtn?.addEventListener("click", () => {
    if (currentIndex < savedPlans.length - 1) openModal(currentIndex + 1);
    else alert("다음 일정이 없습니다.");
  });

  /* ===========================================================
   * 5. 후기 작성 / 일정 삭제
   * =========================================================== */
  function navigateToReview(planId) {
    localStorage.setItem("selectedPlanId", planId);
    window.location.href = "../review-form/review-form.html";
  }

  async function handleDelete(planId) {
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
        alert(result.message || "삭제 중 문제가 발생했습니다.");
        console.error("삭제 실패 응답:", result);
        return;
      }

      alert("삭제되었습니다.");

      savedPlans = savedPlans.filter((p) => p.planId !== planId);
      localStorage.setItem("myAiPlans", JSON.stringify(savedPlans));

      modal.classList.remove("active");

      const card = [...planList.children].find((el) =>
        el.innerHTML.includes(`후기 작성하기`)
      );
      if (card) card.remove();

      if (savedPlans.length === 0) {
        planList.innerHTML = "<p>저장된 AI 일정이 없습니다.</p>";
      }
    } catch (error) {
      console.error("서버 요청 중 오류:", error);
      alert("서버 연결 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  }
});
