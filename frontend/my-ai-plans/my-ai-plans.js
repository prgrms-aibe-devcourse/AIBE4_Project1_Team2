document.addEventListener("DOMContentLoaded", () => {
  // 🔹 실제 사용 시 localStorage에서 불러오기
  let schedules = JSON.parse(localStorage.getItem("schedules")) || [];

  // 🔹 테스트용 목업 데이터 (비밀번호 1234)
  // ⚠️ 이제는 자동으로 넣지 않음 — localStorage가 비어 있으면 아무것도 안 보여줌
  // if (!schedules.length) { ... } 제거됨

  /* ==================================================
     🔹 요소 참조
  ================================================== */
  const listContainer = document.getElementById("scheduleList");
  const modalOverlay = document.getElementById("scheduleModal");
  const modalDetails = document.getElementById("modalDetails");
  const closeButton = modalOverlay.querySelector(".close-button");
  const btnDelete = document.getElementById("btnDelete");
  const btnReview = document.getElementById("btnReview");

  let currentIndex = null;

  renderScheduleCards();

  /* ==================================================
     🔹 카드 목록 렌더링
  ================================================== */
  function renderScheduleCards() {
    listContainer.innerHTML = "";

    // ⚙️ localStorage가 비어 있으면 아무것도 표시하지 않음
    if (!schedules.length) return;

    schedules.forEach((item, index) => {
      const trip = item.text || item;
      const card = document.createElement("div");
      card.classList.add("schedule-card");
      card.innerHTML = `
        <h3>${trip.departure} → ${trip.recommendation.destinationName}</h3>
        <div class="schedule-info">
          <p>📅 ${trip.departureDate}</p>
          <p>👥 ${trip.companionsType} (${trip.companions}명)</p>
          <p>🎨 ${trip.travelStyles.join(", ")}</p>
        </div>
      `;
      card.addEventListener("click", () => openModal(trip, index));
      listContainer.appendChild(card);
    });
  }

  /* ==================================================
     🔹 상세 모달 열기
  ================================================== */
  function openModal(trip, index) {
    currentIndex = index;

    const itineraryHTML = trip.recommendation.itinerary
      .map(
        (i) => `
        <div class="timeline-item">
          <div class="time">${i.time}</div>
          <div class="activity">${i.activity}</div>
          <div class="transport">🚗 ${i.transportation}</div>
        </div>`
      )
      .join("");

    const notesHTML = trip.recommendation.notes
      .map((n) => `<li>${n}</li>`)
      .join("");

    modalDetails.innerHTML = `
      <h2>${trip.departure} → ${trip.recommendation.destinationName}</h2>
      <p>${trip.recommendation.destinationDescription}</p>

      <div class="timeline">${itineraryHTML}</div>

      <div class="notes-section">
        <h3>💡 여행 팁</h3>
        <ul>${notesHTML}</ul>
      </div>
    `;

    modalOverlay.classList.add("active");
  }

  /* ==================================================
     🔹 모달 닫기 이벤트
  ================================================== */
  closeButton.addEventListener("click", () => closeModal());
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  function closeModal() {
    modalOverlay.classList.remove("active");
    currentIndex = null;
  }

  /* ==================================================
     🔹 삭제 기능
  ================================================== */
  btnDelete.addEventListener("click", async () => {
    if (currentIndex === null) return;
    const confirmDelete = confirm("정말로 이 일정을 삭제하시겠습니까?");
    if (confirmDelete) {
      const response = await fetch(
        `https://aibe4-project1-team2-1y2x.onrender.com/mypage/my-review/${currentIndex}`,
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
  });

  /* ==================================================
     🔹 리뷰 작성 기능
  ================================================== */
  btnReview.addEventListener("click", () => {
    if (currentIndex === null) return;
    const trip = schedules[currentIndex].text || schedules[currentIndex];
    localStorage.setItem("selectedScheduleForReview", JSON.stringify(trip));
    alert("리뷰 작성 페이지로 이동합니다.");
    window.location.href = "../review-form/review-form.html";
  });
});

/* ==================================================
   🔹 돌아가기 버튼
================================================== */
function goBack() {
  window.location.href = "../reviews/reviews.html";
}
