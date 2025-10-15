document.addEventListener("DOMContentLoaded", () => {
  // 🔹 실제 사용 시 localStorage에서 불러오기
  // let schedules = JSON.parse(localStorage.getItem("schedules")) || [];

  // 🔹 테스트용 목업 데이터
  let schedules = [
    {
      text: {
        departure: "청주",
        departureDate: "2025-10-19",
        companionsType: "친구",
        companions: "5",
        travelStyles: ["힐링", "먹방여행"],
        recommendation: {
          destinationName: "강릉",
          destinationDescription:
            "청주에서 약 2시간 30분~3시간 거리에 위치한 강릉은 동해의 아름다운 바다와 풍부한 해산물, 그리고 고유한 문화와 카페거리까지 완벽한 힐링과 먹방 여행지입니다.",
          itinerary: [
            { time: "07:00", activity: "청주 출발", transportation: "자가용" },
            {
              time: "10:00",
              activity: "강릉 안목해변 카페거리 도착",
              transportation: "도보",
            },
          ],
          notes: ["자가용 이동이 편리합니다.", "카페거리가 특히 유명합니다."],
        },
      },
    },
  ];

  const listContainer = document.getElementById("scheduleList");
  const modalOverlay = document.getElementById("scheduleModal");
  const modalDetails = document.getElementById("modalDetails");
  const closeButton = modalOverlay.querySelector(".close-button");
  const btnDelete = document.getElementById("btnDelete");
  const btnReview = document.getElementById("btnReview");

  let currentIndex = null;

  renderScheduleCards();

  // 카드 렌더링
  function renderScheduleCards() {
    listContainer.innerHTML = "";

    if (!schedules.length) {
      listContainer.innerHTML = "<p>저장된 일정이 없습니다.</p>";
      return;
    }

    schedules.forEach((item, index) => {
      const trip = item.text;
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

  // 상세보기 모달 열기
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

  // 닫기
  closeButton.addEventListener("click", () => {
    modalOverlay.classList.remove("active");
  });
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.remove("active");
  });

  // 🗑 삭제하기
  btnDelete.addEventListener("click", () => {
    if (currentIndex === null) return;
    const confirmDelete = confirm("정말로 이 일정을 삭제하시겠습니까?");
    if (!confirmDelete) return;

    schedules.splice(currentIndex, 1);
    localStorage.setItem("schedules", JSON.stringify(schedules));
    alert("삭제되었습니다.");
    modalOverlay.classList.remove("active");
    renderScheduleCards();
  });

  // ✍️ 리뷰 작성하기
  btnReview.addEventListener("click", () => {
    if (currentIndex === null) return;
    const trip = schedules[currentIndex].text;
    localStorage.setItem("selectedScheduleForReview", JSON.stringify(trip));
    alert("리뷰 작성 페이지로 이동합니다.");
    window.location.href = "../review-form/review-form.html";
  });
});

function goBack() {
  window.location.href = "../reviews/reviews.html";
}
